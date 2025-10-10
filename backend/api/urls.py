from django.urls import path, include

app_name = 'api'

urlpatterns = [
    # Authentication endpoints
    path('auth/', include('api.auth.urls')),
]