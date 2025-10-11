from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

from .models import User, Freelancer, Client
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    AdminLoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    TokenSerializer
    , FreelancerCreateSerializer, FreelancerSerializer, ClientCreateSerializer, ClientSerializer
)
from api.common.responses import StandardResponseMixin, get_client_ip
from api.common.permissions import IsAdminUser


class RegisterAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for user registration
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Register a new user
        """
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Log the registration IP
            user.last_login_ip = get_client_ip(request)
            user.save(update_fields=['last_login_ip'])
            
            # Return simplified user data
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role
            }
            
            return Response({
                'message': 'Registration successful',
                'user': user_data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for user login
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Authenticate user and return JWT tokens
        """
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login and IP
            user.last_login = timezone.now()
            user.last_login_ip = get_client_ip(request)
            user.save(update_fields=['last_login', 'last_login_ip'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # Prepare response data
            response_data = {
                'access': str(access),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }
            
            return self.success_response(
                message="Login successful",
                data=response_data,
                status_code=status.HTTP_200_OK
            )
        
        return self.error_response(
            message="Login failed",
            errors=serializer.errors,
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AdminLoginAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for admin-only login
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """
        Authenticate admin user and return JWT tokens
        """
        serializer = AdminLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login and IP
            user.last_login = timezone.now()
            user.last_login_ip = get_client_ip(request)
            user.save(update_fields=['last_login', 'last_login_ip'])
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # Prepare response data
            response_data = {
                'access': str(access),
                'refresh': str(refresh),
                'user': UserProfileSerializer(user).data
            }
            
            return self.success_response(
                message="Admin login successful",
                data=response_data,
                status_code=status.HTTP_200_OK
            )
        
        return self.error_response(
            message="Admin login failed",
            errors=serializer.errors,
            status_code=status.HTTP_403_FORBIDDEN
        )


class LogoutAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for user logout
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Blacklist refresh token to logout user
        """
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
                return self.success_response(
                    message="Logout successful",
                    status_code=status.HTTP_200_OK
                )
            else:
                return self.error_response(
                    message="Refresh token is required",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
                
        except TokenError as e:
            return self.error_response(
                message="Invalid or expired token",
                errors={'token': [str(e)]},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return self.error_response(
                message="Logout failed",
                errors={'error': [str(e)]},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for comprehensive user profile operations (user + role-specific profile)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get current user profile including role-specific profile
        """
        user = request.user
        user_data = UserProfileSerializer(user).data
        
        # Add role-specific profile data
        role_profile = None
        if user.role == 'freelancer':
            try:
                freelancer = user.freelancer_profile
                role_profile = FreelancerSerializer(freelancer).data
            except Freelancer.DoesNotExist:
                role_profile = None
        elif user.role == 'client':
            try:
                client = user.client_profile
                role_profile = ClientSerializer(client).data
            except Client.DoesNotExist:
                role_profile = None
        
        # Combine user and role profile data
        profile_data = {
            'user': user_data,
            'role_profile': role_profile,
            'has_role_profile': role_profile is not None
        }
        
        return self.success_response(
            message="Profile retrieved successfully",
            data=profile_data,
            status_code=status.HTTP_200_OK
        )
    
    def put(self, request):
        """
        Update current user profile and/or role-specific profile
        """
        user = request.user
        
        # Extract user profile data and role profile data from request
        user_data = {}
        role_data = {}
        
        # Fields that belong to user profile
        user_fields = ['first_name', 'last_name', 'phone', 'bio', 'profile_picture']
        for field in user_fields:
            if field in request.data:
                user_data[field] = request.data[field]
        
        # Fields that belong to role profile
        if user.role == 'freelancer':
            role_fields = ['title', 'category', 'rate', 'skills', 'bio', 'location']
            for field in role_fields:
                if field in request.data:
                    role_data[field] = request.data[field]
        elif user.role == 'client':
            role_fields = ['company_name']
            for field in role_fields:
                if field in request.data:
                    role_data[field] = request.data[field]
        
        # Update user profile if user data provided
        if user_data:
            user_serializer = UserProfileUpdateSerializer(
                user,
                data=user_data,
                partial=True
            )
            if not user_serializer.is_valid():
                return self.error_response(
                    message="User profile update failed",
                    errors=user_serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            user_serializer.save()
        
        # Update or create role profile if role data provided
        role_profile = None
        if role_data:
            if user.role == 'freelancer':
                try:
                    # Update existing freelancer profile
                    freelancer = user.freelancer_profile
                    for field, value in role_data.items():
                        setattr(freelancer, field, value)
                    freelancer.save()
                    role_profile = FreelancerSerializer(freelancer).data
                except Freelancer.DoesNotExist:
                    # Create new freelancer profile
                    role_serializer = FreelancerCreateSerializer(
                        data=role_data,
                        context={'request': request}
                    )
                    if role_serializer.is_valid():
                        freelancer = role_serializer.save()
                        role_profile = FreelancerSerializer(freelancer).data
                    else:
                        return self.error_response(
                            message="Freelancer profile creation failed",
                            errors=role_serializer.errors,
                            status_code=status.HTTP_400_BAD_REQUEST
                        )
            
            elif user.role == 'client':
                try:
                    # Update existing client profile
                    client = user.client_profile
                    for field, value in role_data.items():
                        setattr(client, field, value)
                    client.save()
                    role_profile = ClientSerializer(client).data
                except Client.DoesNotExist:
                    # Create new client profile
                    role_serializer = ClientCreateSerializer(
                        data=role_data,
                        context={'request': request}
                    )
                    if role_serializer.is_valid():
                        client = role_serializer.save()
                        role_profile = ClientSerializer(client).data
                    else:
                        return self.error_response(
                            message="Client profile creation failed",
                            errors=role_serializer.errors,
                            status_code=status.HTTP_400_BAD_REQUEST
                        )
        
        # Return updated profile data
        updated_user = User.objects.get(id=user.id)  # Refresh user data
        user_profile_data = UserProfileSerializer(updated_user).data
        
        # Get current role profile if not updated
        if not role_profile:
            if user.role == 'freelancer':
                try:
                    freelancer = updated_user.freelancer_profile
                    role_profile = FreelancerSerializer(freelancer).data
                except Freelancer.DoesNotExist:
                    role_profile = None
            elif user.role == 'client':
                try:
                    client = updated_user.client_profile
                    role_profile = ClientSerializer(client).data
                except Client.DoesNotExist:
                    role_profile = None
        
        profile_data = {
            'user': user_profile_data,
            'role_profile': role_profile,
            'has_role_profile': role_profile is not None
        }
        
        return self.success_response(
            message="Profile updated successfully",
            data=profile_data,
            status_code=status.HTTP_200_OK
        )
    
    def post(self, request):
        """
        Create role-specific profile (for backwards compatibility)
        """
        user = request.user
        
        if user.role == 'freelancer':
            try:
                # Check if profile already exists
                user.freelancer_profile
                return self.error_response(
                    message='Freelancer profile already exists',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            except Freelancer.DoesNotExist:
                serializer = FreelancerCreateSerializer(data=request.data, context={'request': request})
                if serializer.is_valid():
                    freelancer = serializer.save()
                    profile_data = {
                        'user': UserProfileSerializer(user).data,
                        'role_profile': FreelancerSerializer(freelancer).data,
                        'has_role_profile': True
                    }
                    return self.success_response(
                        message='Freelancer profile created successfully',
                        data=profile_data,
                        status_code=status.HTTP_201_CREATED
                    )
                return self.error_response(
                    message='Freelancer profile creation failed',
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        elif user.role == 'client':
            try:
                # Check if profile already exists
                user.client_profile
                return self.error_response(
                    message='Client profile already exists',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            except Client.DoesNotExist:
                serializer = ClientCreateSerializer(data=request.data, context={'request': request})
                if serializer.is_valid():
                    client = serializer.save()
                    profile_data = {
                        'user': UserProfileSerializer(user).data,
                        'role_profile': ClientSerializer(client).data,
                        'has_role_profile': True
                    }
                    return self.success_response(
                        message='Client profile created successfully',
                        data=profile_data,
                        status_code=status.HTTP_201_CREATED
                    )
                return self.error_response(
                    message='Client profile creation failed',
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        else:
            return self.error_response(
                message='User role is neither freelancer nor client',
                status_code=status.HTTP_400_BAD_REQUEST
            )


class PasswordChangeAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for password change
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Change user password
        """
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Update session auth hash to prevent logout
            update_session_auth_hash(request, user)
            
            return self.success_response(
                message="Password changed successfully",
                status_code=status.HTTP_200_OK
            )
        
        return self.error_response(
            message="Password change failed",
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class UserListAPIView(APIView, StandardResponseMixin):
    """
    API endpoint for admin to list all users
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Get list of all users (admin only)
        """
        users = User.objects.all().order_by('-date_joined')
        serializer = UserProfileSerializer(users, many=True)
        
        return self.success_response(
            message="Users retrieved successfully",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )


# CreateRoleProfileAPIView functionality has been integrated into ProfileAPIView above
# This view is kept for backwards compatibility if needed, but can be removed
class CreateRoleProfileAPIView(APIView, StandardResponseMixin):
    """
    DEPRECATED: Use ProfileAPIView instead.
    Create or get freelancer/client profile for the authenticated user based on their role.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Redirect to ProfileAPIView"""
        return ProfileAPIView().get(request)

    def post(self, request):
        """Redirect to ProfileAPIView"""
        return ProfileAPIView().post(request)


class CustomTokenRefreshView(TokenRefreshView, StandardResponseMixin):
    """
    Custom token refresh view with standardized response
    """
    
    def post(self, request, *args, **kwargs):
        """
        Refresh JWT token with custom response format
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        return self.success_response(
            message="Token refreshed successfully",
            data=serializer.validated_data,
            status_code=status.HTTP_200_OK
        )