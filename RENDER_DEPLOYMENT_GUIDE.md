# Render Deployment Guide for FreelanceMarketplace

## Overview

This guide will walk you through deploying your full-stack FreelanceMarketplace application to Render.com with the following stack:

- **Backend**: Django REST API with WebSocket support
- **Frontend**: React + Vite application
- **Database**: PostgreSQL
- **Cache/WebSocket**: Redis
- **Payment**: Razorpay integration

## Prerequisites

1. GitHub repository with your code
2. Render.com account
3. Razorpay account for payment processing

## Deployment Files Created

- `render.yaml` - Render deployment configuration
- `backend/requirements.txt` - Updated with production dependencies
- `backend/.env.example` - Environment variables template
- `frontend/.env.example` - Frontend environment variables template
- `backend/backend/asgi.py` - Production-ready ASGI configuration
- `backend/backend/settings.py` - Updated with production settings

## Step-by-Step Deployment

### 1. Prepare Your Repository

#### Backend Requirements

Your `backend/requirements.txt` now includes:

```
gunicorn>=21.0.0
uvicorn>=0.22.0
channels-redis>=4.1.0
whitenoise>=6.5.0
dj-database-url>=2.1.0
python-decouple>=3.8
psycopg2-binary>=2.9.7
```

#### Environment Configuration

Your Django settings are now production-ready with:

- Environment variable configuration using `python-decouple`
- WhiteNoise for static file serving
- PostgreSQL database support via `dj-database-url`
- CORS configuration for frontend
- Security settings for production

### 2. Deploy Using render.yaml

#### Option A: One-Click Deployment

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and deploy all services

#### Option B: Manual Service Creation

If you prefer manual setup, create services in this order:

1. **PostgreSQL Database**

   - Name: `freelance-marketplace-db`
   - Plan: Free or Starter ($7/month for persistent storage)

2. **Redis Instance**

   - Name: `freelance-marketplace-redis`
   - Plan: Free (30MB) or Starter ($7/month)

3. **Backend Web Service**

   - Name: `freelance-marketplace-backend`
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn backend.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - Root Directory: `backend`

4. **Frontend Static Site**
   - Name: `freelance-marketplace-frontend`
   - Environment: Node.js
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Root Directory: `frontend`

### 3. Configure Environment Variables

#### Backend Environment Variables (in Render Dashboard)

```bash
SECRET_KEY=your-generated-secret-key-50-chars-minimum
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/db  # Auto-provided by Render
REDIS_URL=redis://host:port  # Auto-provided by Render
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ALLOWED_HOSTS=your-backend-url.onrender.com,.onrender.com
```

#### Frontend Environment Variables

```bash
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
VITE_WS_BASE_URL=wss://your-backend-url.onrender.com
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
NODE_ENV=production
```

### 4. Generate Secret Key

Generate a new Django secret key for production:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 5. Database Migration

After deployment, run migrations:

1. Go to your backend service in Render dashboard
2. Open Shell tab
3. Run: `python manage.py migrate`
4. Create superuser: `python manage.py createsuperuser`

### 6. Domain Configuration

Once deployed, update your environment variables with actual URLs:

- Backend URL: `https://your-app-name-backend.onrender.com`
- Frontend URL: `https://your-app-name-frontend.onrender.com`

## Service Configuration Details

### Backend Service

- **Runtime**: Python 3.11+
- **Server**: Gunicorn with Uvicorn workers for ASGI support
- **Static Files**: Served by WhiteNoise
- **WebSockets**: Supported via Django Channels and Redis

### Frontend Service

- **Build Tool**: Vite
- **Deployment**: Static site hosting
- **Environment**: Production optimized build

### Database

- **Engine**: PostgreSQL 15+
- **Connection**: Via DATABASE_URL environment variable
- **Backups**: Automatic (on paid plans)

### Redis

- **Use Case**: WebSocket channel layer for real-time chat
- **Connection**: Via REDIS_URL environment variable

## Security Considerations

### Production Security Features Enabled

- SSL/HTTPS enforcement
- Security headers (HSTS, XSS protection, etc.)
- CORS configuration for frontend domain
- Secure cookie settings
- SQL injection protection

### Environment Variables Security

- Never commit actual credentials to version control
- Use Render's secure environment variable storage
- Rotate keys regularly

## Monitoring and Logs

### View Logs

- Backend: Render Dashboard → Backend Service → Logs
- Frontend: Render Dashboard → Frontend Service → Logs

### Health Checks

- Backend health endpoint: `/api/health/` (if implemented)
- Frontend: Standard HTTP responses

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check build logs in Render dashboard
   - Verify all dependencies in requirements.txt/package.json
   - Ensure Python/Node versions are compatible

2. **Database Connection Issues**

   - Verify DATABASE_URL environment variable
   - Check database service status
   - Run migrations after deployment

3. **Static Files Not Loading**

   - Verify WhiteNoise configuration
   - Check STATIC_ROOT and STATIC_URL settings
   - Run `python manage.py collectstatic` if needed

4. **WebSocket Connection Issues**

   - Verify REDIS_URL environment variable
   - Check Redis service status
   - Ensure ASGI application is properly configured

5. **CORS Errors**
   - Update CORS_ALLOWED_ORIGINS in Django settings
   - Verify frontend domain in backend environment variables

### Performance Optimization

1. **Database**

   - Use connection pooling
   - Optimize queries with select_related/prefetch_related
   - Consider database indexing

2. **Static Files**

   - WhiteNoise compression is enabled
   - Use CDN for large media files if needed

3. **Caching**
   - Redis is available for caching
   - Consider Django cache framework

## Cost Estimation

### Free Tier (Development/Testing)

- Web Service: Free (750 hours/month)
- PostgreSQL: Free (90 days, then expires)
- Redis: Free (30MB)
- Static Site: Free

### Production Tier (Recommended)

- Web Service: $7/month (always-on)
- PostgreSQL: $7/month (persistent storage)
- Redis: $7/month (persistent storage)
- Static Site: Free
- **Total**: ~$21/month

## Next Steps

1. **Deploy and Test**

   - Deploy using render.yaml
   - Test all functionality including payments and chat
   - Verify WebSocket connections

2. **Custom Domain** (Optional)

   - Add custom domain in Render dashboard
   - Update environment variables with new domain

3. **Monitoring**

   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Set up uptime monitoring

4. **Backup Strategy**
   - Database backups (automatic on paid plans)
   - Regular code backups via Git

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

Your FreelanceMarketplace is now ready for production deployment on Render! 🚀
