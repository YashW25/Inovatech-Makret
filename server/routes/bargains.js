import {
    randomUUID
} from 'crypto';
import express from 'express';
import {
    z
} from 'zod';
import {
    authenticate,
    requireRole
} from '../middleware/auth.js';
import {
    getDb
} from '../db/index.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

const bargainOfferSchema = z.object({
    productId: z.string().uuid(),
    offerPrice: z.number().positive()
});

const counterOfferSchema = z.object({
    counterPrice: z.number().positive()
});

/**
 * POST /api/bargains/offer
 * Create a bargain offer (customer)
 */
router.post('/offer', requireRole('customer'), async (req, res, next) => {
    try {
        const {
            productId,
            offerPrice
        } = bargainOfferSchema.parse(req.body);
        const db = getDb();

        // Get product
        const product = db.prepare(`
      SELECT p.*, s.id as seller_id, s.status as seller_status
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = ? AND p.is_active = 1 AND s.status = 'active'
    `).get(productId);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        if (!product.allow_bargain) {
            return res.status(400).json({
                error: 'Bargaining not allowed for this product'
            });
        }

        if (offerPrice >= product.price) {
            return res.status(400).json({
                error: 'Offer price must be less than product price'
            });
        }

        if (product.min_bargain_price && offerPrice < product.min_bargain_price) {
            return res.status(400).json({
                error: `Offer price must be at least $${product.min_bargain_price}`
            });
        }

        // Create offer
        const offerId = randomUUID();
        db.prepare(`
      INSERT INTO bargain_offers (id, product_id, customer_id, seller_id, offer_price, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(offerId, productId, req.user.id, product.seller_id, offerPrice);

        const offer = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(offerId);

        res.status(201).json({
            offer
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/bargains/my-offers
 * Get customer's bargain offers
 */
router.get('/my-offers', requireRole('customer'), async (req, res, next) => {
    try {
        const db = getDb();
        const offers = db.prepare(`
      SELECT bo.*, p.name as product_name, p.price as product_price, s.store_name
      FROM bargain_offers bo
      JOIN products p ON bo.product_id = p.id
      JOIN sellers s ON bo.seller_id = s.id
      WHERE bo.customer_id = ?
      ORDER BY bo.created_at DESC
    `).all(req.user.id);

        res.json({
            offers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/bargains/seller/requests
 * Get seller's bargain requests
 */
router.get('/seller/requests', requireRole('seller'), async (req, res, next) => {
    try {
        const db = getDb();
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

        const offers = db.prepare(`
      SELECT bo.*, p.name as product_name, p.price as product_price, u.email as customer_email
      FROM bargain_offers bo
      JOIN products p ON bo.product_id = p.id
      JOIN users u ON bo.customer_id = u.id
      WHERE bo.seller_id = ? AND bo.status = 'pending'
      ORDER BY bo.created_at DESC
    `).all(seller.id);

        res.json({
            offers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/bargains/:id/accept
 * Accept bargain offer (seller)
 */
router.post('/:id/accept', requireRole('seller'), async (req, res, next) => {
    try {
        const db = getDb();
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

        const offer = db.prepare('SELECT * FROM bargain_offers WHERE id = ? AND seller_id = ?').get(req.params.id, seller.id);

        if (!offer) {
            return res.status(404).json({
                error: 'Offer not found'
            });
        }

        if (offer.status !== 'pending') {
            return res.status(400).json({
                error: 'Offer already processed'
            });
        }

        // Update offer status
        db.prepare('UPDATE bargain_offers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('accepted', req.params.id);

        const updated = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(req.params.id);

        res.json({
            offer: updated
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/bargains/:id/reject
 * Reject bargain offer (seller)
 */
router.post('/:id/reject', requireRole('seller'), async (req, res, next) => {
    try {
        const db = getDb();
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

        const offer = db.prepare('SELECT * FROM bargain_offers WHERE id = ? AND seller_id = ?').get(req.params.id, seller.id);

        if (!offer) {
            return res.status(404).json({
                error: 'Offer not found'
            });
        }

        if (offer.status !== 'pending') {
            return res.status(400).json({
                error: 'Offer already processed'
            });
        }

        db.prepare('UPDATE bargain_offers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('rejected', req.params.id);

        const updated = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(req.params.id);

        res.json({
            offer: updated
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/bargains/:id/counter
 * Counter bargain offer (seller)
 */
router.post('/:id/counter', requireRole('seller'), async (req, res, next) => {
    try {
        const {
            counterPrice
        } = counterOfferSchema.parse(req.body);
        const db = getDb();
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

        const offer = db.prepare('SELECT * FROM bargain_offers WHERE id = ? AND seller_id = ?').get(req.params.id, seller.id);

        if (!offer) {
            return res.status(404).json({
                error: 'Offer not found'
            });
        }

        if (offer.status !== 'pending') {
            return res.status(400).json({
                error: 'Offer already processed'
            });
        }

        // Get product to validate counter price
        const product = db.prepare('SELECT price FROM products WHERE id = ?').get(offer.product_id);
        if (counterPrice >= product.price) {
            return res.status(400).json({
                error: 'Counter price must be less than product price'
            });
        }

        if (counterPrice <= offer.offer_price) {
            return res.status(400).json({
                error: 'Counter price must be higher than offer price'
            });
        }

        db.prepare('UPDATE bargain_offers SET status = ?, counter_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run('countered', counterPrice, req.params.id);

        const updated = db.prepare('SELECT * FROM bargain_offers WHERE id = ?').get(req.params.id);

        res.json({
            offer: updated
        });
    } catch (error) {
        next(error);
    }
});

export default router;