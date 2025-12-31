# Netlify Deployment Guide

## Quick Deployment Steps

### 1. Prepare Your Repository

Ensure all files are committed and pushed to your Git repository:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard

1. **Go to [Netlify](https://app.netlify.com/)**
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your Git provider** (GitHub, GitLab, Bitbucket)
4. **Select your repository**

5. **Configure Build Settings:**
   - **Base directory:** (leave blank - root is fine)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

6. **Set Environment Variables:**
   - Go to **Site settings** → **Build & deploy** → **Environment variables**
   - Add the following:
     ```
     VITE_API_URL = https://your-backend-url.com/api
     ```
     Replace `https://your-backend-url.com/api` with your actual backend API URL

7. **Click "Deploy site"**

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 3. Post-Deployment Configuration

1. **Update Backend CORS:**
   - In your backend `.env`, set:
     ```
     FRONTEND_URL=https://your-site.netlify.app
     ```

2. **Test Your Deployment:**
   - Visit your Netlify URL
   - Test authentication flow
   - Verify API connections

### 4. Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow the DNS configuration instructions

## Environment Variables

### Required for Frontend:
- `VITE_API_URL` - Your backend API URL (e.g., `https://api.yourdomain.com/api`)

### Backend Environment Variables (set on your backend hosting):
- `PORT` - Server port
- `NODE_ENV=production`
- `FRONTEND_URL` - Your Netlify URL
- `JWT_SECRET` - Strong random secret
- `SUPER_ADMIN_EMAIL` - Admin email
- `SUPER_ADMIN_PASSWORD` - Admin password
- `DATABASE_PATH` - Database file path (or use cloud DB)

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Check build logs in Netlify dashboard

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check CORS settings on backend
- Ensure backend is accessible from Netlify URL

### Routing Issues
- The `netlify.toml` file handles SPA routing
- All routes redirect to `index.html`

## Continuous Deployment

Netlify automatically deploys when you push to your connected branch (usually `main` or `master`).

To disable auto-deploy:
- Go to **Site settings** → **Build & deploy** → **Continuous Deployment**
- Click **Stop auto publishing**

## Preview Deployments

Every pull request gets a preview deployment automatically. You can:
- Share preview URLs for testing
- Test changes before merging
- Review build logs

## Performance Optimization

Netlify automatically:
- Optimizes images
- Minifies assets
- Enables CDN caching
- Compresses responses

Your `netlify.toml` configures:
- Static asset caching (1 year)
- HTML no-cache
- Security headers

## Support

- [Netlify Docs](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)

