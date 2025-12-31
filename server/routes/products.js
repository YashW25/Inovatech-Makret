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

// Product schema
const productSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    discountPrice: z.number().positive().optional(),
    images: z.array(z.string()).default([]),
    category: z.string().min(1),
    stock: z.number().int().min(0).default(0),
    allowBargain: z.boolean().default(false),
    minBargainPrice: z.number().positive().optional(),
    customization: z.record(z.any()).optional()
});

/**
 * GET /api/products
 * Get all active products (public)
 */
router.get('/', async (req, res, next) => {
    try {
        const db = getDb();
        const {
            category,
            sellerId,
            search
        } = req.query;

        let query = `
      SELECT p.*, s.store_name, s.status as seller_status
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_active = 1 AND s.status = 'active'
    `;
        const params = [];

        if (category) {
            query += ' AND p.category = ?';
            params.push(category);
        }

        if (sellerId) {
            query += ' AND p.seller_id = ?';
            params.push(sellerId);
        }

        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY p.created_at DESC';

        const products = db.prepare(query).all(...params);

        // Parse JSON fields
        const parsed = products.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
            customization: p.customization ? JSON.parse(p.customization) : null,
            allowBargain: Boolean(p.allow_bargain),
            isActive: Boolean(p.is_active)
        }));

        res.json({
            products: parsed
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/products/:id
 * Get single product
 */
router.get('/:id', async (req, res, next) => {
    try {
        const db = getDb();
        const product = db.prepare(`
      SELECT p.*, s.store_name, s.store_description, s.status as seller_status
      FROM products p
      JOIN sellers s ON p.seller_id = s.id
      WHERE p.id = ? AND p.is_active = 1 AND s.status = 'active'
    `).get(req.params.id);

        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        const parsed = {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            customization: product.customization ? JSON.parse(product.customization) : null,
            allowBargain: Boolean(product.allow_bargain),
            isActive: Boolean(product.is_active)
        };

        res.json({
            product: parsed
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/products
 * Create product (seller only)
 */
router.post('/', authenticate, requireRole('seller'), async (req, res, next) => {
    try {
        const data = productSchema.parse(req.body);
        const db = getDb();

        // Get seller ID
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);
        if (!seller) {
            return res.status(404).json({
                error: 'Seller not found'
            });
        }

        // Create product
        const productId = randomUUID();
        db.prepare(`
      INSERT INTO products (
        id, seller_id, name, description, price, discount_price,
        images, category, stock, allow_bargain, min_bargain_price, customization
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            productId,
            seller.id,
            data.name,
            data.description,
            data.price,
            data.discountPrice || null,
            JSON.stringify(data.images),
            data.category,
            data.stock,
            data.allowBargain ? 1 : 0,
            data.minBargainPrice || null,
            data.customization ? JSON.stringify(data.customization) : null
        );

        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
        const parsed = {
            ...product,
            images: product.images ? JSON.parse(product.images) : [],
            customization: product.customization ? JSON.parse(product.customization) : null,
            allowBargain: Boolean(product.allow_bargain),
            isActive: Boolean(product.is_active)
        };

        res.status(201).json({
            product: parsed
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/products/:id
 * Update product (seller only, own products)
 */
router.put('/:id', authenticate, requireRole('seller'), async (req, res, next) => {
    try {
        const data = productSchema.partial().parse(req.body);
        const db = getDb();

        // Verify ownership
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);
        const product = db.prepare('SELECT seller_id FROM products WHERE id = ?').get(req.params.id);

        if (!product || product.seller_id !== seller.id) {
            return res.status(403).json({
                error: 'Not authorized'
            });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (data.name) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.description) {
            updates.push('description = ?');
            values.push(data.description);
        }
        if (data.price !== undefined) {
            updates.push('price = ?');
            values.push(data.price);
        }
        if (data.discountPrice !== undefined) {
            updates.push('discount_price = ?');
            values.push(data.discountPrice || null);
        }
        if (data.images) {
            updates.push('images = ?');
            values.push(JSON.stringify(data.images));
        }
        if (data.category) {
            updates.push('category = ?');
            values.push(data.category);
        }
        if (data.stock !== undefined) {
            updates.push('stock = ?');
            values.push(data.stock);
        }
        if (data.allowBargain !== undefined) {
            updates.push('allow_bargain = ?');
            values.push(data.allowBargain ? 1 : 0);
        }
        if (data.minBargainPrice !== undefined) {
            updates.push('min_bargain_price = ?');
            values.push(data.minBargainPrice || null);
        }
        if (data.customization !== undefined) {
            updates.push('customization = ?');
            values.push(data.customization ? JSON.stringify(data.customization) : null);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id);

        db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(...values);

        const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        const parsed = {
            ...updated,
            images: updated.images ? JSON.parse(updated.images) : [],
            customization: updated.customization ? JSON.parse(updated.customization) : null,
            allowBargain: Boolean(updated.allow_bargain),
            isActive: Boolean(updated.is_active)
        };

        res.json({
            product: parsed
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/products/seller/my-products
 * Get seller's own products
 */
router.get('/seller/my-products', authenticate, requireRole('seller'), async (req, res, next) => {
    try {
        const db = getDb();
        const seller = db.prepare('SELECT id FROM sellers WHERE user_id = ?').get(req.user.id);

        const products = db.prepare('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC').all(seller.id);

        const parsed = products.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
            customization: p.customization ? JSON.parse(p.customization) : null,
            allowBargain: Boolean(p.allow_bargain),
            isActive: Boolean(p.is_active)
        }));

        res.json({
            products: parsed
        });
    } catch (error) {
        next(error);
    }
});

export default router;