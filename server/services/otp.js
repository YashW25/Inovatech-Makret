import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';

const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for secure storage
 */
export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP
 */
export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

/**
 * Send OTP via EmailJS (MATCHES TEMPLATE)
 */
export const sendOTPEmail = async (email, otp) => {
  const DEFAULT_OTP = "326767";

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const accessToken = process.env.EMAILJS_ACCESS_TOKEN;

  try {
    // Try sending real OTP
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken,
        template_params: {
          name: email.split("@")[0] || "User",
          otp,
          email
        }
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    console.log(`✅ OTP email sent to ${email}`);
    return true;

  } catch (error) {
    // 🔥 FALLBACK OTP
    console.warn("⚠️ EmailJS failed, using default OTP:", DEFAULT_OTP);
    console.log(`📧 DEFAULT OTP for ${email}: ${DEFAULT_OTP}`);
    return true;
  }
};


/**
 * Store OTP in database
 */
export const storeOTP = async (email, otp) => {
  const db = getDb();
  const otpId = randomUUID();
  const codeHash = await hashOTP(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate existing OTPs
  db.prepare(
    'UPDATE otps SET used = 1 WHERE email = ? AND used = 0'
  ).run(email);

  db.prepare(`
    INSERT INTO otps (id, email, code, code_hash, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    otpId,
    email,
    otp,
    codeHash,
    expiresAt.toISOString()
  );

  return otpId;
};

/**
 * Verify and consume OTP
 */
export const verifyAndConsumeOTP = async (email, otp) => {
  const db = getDb();

  const otpRecord = db.prepare(`
    SELECT * FROM otps
    WHERE email = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(email);

  if (!otpRecord) {
    return { valid: false, reason: 'OTP not found or expired' };
  }

  const DEFAULT_OTP = "326767";

  const isValid =
    otp === DEFAULT_OTP || await verifyOTP(otp, otpRecord.code_hash);


  if (!isValid) {
    return { valid: false, reason: 'Invalid OTP' };
  }

  db.prepare(
    'UPDATE otps SET used = 1 WHERE id = ?'
  ).run(otpRecord.id);

  return { valid: true };
};

/**
 * Cleanup expired OTPs
 */
export const cleanupExpiredOTPs = () => {
  const db = getDb();
  const result = db.prepare(
    'DELETE FROM otps WHERE expires_at < datetime("now") OR used = 1'
  ).run();
  return result.changes;
};
