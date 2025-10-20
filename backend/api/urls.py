from django.urls import path, include
from . import views

app_name = 'api'

urlpatterns = [
    # Health and monitoring endpoints
    path('health/', views.health_check, name='health_check'),
    path('info/', views.api_info, name='api_info'),
    
    # Authentication endpoints
    path('auth/', include('api.auth.urls')),
]