import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, bootstrapSuperAdmin, initializePlatformSettings, getDb } from './db/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import sellerRoutes from './routes/sellers.js';
import productRoutes from './routes/products.js';
import bargainRoutes from './routes/bargains.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public platform settings endpoint (for frontend)
app.get('/api/settings', (req, res) => {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM platform_settings').all();

    const parsed = {};
    for (const setting of settings) {
      parsed[setting.key] = JSON.parse(setting.value);
    }

    res.json({ settings: parsed });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ error: 'Failed to fetch platform settings' });
  }
});

// Initialize database, platform settings, and bootstrap super admin
(async () => {
  try {
    await initDatabase();
    initializePlatformSettings();
    await bootstrapSuperAdmin();
    console.log('✅ Database initialized, platform settings initialized, and super admin bootstrapped');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bargains', bargainRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

