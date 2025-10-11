from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from .views import (
    RegisterAPIView,
    LoginAPIView,
    AdminLoginAPIView,
    LogoutAPIView,
    ProfileAPIView,
    PasswordChangeAPIView,
    UserListAPIView,
    CustomTokenRefreshView,
    CreateRoleProfileAPIView,
)

app_name = 'auth'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    
    # Admin authentication
    path('admin/login/', AdminLoginAPIView.as_view(), name='admin_login'),
    
    # Profile management
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('profile/create-role/', CreateRoleProfileAPIView.as_view(), name='create_role_profile'),
    path('password/change/', PasswordChangeAPIView.as_view(), name='password_change'),
    
    # Token management
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Admin endpoints
    path('users/', UserListAPIView.as_view(), name='user_list'),
]