# Vercel Deployment Guide

## Frontend Deployment on Vercel

This branch is configured specifically for deploying the frontend to Vercel.

### Prerequisites

1. **Backend Deployment**: You need to deploy the backend separately before deploying this frontend
2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
3. **Environment Variables**: Update the API URL in production

### Step 1: Deploy Backend First

Deploy the backend (`/backend` folder) to one of these platforms:

- **Railway**: https://railway.app
- **Render**: https://render.com  
- **Heroku**: https://heroku.com
- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform

### Step 2: Update API Configuration

1. After backend deployment, update `.env.production`:
```bash
VITE_API_BASE_URL=https://your-backend-url.com
```

2. Or set environment variable in Vercel dashboard:
   - Go to your project settings
   - Add environment variable: `VITE_API_BASE_URL` = `https://your-backend-url.com`

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts
```

#### Option B: GitHub Integration
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Select this branch: `vercel-deployment`
4. Configure environment variables
5. Deploy

### Step 4: Configure Environment Variables in Vercel

In Vercel dashboard, add these environment variables:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://your-backend-url.com` |

### Project Structure

```
/
├── src/                 # Frontend source code
├── public/             # Static assets
├── dist/               # Build output (auto-generated)
├── vercel.json         # Vercel configuration
├── vite.config.ts      # Vite configuration
├── .env.production     # Production environment variables
└── package.json        # Dependencies and scripts
```

### Build Configuration

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Features

- ✅ Single Page Application (SPA) routing
- ✅ Environment variable support
- ✅ Production optimizations
- ✅ Static asset caching
- ✅ Security headers
- ✅ Clean URLs

### Backend Requirements

The backend should have:
- CORS enabled for your Vercel domain
- All API endpoints under `/api/` or configure accordingly
- Proper error handling for production
- Environment variables configured

### Testing Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Troubleshooting

1. **API calls failing**: Check if `VITE_API_BASE_URL` is set correctly
2. **Routing issues**: Ensure `vercel.json` has proper rewrites
3. **Build errors**: Check TypeScript types and dependencies
4. **Environment variables**: Make sure they start with `VITE_`

### Support

For issues:
1. Check Vercel deployment logs
2. Verify backend is accessible
3. Check browser console for errors
4. Ensure environment variables are set

---

**Note**: This deployment configuration is specifically for the frontend only. The backend needs to be deployed separately to a platform that supports Node.js/Python applications.
