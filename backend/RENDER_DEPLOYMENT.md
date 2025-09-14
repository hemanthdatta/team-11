# Render Backend Deployment Guide

## Deploy FastAPI Backend to Render

This guide will help you deploy the Micro-Entrepreneur Growth App backend to Render.

### Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Gemini API Key**: Get your API key from Google AI Studio

---

## Deployment Steps

### Step 1: Prepare Your Repository

Ensure your backend has these files (already created):
- `build.sh` - Build script for Render
- `start.sh` - Start script with Gunicorn
- `requirements.txt` - Python dependencies
- `render.yaml` - Render configuration (optional)
- `init_db.py` - Database initialization

### Step 2: Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

#### Basic Settings:
- **Name**: `micro-entrepreneur-backend`
- **Region**: `Oregon (US West)`
- **Branch**: `vercel-deployment` (or your main branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `./start.sh`

#### Advanced Settings:
- **Plan**: Free (for testing) or Starter ($7/month)
- **Auto-Deploy**: Enabled

### Step 3: Configure Environment Variables

In Render dashboard, add these environment variables:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `GEMINI_API_KEY` | `your_gemini_api_key_here` | Google Gemini API key |
| `SECRET_KEY` | `your-secret-key-here` | JWT secret key (generate random) |
| `ENVIRONMENT` | `production` | Environment setting |
| `DATABASE_URL` | `sqlite:///./app.db` | Database URL (SQLite for free tier) |
| `PYTHON_VERSION` | `3.11.6` | Python version |

#### To generate SECRET_KEY:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies from `requirements.txt`
   - Run `build.sh` to initialize the database
   - Start the application with `start.sh`

### Step 5: Verify Deployment

After deployment completes:
1. **Check Service URL**: Copy your service URL (e.g., `https://your-app.onrender.com`)
2. **Test API**: Visit `https://your-app.onrender.com/docs` for API documentation
3. **Test Authentication**: Try the `/auth/login` endpoint

---

## Update Frontend Configuration

After successful backend deployment:

### Update Frontend Environment Variables

In your **Vercel deployment**:

1. Go to Vercel project settings
2. Update environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend-app.onrender.com`

### Or update `.env.production`:
```bash
VITE_API_BASE_URL=https://your-backend-app.onrender.com
```

---

## Configuration Files Explained

### `build.sh`
- Installs Python dependencies
- Creates necessary directories
- Initializes database tables

### `start.sh`
- Uses Gunicorn with Uvicorn workers for production
- Configures proper logging
- Binds to Render's PORT environment variable

### `requirements.txt`
- Contains all Python dependencies
- Includes `gunicorn` for production deployment

### `render.yaml` (Optional)
- Infrastructure as Code configuration
- Defines services and databases
- Can be used for one-click deployment

---

## Database Options

### Option 1: SQLite (Free)
- **Pros**: Free, simple setup
- **Cons**: Not suitable for high traffic, data not persistent across deployments
- **Configuration**: `DATABASE_URL=sqlite:///./app.db`

### Option 2: PostgreSQL (Recommended for Production)
1. Create PostgreSQL database in Render
2. Update `DATABASE_URL` environment variable
3. Update SQLAlchemy configuration if needed

---

## Monitoring and Logs

### View Logs:
1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab
4. Monitor for errors or issues

### Health Check:
- Render automatically health checks your service
- Endpoint: `GET /` (should return 200 status)

---

## Troubleshooting

### Common Issues:

1. **Build Failed**:
   - Check `requirements.txt` for compatibility
   - Ensure `build.sh` is executable
   - Check Python version compatibility

2. **Database Errors**:
   - Verify database initialization in logs
   - Check SQLAlchemy models for issues
   - Ensure proper file permissions

3. **Import Errors**:
   - Check Python path configuration
   - Verify all dependencies in `requirements.txt`

4. **CORS Issues**:
   - Update allowed origins in `main.py`
   - Add your Vercel domain to CORS settings

5. **Environment Variables**:
   - Double-check all required variables are set
   - Ensure no typos in variable names

### Debug Commands:
```bash
# Test build locally
./build.sh

# Test start locally
./start.sh

# Check requirements
pip install -r requirements.txt
```

---

## Production Checklist

- [ ] All environment variables configured
- [ ] CORS origins properly set
- [ ] Database initialized successfully
- [ ] API documentation accessible
- [ ] Authentication endpoints working
- [ ] File uploads configured
- [ ] Logs showing no errors
- [ ] Frontend can connect to backend

---

## Support

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Deployment Issues**: Check Render logs and GitHub issues

---

**Your backend will be available at**: `https://your-app-name.onrender.com`

Remember to update the frontend `VITE_API_BASE_URL` with this URL!
