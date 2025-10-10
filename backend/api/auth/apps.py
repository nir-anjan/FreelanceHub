from django.apps import AppConfig


class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api.auth'
    label = 'api_auth'  # This prevents conflicts with Django's built-in auth
    verbose_name = 'Authentication'