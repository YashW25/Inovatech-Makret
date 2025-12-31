import express from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getDb } from '../db/index.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// All routes require super admin
router.use(authenticate);
router.use(requireRole('super_admin'));

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const db = getDb();

    const stats = {
      totalRevenue: db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != "cancelled"').get().total,
      activeSellers: db.prepare('SELECT COUNT(*) as count FROM sellers WHERE status = "active"').get().count,
      totalProducts: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count,
      totalCustomers: db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "customer"').get().count,
      pendingSellers: db.prepare('SELECT COUNT(*) as count FROM sellers WHERE status = "suspended"').get().count
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/sellers
 * Get all sellers
 */
router.get('/sellers', async (req, res, next) => {
  try {
    const db = getDb();
    const sellers = db.prepare(`
      SELECT s.*, u.email, u.is_verified, u.created_at
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `).all();

    res.json({ sellers });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/sellers/:id/status
 * Update seller status
 */
router.put('/sellers/:id/status', async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['active', 'suspended', 'banned'])
    }).parse(req.body);

    const db = getDb();
    db.prepare('UPDATE sellers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    const seller = db.prepare(`
      SELECT s.*, u.email, u.is_verified
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(req.params.id);

    res.json({ seller });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/settings
 * Get platform settings
 */
router.get('/settings', async (req, res, next) => {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM platform_settings').all();

    const parsed = {};
    for (const setting of settings) {
      parsed[setting.key] = JSON.parse(setting.value);
    }

    res.json({ settings: parsed });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings
 * Update platform settings
 */
router.put('/settings', async (req, res, next) => {
  try {
    const settings = z.record(z.any()).parse(req.body);
    const db = getDb();

    for (const [key, value] of Object.entries(settings)) {
      db.prepare(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `).run(key, JSON.stringify(value));
    }

    const updated = db.prepare('SELECT * FROM platform_settings').all();
    const parsed = {};
    for (const setting of updated) {
      parsed[setting.key] = JSON.parse(setting.value);
    }

    res.json({ settings: parsed });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/sellers/:id/suspend-unpaid
 * Auto-suspend seller for unpaid commission
 */
router.post('/sellers/:id/suspend-unpaid', async (req, res, next) => {
  try {
    const db = getDb();
    const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Check if commission is overdue (example: > 30 days)
    const daysOverdue = 30;
    const lastPayment = seller.last_payment_date 
      ? new Date(seller.last_payment_date) 
      : new Date(seller.created_at);
    const daysSincePayment = (Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24);

    if (seller.commission_owed > 0 && daysSincePayment > daysOverdue) {
      db.prepare('UPDATE sellers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run('suspended', req.params.id);

      const updated = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
      res.json({ seller: updated, suspended: true, reason: 'Unpaid commission' });
    } else {
      res.json({ seller, suspended: false });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

