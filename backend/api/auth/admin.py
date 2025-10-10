from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin interface
    """
    
    # The fields to be used in displaying the User model
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'email_verified')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Fields for the user detail/edit page
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'bio', 'profile_picture')
        }),
        (_('User Type'), {
            'fields': ('role',)
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        (_('Verification'), {
            'fields': ('email_verified', 'email_verification_token'),
            'classes': ('collapse',)
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        (_('Security'), {
            'fields': ('last_login_ip',),
            'classes': ('collapse',)
        }),
    )
    
    # Fields for the add user page
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
        (_('Personal info'), {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'phone'),
        }),
    )
    
    readonly_fields = ('date_joined', 'last_login', 'created_at', 'updated_at', 'last_login_ip')
    
    # Custom actions
    actions = ['make_active', 'make_inactive', 'verify_email']
    
    def make_active(self, request, queryset):
        """
        Mark selected users as active
        """
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} users were successfully marked as active.')
    make_active.short_description = "Mark selected users as active"
    
    def make_inactive(self, request, queryset):
        """
        Mark selected users as inactive
        """
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} users were successfully marked as inactive.')
    make_inactive.short_description = "Mark selected users as inactive"
    
    def verify_email(self, request, queryset):
        """
        Mark selected users' emails as verified
        """
        updated = queryset.update(email_verified=True, email_verification_token=None)
        self.message_user(request, f'{updated} users were successfully email verified.')
    verify_email.short_description = "Mark selected users as email verified"
    
    def get_queryset(self, request):
        """
        Return a QuerySet of all model instances that can be edited by the admin site
        """
        qs = super().get_queryset(request)
        return qs.prefetch_related('groups', 'user_permissions')
    
    def get_form(self, request, obj=None, **kwargs):
        """
        Return a Form class for use in the admin add/change view
        """
        form = super().get_form(request, obj, **kwargs)
        
        # If the current user is not a superuser, restrict role choices
        if not request.user.is_superuser:
            if 'role' in form.base_fields:
                form.base_fields['role'].choices = [
                    ('freelancer', 'Freelancer'),
                    ('client', 'Client'),
                ]
        
        return form