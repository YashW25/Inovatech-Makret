# Deployment Guide

## Quick Start

### 1. Local Development Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Copy environment files
cp env.example .env
cp server/.env.example server/.env

# Edit server/.env and set:
# - SUPER_ADMIN_EMAIL
# - SUPER_ADMIN_PASSWORD
# - JWT_SECRET (use a strong random string)

# Start backend (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
npm run dev
```

### 2. Production Build

**Frontend:**
```bash
npm run build
# Output: dist/ folder
```

**Backend:**
```bash
cd server
npm start
# Or use PM2: pm2 start index.js
```

## Deployment Options

### Frontend: Netlify

1. **Build Command:** `npm run build`
2. **Publish Directory:** `dist`
3. **Environment Variables:**
   - `VITE_API_URL` = Your backend API URL (e.g., `https://your-api.railway.app/api`)

### Backend: Railway / Render / Heroku

**Required Environment Variables:**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.netlify.app
DATABASE_PATH=./data/commerce.db
JWT_SECRET=your-strong-random-secret-key
SUPER_ADMIN_EMAIL=your-admin@email.com
SUPER_ADMIN_PASSWORD=your-secure-password
EMAILJS_SERVICE_ID=your_service_id (optional)
EMAILJS_TEMPLATE_ID=your_template_id (optional)
EMAILJS_PUBLIC_KEY=your_public_key (optional)
SITE_NAME=Your Site Name
```

**Note:** For production, consider using a cloud database (PostgreSQL) instead of SQLite.

## Database Migration

The database is automatically created on first startup. For production:

1. Use PostgreSQL or another cloud database
2. Update `DATABASE_PATH` or use a connection string
3. Update `server/db/index.js` to use the appropriate database driver

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Use environment variables (never commit .env)
- [ ] Set up rate limiting (already included)
- [ ] Use a production database (not SQLite for production)
- [ ] Configure EmailJS for OTP emails
- [ ] Set up monitoring and logging

## Troubleshooting

### OTP Not Sending

- Check EmailJS configuration in `server/.env`
- In development, OTP is logged to console
- Check backend logs for errors

### Database Errors

- Ensure `server/data/` directory is writable
- Check database file permissions
- For production, use a cloud database

### CORS Errors

- Update `FRONTEND_URL` in `server/.env`
- Ensure frontend URL matches exactly

### Build Errors

- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies are installed
- Check Node.js version (18+)

