import { randomUUID } from 'crypto';
import express from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { getDb } from '../db/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    bargainOfferId: z.string().uuid().optional()
  })).min(1),
  paymentMethod: z.enum(['cod', 'online'])
});

/**
 * POST /api/orders
 * Create order (customer)
 */
router.post('/', requireRole('customer'), async (req, res, next) => {
  try {
    const { items, paymentMethod } = createOrderSchema.parse(req.body);
    const db = getDb();

    // Validate products and calculate total
    let totalAmount = 0;
    const sellerIds = new Set();

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.productId);
      
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }

      // If bargain offer, verify it's accepted
      if (item.bargainOfferId) {
        const offer = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(item.bargainOfferId);
        if (!offer || offer.status !== 'accepted' || offer.customer_id !== req.user.id) {
          return res.status(400).json({ error: 'Invalid bargain offer' });
        }
        totalAmount += offer.offer_price * item.quantity;
      } else {
        totalAmount += item.price * item.quantity;
      }

      sellerIds.add(product.seller_id);
    }

    // For now, support single seller orders
    if (sellerIds.size > 1) {
      return res.status(400).json({ error: 'Multi-seller orders not yet supported' });
    }

    const sellerId = Array.from(sellerIds)[0];

    // Create order
    const orderId = randomUUID();
    db.prepare(`
      INSERT INTO orders (id, customer_id, seller_id, total_amount, status, payment_method, items)
      VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).run(orderId, req.user.id, sellerId, totalAmount, paymentMethod, JSON.stringify(items));

    // Update stock
    for (const item of items) {
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.productId);
    }

    // Calculate commission
    const platformSettings = db.prepare('SELECT value FROM platform_settings WHERE key = ?').get('commissionRate');
    const commissionRate = platformSettings ? JSON.parse(platformSettings.value) : 10;
    const commission = totalAmount * (commissionRate / 100);

    // Update seller commission
    db.prepare('UPDATE sellers SET commission_owed = commission_owed + ? WHERE id = ?').run(commission, sellerId);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const parsed = {
      ...order,
      items: JSON.parse(order.items)
    };

    res.status(201).json({ order: parsed });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/my-orders
 * Get customer's orders
 */
router.get('/my-orders', requireRole('customer'), async (req, res, next) => {
  try {
    const db = getDb();
    const orders = db.prepare(`
      SELECT o.*, s.store_name
      FROM orders o
      JOIN sellers s ON o.seller_id = s.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `).all(req.user.id);

    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));

    res.json({ orders: parsed });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/seller/orders
 * Get seller's orders
 */
router.get('/seller/orders', requireRole('seller'), async (req, res, next) => {
  try {
    const db = getDb();
    const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

    const orders = db.prepare(`
      SELECT o.*, u.email as customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.seller_id = ?
      ORDER BY o.created_at DESC
    `).all(seller.id);

    const parsed = orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));

    res.json({ orders: parsed });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status (seller)
 */
router.put('/:id/status', requireRole('seller'), async (req, res, next) => {
  try {
    const { status } = z.object({
      status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    }).parse(req.body);

    const db = getDb();
    const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

    const order = db.prepare('SELECT * FROM orders WHERE id = ? AND seller_id = ?').get(req.params.id, seller.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    const parsed = {
      ...updated,
      items: JSON.parse(updated.items)
    };

    res.json({ order: parsed });
  } catch (error) {
    next(error);
  }
});

export default router;

