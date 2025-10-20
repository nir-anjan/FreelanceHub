# Render Deployment Checklist ✅

## Pre-Deployment

- [ ] Code pushed to GitHub repository
- [ ] All sensitive data removed from code (API keys, passwords)
- [ ] Environment variable files (.env) added to .gitignore
- [ ] Razorpay account set up and keys available

## Backend Configuration

- [ ] `requirements.txt` updated with production dependencies
- [ ] `backend/backend/settings.py` configured for production
- [ ] `backend/backend/asgi.py` created for WebSocket support
- [ ] `backend/.env.example` updated with production variables
- [ ] Database migrations ready
- [ ] Static files configuration verified

## Frontend Configuration

- [ ] `frontend/.env.example` updated with production URLs
- [ ] Build script working (`npm run build`)
- [ ] API endpoints updated to production URLs
- [ ] Razorpay key configured for production

## Render Deployment

- [ ] Render account created and GitHub connected
- [ ] `render.yaml` file in repository root
- [ ] Blueprint deployment initiated OR manual services created
- [ ] PostgreSQL database service running
- [ ] Redis service running
- [ ] Backend web service deployed and running
- [ ] Frontend static site deployed

## Environment Variables Configuration

### Backend Service

- [ ] `SECRET_KEY` - Generated new 50+ character key
- [ ] `DEBUG` - Set to False
- [ ] `DATABASE_URL` - Auto-provided by Render
- [ ] `REDIS_URL` - Auto-provided by Render
- [ ] `RAZORPAY_KEY_ID` - Your production/sandbox key
- [ ] `RAZORPAY_KEY_SECRET` - Your production/sandbox secret
- [ ] `ALLOWED_HOSTS` - Your Render backend URL

### Frontend Service

- [ ] `VITE_API_BASE_URL` - Your backend service URL + /api
- [ ] `VITE_WS_BASE_URL` - Your backend service WebSocket URL
- [ ] `VITE_RAZORPAY_KEY_ID` - Your Razorpay public key
- [ ] `NODE_ENV` - Set to production

## Post-Deployment Testing

- [ ] Backend service health check (API accessible)
- [ ] Frontend application loads correctly
- [ ] User registration working
- [ ] User login working
- [ ] JWT token refresh working
- [ ] API endpoints responding correctly
- [ ] Real-time chat functionality working
- [ ] WebSocket connections established
- [ ] Payment integration working (Razorpay)
- [ ] File uploads working (if applicable)
- [ ] Database queries executing properly

## Database Setup

- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Collect static files (if needed): `python manage.py collectstatic`
- [ ] Test database connectivity

## Security Verification

- [ ] HTTPS enforced on all services
- [ ] CORS properly configured
- [ ] No debug information exposed
- [ ] Error pages not revealing sensitive information
- [ ] API endpoints properly secured
- [ ] File upload security (if applicable)

## Performance Check

- [ ] Page load times acceptable
- [ ] API response times reasonable
- [ ] WebSocket latency minimal
- [ ] Static files serving efficiently
- [ ] Database query performance optimized

## Monitoring Setup

- [ ] Error logging configured
- [ ] Performance monitoring set up
- [ ] Uptime monitoring configured
- [ ] Backup strategy implemented

## Final Steps

- [ ] Custom domain configured (if applicable)
- [ ] DNS records updated (if using custom domain)
- [ ] SSL certificate verified
- [ ] All team members have access to Render dashboard
- [ ] Documentation updated with production URLs
- [ ] Deployment guide shared with team

## Emergency Contacts

- [ ] Render support documentation bookmarked
- [ ] Razorpay support contacts saved
- [ ] Team contact information updated

---

**Deployment Date**: ******\_\_\_******
**Deployed By**: ******\_\_\_******
**Production URLs**:

- Frontend: ******\_\_\_******
- Backend: ******\_\_\_******
- Admin Panel: ******\_\_\_******

**Notes**:

---

---

---
