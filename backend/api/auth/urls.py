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
    # Dashboard views
    DashboardAPIView,
    JobCreateAPIView,
    JobHistoryAPIView,
    ActiveJobsAPIView,
    PaymentHistoryAPIView,
    InboxAPIView,
    ChatMessagesAPIView,
)

app_name = 'auth'

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    
    # Admin authentication
    path('admin/login/', AdminLoginAPIView.as_view(), name='admin_login'),
    
    # Profile management (unified endpoint handles both user and role-specific profiles)
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    # Deprecated: Use 'profile/' endpoint instead. Kept for backwards compatibility.
    path('profile/create-role/', CreateRoleProfileAPIView.as_view(), name='create_role_profile'),
    path('password/change/', PasswordChangeAPIView.as_view(), name='password_change'),
    
    # Token management
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Admin endpoints
    path('users/', UserListAPIView.as_view(), name='user_list'),
    
    # Dashboard endpoints
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    
    # Job management endpoints
    path('jobs/create/', JobCreateAPIView.as_view(), name='job_create'),
    path('jobs/history/', JobHistoryAPIView.as_view(), name='job_history'),
    path('jobs/active/', ActiveJobsAPIView.as_view(), name='active_jobs'),
    
    # Payment endpoints
    path('payments/history/', PaymentHistoryAPIView.as_view(), name='payment_history'),
    
    # Inbox endpoints
    path('inbox/', InboxAPIView.as_view(), name='inbox'),
    path('inbox/<int:thread_id>/messages/', ChatMessagesAPIView.as_view(), name='chat_messages'),
]