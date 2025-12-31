import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getDb } from '../db/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/profile
 * Get user profile
 */
router.get('/profile', async (req, res, next) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, email, role, is_verified, created_at FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;

