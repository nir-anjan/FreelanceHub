from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

from .models import User
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
    API endpoint for user profile operations
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get current user profile
        """
        serializer = UserProfileSerializer(request.user)
        
        return self.success_response(
            message="Profile retrieved successfully",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    
    def put(self, request):
        """
        Update current user profile
        """
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            user = serializer.save()
            profile_data = UserProfileSerializer(user).data
            
            return self.success_response(
                message="Profile updated successfully",
                data=profile_data,
                status_code=status.HTTP_200_OK
            )
        
        return self.error_response(
            message="Profile update failed",
            errors=serializer.errors,
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


class CreateRoleProfileAPIView(APIView, StandardResponseMixin):
    """Create a freelancer or client profile for the authenticated user based on their role."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role == 'freelancer':
            serializer = FreelancerCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                freelancer = serializer.save()
                return self.success_response(
                    message='Freelancer profile created successfully',
                    data=FreelancerSerializer(freelancer).data,
                    status_code=status.HTTP_201_CREATED
                )
            return self.error_response(
                message='Freelancer profile creation failed',
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        elif user.role == 'client':
            serializer = ClientCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                client = serializer.save()
                return self.success_response(
                    message='Client profile created successfully',
                    data=ClientSerializer(client).data,
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