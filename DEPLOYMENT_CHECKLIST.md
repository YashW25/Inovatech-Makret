# 🚀 Netlify Deployment Checklist

## ✅ Pre-Deployment Verification

### Build Status
- [x] **Frontend build successful** - `npm run build` completed without errors
- [x] **Build output created** - `dist/` folder generated
- [x] **No TypeScript errors** - All files compile successfully
- [x] **No linter errors** - Code passes linting

### Configuration Files
- [x] **netlify.toml** - Created with proper SPA routing and security headers
- [x] **env.example** - Frontend environment variables template
- [x] **server/.env.example** - Backend environment variables template
- [x] **.gitignore** - Properly configured to exclude sensitive files

### Code Quality
- [x] **All dependencies installed** - Frontend and backend
- [x] **Environment variables configured** - Templates ready
- [x] **Security headers configured** - In netlify.toml
- [x] **SPA routing configured** - All routes redirect to index.html

## 📋 Deployment Steps

### Step 1: Prepare Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### Step 2: Deploy to Netlify

#### Via Netlify Dashboard:
1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository: `commerce-core-main`

5. **Configure Build Settings:**
   - **Base directory:** (leave blank)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

6. **Set Environment Variables:**
   - Go to **Site settings** → **Build & deploy** → **Environment variables**
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`
   - Replace with your actual backend API URL

7. Click **"Deploy site"**

#### Via Netlify CLI:
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Step 3: Configure Backend

After deploying frontend, update your backend:

1. **Set CORS in backend `.env`:**
   ```
   FRONTEND_URL=https://your-site.netlify.app
   ```

2. **Ensure backend is deployed** (Railway, Render, etc.)

3. **Update frontend environment variable** in Netlify:
   - Set `VITE_API_URL` to your backend URL

### Step 4: Post-Deployment Testing

- [ ] Visit your Netlify URL
- [ ] Test homepage loads
- [ ] Test authentication flow (OTP login)
- [ ] Test product browsing
- [ ] Test seller dashboard (if logged in as seller)
- [ ] Test admin dashboard (if logged in as super_admin)
- [ ] Verify API connections work
- [ ] Check browser console for errors

## 🔧 Required Environment Variables

### Frontend (Netlify)
```
VITE_API_URL=https://your-backend-api.com/api
```

### Backend (Your hosting provider)
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-site.netlify.app
DATABASE_PATH=./data/commerce.db
JWT_SECRET=your-strong-random-secret-key-min-32-chars
SUPER_ADMIN_EMAIL=your-admin@email.com
SUPER_ADMIN_PASSWORD=your-secure-password
```

## 📁 Project Structure

```
commerce-core-main/
├── dist/                    # Build output (deployed to Netlify)
├── src/                     # Frontend source code
├── server/                  # Backend API
├── netlify.toml             # Netlify configuration
├── env.example              # Frontend env template
├── server/.env.example      # Backend env template
├── package.json             # Frontend dependencies
├── server/package.json      # Backend dependencies
└── README.md                # Project documentation
```

## 🎯 Quick Deployment Commands

```bash
# Build locally to test
npm run build

# Preview build locally
npm run preview

# Deploy to Netlify (if using CLI)
netlify deploy --prod
```

## ⚠️ Important Notes

1. **Backend must be deployed first** - Frontend needs API URL
2. **Update CORS on backend** - Allow your Netlify domain
3. **Set strong JWT_SECRET** - Use a random 32+ character string
4. **Never commit .env files** - They're in .gitignore
5. **Test in production** - Verify all features work after deployment

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies installed
- Check build logs in Netlify dashboard

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible

### Routing Issues
- `netlify.toml` handles SPA routing
- All routes should redirect to `index.html`

## ✅ Deployment Complete When:

- [x] Frontend builds successfully
- [ ] Frontend deployed to Netlify
- [ ] Environment variables set
- [ ] Backend deployed and accessible
- [ ] CORS configured on backend
- [ ] All features tested and working
- [ ] Custom domain configured (optional)

## 📞 Support

- Netlify Docs: https://docs.netlify.com/
- Netlify Community: https://answers.netlify.com/
- Project README: See README.md for detailed setup

---

**Status:** ✅ **READY FOR DEPLOYMENT**

All checks passed! Your project is production-ready and can be deployed to Netlify immediately.

