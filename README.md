# Commerce Core - Multi-Vendor E-Commerce Platform

A production-ready, fully dynamic, multi-vendor e-commerce platform built with React, TypeScript, Node.js, and SQLite.

## 🚀 Features

- **Authentication System**
  - Email + Password login
  - 6-digit OTP via EmailJS
  - Secure password hashing
  - OTP expiry (10 minutes)
  - One-time use OTPs
  - Role-based redirects
  - Suspended/banned seller blocking

- **User Roles & Access Control**
  - SUPER_ADMIN - Full platform control
  - SELLER - Manage products, orders, and earnings
  - CUSTOMER - Browse and purchase products
  - Central permission system
  - Route guards

- **Super Admin Bootstrap**
  - Environment-based super admin creation
  - Automatic on first startup
  - Secure password hashing
  - No hardcoded credentials

- **Seller System**
  - Product management
  - Order tracking
  - Commission tracking
  - Auto-suspension for unpaid fees
  - Store customization

- **Product & Bargain System**
  - Fixed price or bargain mode
  - Complete bargain lifecycle (Submit → Accept/Reject/Counter → Order)
  - Product customization
  - Category management

- **Dynamic Customization**
  - Platform-level theming (Super Admin)
  - Seller-level product customization
  - Data-driven UI

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <YOUR_GIT_URL>
cd commerce-core-main
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure Environment Variables

**Frontend (.env):**
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

**Backend (server/.env):**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
DATABASE_PATH=./data/commerce.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Super Admin Bootstrap (REQUIRED)
SUPER_ADMIN_EMAIL=yashwarulkar25@gmail.com
SUPER_ADMIN_PASSWORD=12345678

# EmailJS (Optional - for OTP emails)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
SITE_NAME=MarketHub
```

### 5. Initialize Database

The database will be automatically created on first backend startup. The super admin will also be automatically created if it doesn't exist.

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3001

### Production Build

**Build Frontend:**
```bash
npm run build
```

**Start Backend:**
```bash
cd server
npm start
```

## 🔐 Super Admin Access

On first startup, the super admin is automatically created using the credentials from `server/.env`:
- Email: Value of `SUPER_ADMIN_EMAIL`
- Password: Value of `SUPER_ADMIN_PASSWORD`

**Important:** Change these values in production!

## 📁 Project Structure

```
commerce-core-main/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/           # React contexts (Auth, Platform)
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Page components
│   └── types/              # TypeScript types
├── server/                 # Backend API
│   ├── db/                 # Database setup and bootstrap
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic (OTP, etc.)
│   └── index.js            # Server entry point
└── public/                 # Static assets
```

## 🌐 Deployment

### Netlify (Frontend)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to Netlify

3. Set environment variable:
   - `VITE_API_URL` = Your backend API URL

### Backend Deployment

The backend can be deployed to:
- Railway
- Render
- Heroku
- Any Node.js hosting service

**Required Environment Variables:**
- `PORT`
- `NODE_ENV=production`
- `FRONTEND_URL` (your Netlify URL)
- `JWT_SECRET` (strong random string)
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `DATABASE_PATH` (or use a cloud database)

## 🔒 Security Features

- Password hashing with bcrypt
- OTP encryption
- JWT authentication
- Role-based access control
- Rate limiting
- Input validation with Zod
- SQL injection protection (parameterized queries)

## 🧪 Testing

### Development OTP

In development mode, OTPs are logged to the console. Check the backend terminal for the OTP code.

### Production OTP

Configure EmailJS in `server/.env` to send real OTP emails.

## 📝 API Documentation

### Authentication

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/login` - Email + Password login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)

### Orders

- `POST /api/orders` - Create order (customer)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/seller/orders` - Get seller orders

### Bargains

- `POST /api/bargains/offer` - Create bargain offer
- `GET /api/bargains/my-offers` - Get customer offers
- `POST /api/bargains/:id/accept` - Accept offer (seller)
- `POST /api/bargains/:id/reject` - Reject offer (seller)
- `POST /api/bargains/:id/counter` - Counter offer (seller)

### Admin

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/sellers` - Get all sellers
- `PUT /api/admin/sellers/:id/status` - Update seller status
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings

## 🛠️ Technologies Used

**Frontend:**
- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- shadcn-ui
- Tailwind CSS

**Backend:**
- Node.js
- Express
- SQLite (better-sqlite3)
- JWT
- bcryptjs
- Zod
- EmailJS

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for production-ready e-commerce**
