import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
// import { bootstrapSuperAdmin } from './bootstrap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export const initDatabase = async () => {
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../data/commerce.db');
  
  // Ensure data directory exists
  const dbDir = path.dirname(dbPath);
  const fs = await import('fs/promises');
  try {
    await fs.mkdir(dbDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL'); // Better concurrency

  // Create tables
  createTables();
  
  return db;
};

const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('super_admin', 'seller', 'customer')),
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sellers table (extends users)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sellers (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      store_name TEXT NOT NULL,
      store_description TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'banned')),
      commission_owed REAL DEFAULT 0,
      last_payment_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      discount_price REAL,
      images TEXT, -- JSON array
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      allow_bargain INTEGER DEFAULT 0,
      min_bargain_price REAL,
      is_active INTEGER DEFAULT 1,
      customization JSON, -- For seller-level customization
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
    )
  `);

  // OTP table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bargain offers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bargain_offers (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      offer_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'countered')),
      counter_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      seller_id TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cod', 'online')),
      items TEXT NOT NULL, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
    )
  `);

  // Platform settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL, -- JSON
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
    CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);
    CREATE INDEX IF NOT EXISTS idx_otps_expires ON otps(expires_at);
    CREATE INDEX IF NOT EXISTS idx_bargain_offers_product ON bargain_offers(product_id);
    CREATE INDEX IF NOT EXISTS idx_bargain_offers_seller ON bargain_offers(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
  `);
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

/**
 * Initialize default platform settings
 */
export const initializePlatformSettings = () => {
  const database = getDb();
  
  const defaultSettings = {
    siteName: process.env.SITE_NAME || 'MarketHub',
    logo: '',
    favicon: '',
    primaryColor: '32 95% 44%',
    secondaryColor: '35 20% 94%',
    accentColor: '15 75% 55%',
    fontDisplay: 'Playfair Display',
    fontBody: 'DM Sans',
    commissionRate: 10,
    subscriptionFee: 0,
    allowBargain: true,
    allowCOD: true,
    heroTitle: 'Discover Unique Products from Trusted Sellers',
    heroSubtitle: 'A curated marketplace where quality meets authenticity. Shop directly from verified vendors worldwide.',
    heroImage: '',
    metaDescription: 'A production-ready, fully dynamic, multi-vendor e-commerce platform',
    ogImage: '',
    twitterHandle: '',
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = database.prepare('SELECT key FROM platform_settings WHERE key = ?').get(key);
    if (!existing) {
      database.prepare(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).run(key, JSON.stringify(value));
    }
  }

  console.log('✅ Platform settings initialized');
};

export const bootstrapSuperAdmin = async () => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail || !superAdminPassword) {
    console.warn('⚠️  SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD not set. Skipping super admin bootstrap.');
    return;
  }

  try {
    const database = getDb();
    
    // Check if super admin already exists
    const existing = database.prepare('SELECT id FROM users WHERE email = ? AND role = ?').get(superAdminEmail, 'super_admin');
    
    if (existing) {
      console.log('✅ Super admin already exists');
      return;
    }

    // Create super admin
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);

    database.prepare(`
      INSERT INTO users (id, email, password_hash, role, is_verified)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, superAdminEmail, passwordHash, 'super_admin', 1);

    console.log(`✅ Super admin created: ${superAdminEmail}`);
  } catch (error) {
    console.error('❌ Failed to bootstrap super admin:', error);
    throw error;
  }
};

