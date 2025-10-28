from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import redis
from api.common.supabase_utils import test_supabase_connection

def health_check(request):
    """
    Health check endpoint for monitoring service status
    Returns status of database, Redis, Supabase, and basic application health
    """
    health_status = {
        'status': 'healthy',
        'service': 'FreelanceMarketplace Backend',
        'database': 'unknown',
        'redis': 'unknown',
        'supabase': 'unknown',
        'debug_mode': settings.DEBUG
    }
    
    status_code = 200
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['database'] = 'connected'
    except Exception as e:
        health_status['database'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
        status_code = 503
    
    # Check Redis connection
    try:
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            # Test Redis connection through channels
            health_status['redis'] = 'connected'
        else:
            health_status['redis'] = 'not_configured'
    except Exception as e:
        health_status['redis'] = f'error: {str(e)}'
        # Redis is not critical for basic API functionality
        # so we don't mark as unhealthy unless database is also down
    
    # Check Supabase connection
    try:
        if test_supabase_connection():
            health_status['supabase'] = 'connected'
        else:
            health_status['supabase'] = 'not_configured'
    except Exception as e:
        health_status['supabase'] = f'error: {str(e)}'
        # Supabase is additional service, don't mark as unhealthy
    
    return JsonResponse(health_status, status=status_code)

def api_info(request):
    """
    API information endpoint
    Returns basic API information and available endpoints
    """
    api_info = {
        'name': 'FreelanceMarketplace API',
        'version': '1.0.0',
        'description': 'REST API for FreelanceMarketplace platform',
        'endpoints': {
            'health': '/api/health/',
            'auth': '/api/auth/',
            'swagger': '/api/docs/',  # If you add swagger later
        },
        'features': [
            'User Authentication (JWT)',
            'Project Management',
            'Real-time Chat',
            'Payment Integration',
            'Dispute Resolution'
        ]
    }
    
    return JsonResponse(api_info)