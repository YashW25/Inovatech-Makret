import express from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getDb } from '../db/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/sellers/profile
 * Get seller profile
 */
router.get('/profile', requireRole('seller'), async (req, res, next) => {
  try {
    const db = getDb();
    const seller = db.prepare(`
      SELECT s.*, u.email, u.is_verified
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `).get(req.user.id);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/sellers/profile
 * Update seller profile
 */
router.put('/profile', requireRole('seller'), async (req, res, next) => {
  try {
    const schema = z.object({
      storeName: z.string().min(1).optional(),
      storeDescription: z.string().optional()
    });

    const data = schema.parse(req.body);
    const db = getDb();

    const updates = [];
    const values = [];

    if (data.storeName) {
      updates.push('store_name = ?');
      values.push(data.storeName);
    }

    if (data.storeDescription !== undefined) {
      updates.push('store_description = ?');
      values.push(data.storeDescription);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    db.prepare(`
      UPDATE sellers 
      SET ${updates.join(', ')}
      WHERE user_id = ?
    `).run(...values);

    const seller = db.prepare(`
      SELECT s.*, u.email, u.is_verified
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ?
    `).get(req.user.id);

    res.json({ seller });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sellers/stats
 * Get seller statistics
 */
router.get('/stats', requireRole('seller'), async (req, res, next) => {
  try {
    const db = getDb();
    const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Get stats
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE seller_id = ?').get(seller.id);
    const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE seller_id = ?').get(seller.id);
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE seller_id = ? AND status != "cancelled"').get(seller.id);
    const commissionOwed = db.prepare('SELECT commission_owed FROM sellers WHERE id = ?').get(seller.id);

    res.json({
      products: productCount.count,
      orders: orderCount.count,
      revenue: totalRevenue.total,
      commissionOwed: commissionOwed.commission_owed
    });
  } catch (error) {
    next(error);
  }
});

export default router;

