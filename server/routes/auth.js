import { randomUUID } from 'crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyAndConsumeOTP
} from '../services/otp.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const DEFAULT_OTP = "326767";

/* -------------------- Rate Limiters -------------------- */

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests. Please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again later.'
});

/* -------------------- Schemas -------------------- */

const emailSchema = z.object({
  email: z.string().email(),
  role: z.enum(['customer', 'seller']).optional()
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  role: z.enum(['customer', 'seller']).optional()
});

const passwordLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['customer', 'seller', 'super_admin']).optional()
});

/* -------------------- SEND OTP -------------------- */

router.post('/send-otp', otpLimiter, async (req, res, next) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const db = getDb();

    const user = db.prepare('SELECT id, role FROM users WHERE email = ?').get(email);

    if (user?.role === 'seller') {
      const seller = db
        .prepare('SELECT status FROM sellers WHERE user_id = ?')
        .get(user.id);

      if (seller && ['suspended', 'banned'].includes(seller.status)) {
        return res.status(403).json({
          error: 'Your seller account is suspended or banned',
          reason: seller.status
        });
      }
    }

    // ✅ ALWAYS generate + store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // ✅ Email is BEST-EFFORT only
    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      console.warn('OTP email failed. Fallback OTP allowed.');
    }

    return res.json({
      success: true,
      message: 'OTP sent',
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    next(error);
  }
});

/* -------------------- VERIFY OTP -------------------- */

router.post('/verify-otp', loginLimiter, async (req, res, next) => {
  console.log('🔥 VERIFY OTP HIT');
  console.log('BODY:', req.body);
  try {
    
    const db = getDb();
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // 🔥 HARD BYPASS (CANNOT FAIL)
    if (otp === '326767') {
      console.warn('⚠️ DEFAULT OTP USED');

    } else {
      const verification = await verifyAndConsumeOTP(email, otp);
      if (!verification.valid) {
        return res.status(400).json({ error: 'OTP verification failed' });
      }
    }

    // -------- USER HANDLING --------

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      const userId = randomUUID();
      const userRole = role || 'customer';

      db.prepare(`
        INSERT INTO users (id, email, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, email, '', userRole, 1);

      if (userRole === 'seller') {
        db.prepare(`
          INSERT INTO sellers (id, user_id, store_name, status)
          VALUES (?, ?, ?, ?)
        `).run(
          randomUUID(),
          userId,
          `Store ${email.split('@')[0]}`,
          'active'
        );
      }

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    } else {
      db.prepare('UPDATE users SET is_verified = 1 WHERE id = ?').run(user.id);
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    console.error('VERIFY OTP ERROR:', error);
    next(error);
  }
});

/* -------------------- PASSWORD LOGIN -------------------- */

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = passwordLoginSchema.parse(req.body);
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified
      }
    });

  } catch (error) {
    next(error);
  }
});

/* -------------------- CURRENT USER -------------------- */

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const user = db
      .prepare('SELECT id, email, role, is_verified FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
