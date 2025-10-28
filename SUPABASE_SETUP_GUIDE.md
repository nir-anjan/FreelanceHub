# Supabase Integration Guide for FreelanceMarketplace

## 🚀 Setting up Supabase Database

Your FreelanceMarketplace is now configured to use Supabase as the database backend instead of a local PostgreSQL instance.

### Why Supabase?

✅ **Free PostgreSQL Database** (up to 500MB)  
✅ **Real-time subscriptions** for live updates  
✅ **Built-in Authentication** (optional)  
✅ **Row Level Security** for data protection  
✅ **Storage for file uploads**  
✅ **Edge Functions** for serverless APIs  
✅ **Dashboard for database management**

## Step 1: Create Supabase Project

1. **Sign up for Supabase**

   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub or email
   - Create a new project

2. **Project Configuration**

   - **Name**: `freelance-marketplace`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
   - **Plan**: Start with Free tier

3. **Get Connection Details**
   - Go to **Settings** → **Database**
   - Copy the **Connection string** (this is your `DATABASE_URL`)
   - Go to **Settings** → **API**
   - Copy **Project URL** (this is your `SUPABASE_URL`)
   - Copy **anon/public key** (this is your `SUPABASE_KEY`)

## Step 2: Environment Variables

### For Local Development

Create a `.env` file in your `backend/` directory:

```bash
# Django Settings
SECRET_KEY=your-django-secret-key
DEBUG=True
DJANGO_SETTINGS_MODULE=backend.settings

# Supabase Configuration
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Redis (local for development)
REDIS_URL=redis://localhost:6379

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### For Render Production

In your Render dashboard, add these environment variables:

```bash
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SECRET_KEY=your-production-secret-key
DEBUG=False
```

## Step 3: Database Migration

### Initial Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (including Supabase)
pip install -r requirements.txt

# Run migrations to create tables in Supabase
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Test the connection
python manage.py shell
```

### Test Database Connection

```python
# In Django shell
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT version()")
print(cursor.fetchone())
```

## Step 4: Supabase Dashboard Setup

### 1. Enable Row Level Security (Recommended)

```sql
-- In Supabase SQL Editor
-- Enable RLS on your Django tables (optional but recommended)
ALTER TABLE auth_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_auth_user ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
CREATE POLICY "Users can view own profile" ON api_auth_user
    FOR SELECT USING (auth.uid()::text = id::text);
```

### 2. Create Database Indexes (for performance)

```sql
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_email ON api_auth_user(email);
CREATE INDEX IF NOT EXISTS idx_user_created ON api_auth_user(created_at);
-- Add more indexes based on your query patterns
```

### 3. Set up Storage Buckets (for file uploads)

```sql
-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);
```

## Step 5: Enhanced Features with Supabase

### Real-time Subscriptions

Your Django models can work with Supabase real-time features:

```python
# In your Django views or services
from api.common.supabase_utils import get_supabase_client

def setup_realtime_subscription():
    supabase = get_supabase_client()
    if supabase:
        # Subscribe to changes in chat messages
        supabase.table('chat_message').on('INSERT', handle_new_message).subscribe()
```

### File Storage Integration

```python
# Example: Upload user avatar to Supabase Storage
from api.common.supabase_utils import upload_file_to_supabase

def upload_avatar(user_id, file_data):
    result = upload_file_to_supabase(
        bucket_name='avatars',
        file_path=f'user_{user_id}/avatar.jpg',
        file_data=file_data
    )
    return result
```

## Step 6: Monitoring and Maintenance

### Health Check

Your health endpoint now includes Supabase connectivity:

```
GET /api/health/
```

Response includes:

```json
{
  "status": "healthy",
  "database": "connected",
  "supabase": "connected",
  "redis": "connected"
}
```

### Database Monitoring

- **Supabase Dashboard**: Monitor queries, connections, and performance
- **Django Admin**: Manage data through Django admin interface
- **SQL Editor**: Run custom queries in Supabase dashboard

## Step 7: Migration from Local PostgreSQL

If you're migrating from local PostgreSQL:

### 1. Export existing data

```bash
# Export from local database
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission > db_export.json
```

### 2. Load into Supabase

```bash
# Load into Supabase database
python manage.py loaddata db_export.json
```

## Security Best Practices

### 1. Environment Variables

- Never commit actual credentials to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Row Level Security

- Enable RLS on sensitive tables
- Create appropriate policies for data access
- Test policies thoroughly

### 3. Connection Security

- Use connection pooling for better performance
- Enable SSL connections (enabled by default)
- Monitor connection usage in Supabase dashboard

## Cost Considerations

### Supabase Pricing

- **Free Tier**: 500MB database, 1GB bandwidth, 50MB file storage
- **Pro Tier**: $25/month - 8GB database, 250GB bandwidth, 100GB storage
- **Team Tier**: $599/month - Unlimited everything

### Render + Supabase Cost

- **Development**: Free (Render Free + Supabase Free)
- **Production**: ~$7/month (Render Pro) + Supabase pricing
- **Total**: Much cheaper than managed PostgreSQL

## Troubleshooting

### Common Issues

1. **Connection Errors**

   - Verify DATABASE_URL format
   - Check project reference and password
   - Ensure IP whitelist includes 0.0.0.0/0 (or Render IPs)

2. **Migration Issues**

   - Run `python manage.py migrate --fake-initial` if needed
   - Check for conflicting migrations
   - Verify database permissions

3. **Performance Issues**

   - Add database indexes for frequent queries
   - Use connection pooling
   - Monitor slow queries in Supabase dashboard

4. **Supabase Client Errors**
   - Verify SUPABASE_URL and SUPABASE_KEY
   - Check API key permissions
   - Test connection with health endpoint

### Getting Help

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Django Documentation**: [docs.djangoproject.com](https://docs.djangoproject.com)
- **Supabase Discord**: Join their community Discord
- **Health Check**: Use `/api/health/` to diagnose issues

## Next Steps

1. ✅ **Complete Supabase setup**
2. ✅ **Test database connectivity**
3. ✅ **Run migrations**
4. ✅ **Deploy to Render**
5. 🚀 **Enable real-time features**
6. 📁 **Set up file storage**
7. 🔒 **Configure Row Level Security**
8. 📊 **Set up monitoring**

Your FreelanceMarketplace now has a robust, scalable database backend with Supabase! 🎉
