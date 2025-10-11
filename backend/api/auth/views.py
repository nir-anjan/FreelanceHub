from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

from .models import User, Freelancer, Client, ChatThread, ChatMessage, Job, Payment
from django.db import models
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


# ---------------------- DASHBOARD VIEWS -------------------------

class DashboardAPIView(APIView, StandardResponseMixin):
    """
    Dashboard overview for authenticated users
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get dashboard overview data based on user role
        """
        user = request.user
        data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'profile_picture': user.profile_picture,
            },
            'stats': {}
        }
        
        if user.is_client:
            client_profile = getattr(user, 'client_profile', None)
            if client_profile:
                # Get client stats
                jobs_count = client_profile.jobs.count()
                active_jobs = client_profile.jobs.filter(status='in_progress').count()
                completed_jobs = client_profile.jobs.filter(status='completed').count()
                total_spent = client_profile.payments.filter(status='completed').aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
                
                data['stats'] = {
                    'total_jobs_posted': jobs_count,
                    'active_jobs': active_jobs,
                    'completed_jobs': completed_jobs,
                    'total_spent': float(total_spent),
                    'unread_messages': 0  # TODO: implement message counts
                }
        
        elif user.is_freelancer:
            freelancer_profile = getattr(user, 'freelancer_profile', None)
            if freelancer_profile:
                # Get freelancer stats
                total_earned = freelancer_profile.payments.filter(status='completed').aggregate(
                    total=models.Sum('amount')
                )['total'] or 0
                
                data['stats'] = {
                    'total_earned': float(total_earned),
                    'active_jobs': 0,  # TODO: implement when job applications are added
                    'completed_jobs': freelancer_profile.payments.filter(status='completed').count(),
                    'unread_messages': 0  # TODO: implement message counts
                }
        
        return self.success_response(
            message="Dashboard data retrieved successfully",
            data=data
        )


# ---------------------- JOB MANAGEMENT VIEWS -------------------------

class JobCreateAPIView(APIView, StandardResponseMixin):
    """
    Create new job (Clients only)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Create a new job posting
        """
        user = request.user
        
        # Check if user is a client
        if not user.is_client:
            return self.error_response(
                message="Only clients can create job postings",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        client_profile = getattr(user, 'client_profile', None)
        if not client_profile:
            return self.error_response(
                message="Client profile not found. Please complete your profile setup.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Create job with client association
        from .models import Job
        job_data = request.data.copy()
        
        # Validate required fields
        required_fields = ['title', 'description']
        for field in required_fields:
            if not job_data.get(field):
                return self.error_response(
                    message=f"Field '{field}' is required",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            job = Job.objects.create(
                client=client_profile,
                title=job_data.get('title'),
                description=job_data.get('description'),
                budget_min=job_data.get('budget_min'),
                budget_max=job_data.get('budget_max'),
                duration=job_data.get('duration'),
                category=job_data.get('category'),
                skills=job_data.get('skills'),
                requirements=job_data.get('requirements'),
                project_details=job_data.get('project_details'),
            )
            
            job_response = {
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'budget_min': float(job.budget_min) if job.budget_min else None,
                'budget_max': float(job.budget_max) if job.budget_max else None,
                'duration': job.duration,
                'category': job.category,
                'skills': job.skills,
                'requirements': job.requirements,
                'project_details': job.project_details,
                'status': job.status,
                'proposals_count': job.proposals_count,
                'created_at': job.created_at.isoformat(),
            }
            
            return self.success_response(
                message="Job created successfully",
                data=job_response,
                status_code=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return self.error_response(
                message=f"Error creating job: {str(e)}",
                status_code=status.HTTP_400_BAD_REQUEST
            )


class JobHistoryAPIView(APIView, StandardResponseMixin):
    """
    Get job history for clients
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get all jobs posted by the client
        """
        user = request.user
        
        if not user.is_client:
            return self.error_response(
                message="Only clients can access job history",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        client_profile = getattr(user, 'client_profile', None)
        if not client_profile:
            return self.error_response(
                message="Client profile not found",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        jobs = client_profile.jobs.all().order_by('-created_at')
        
        jobs_data = []
        for job in jobs:
            jobs_data.append({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'budget_min': float(job.budget_min) if job.budget_min else None,
                'budget_max': float(job.budget_max) if job.budget_max else None,
                'duration': job.duration,
                'category': job.category,
                'status': job.status,
                'proposals_count': job.proposals_count,
                'created_at': job.created_at.isoformat(),
            })
        
        return self.success_response(
            message="Job history retrieved successfully",
            data={
                'jobs': jobs_data,
                'total_count': len(jobs_data)
            }
        )


class ActiveJobsAPIView(APIView, StandardResponseMixin):
    """
    Get active jobs for freelancers
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get active jobs for freelancer (jobs they're working on)
        """
        user = request.user
        
        if not user.is_freelancer:
            return self.error_response(
                message="Only freelancers can access active jobs",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        freelancer_profile = getattr(user, 'freelancer_profile', None)
        if not freelancer_profile:
            return self.error_response(
                message="Freelancer profile not found",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # For now, get jobs where freelancer has payments (indicating they're working on it)
        # TODO: Implement proper job application/assignment system
        from .models import Job
        active_jobs = Job.objects.filter(
            payments__freelancer=freelancer_profile,
            status__in=['in_progress', 'open']
        ).distinct().order_by('-created_at')
        
        jobs_data = []
        for job in active_jobs:
            jobs_data.append({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'budget_min': float(job.budget_min) if job.budget_min else None,
                'budget_max': float(job.budget_max) if job.budget_max else None,
                'duration': job.duration,
                'category': job.category,
                'status': job.status,
                'client': {
                    'id': job.client.id,
                    'name': job.client.user.get_full_name(),
                    'company_name': job.client.company_name,
                },
                'created_at': job.created_at.isoformat(),
            })
        
        return self.success_response(
            message="Active jobs retrieved successfully",
            data={
                'jobs': jobs_data,
                'total_count': len(jobs_data)
            }
        )


# ---------------------- PAYMENT VIEWS -------------------------

class PaymentHistoryAPIView(APIView, StandardResponseMixin):
    """
    Get payment history for authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get payment history based on user role
        """
        user = request.user
        payments_data = []
        
        if user.is_client:
            client_profile = getattr(user, 'client_profile', None)
            if client_profile:
                payments = client_profile.payments.all().order_by('-created_at')
                for payment in payments:
                    payments_data.append({
                        'id': payment.id,
                        'amount': float(payment.amount),
                        'currency': payment.currency,
                        'status': payment.status,
                        'payment_method': payment.payment_method,
                        'transaction_id': payment.transaction_id,
                        'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
                        'created_at': payment.created_at.isoformat(),
                        'job': {
                            'id': payment.job.id,
                            'title': payment.job.title,
                        },
                        'freelancer': {
                            'id': payment.freelancer.id,
                            'name': payment.freelancer.user.get_full_name(),
                        },
                        'type': 'payment_made'
                    })
        
        elif user.is_freelancer:
            freelancer_profile = getattr(user, 'freelancer_profile', None)
            if freelancer_profile:
                payments = freelancer_profile.payments.all().order_by('-created_at')
                for payment in payments:
                    payments_data.append({
                        'id': payment.id,
                        'amount': float(payment.amount),
                        'currency': payment.currency,
                        'status': payment.status,
                        'payment_method': payment.payment_method,
                        'transaction_id': payment.transaction_id,
                        'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
                        'created_at': payment.created_at.isoformat(),
                        'job': {
                            'id': payment.job.id,
                            'title': payment.job.title,
                        },
                        'client': {
                            'id': payment.client.id,
                            'name': payment.client.user.get_full_name(),
                            'company_name': payment.client.company_name,
                        },
                        'type': 'payment_received'
                    })
        
        # Calculate totals
        total_amount = sum(p['amount'] for p in payments_data if p['status'] == 'completed')
        
        return self.success_response(
            message="Payment history retrieved successfully",
            data={
                'payments': payments_data,
                'total_count': len(payments_data),
                'total_amount': total_amount,
                'currency': 'INR'
            }
        )


# ---------------------- INBOX VIEWS -------------------------

class InboxAPIView(APIView, StandardResponseMixin):
    """
    Get all chat threads for authenticated user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get all chat threads where user is participant
        """
        user = request.user
        threads_data = []
        
        if user.is_client:
            client_profile = getattr(user, 'client_profile', None)
            if client_profile:
                threads = client_profile.chat_threads.all().order_by('-created_at')
                for thread in threads:
                    # Get last message
                    last_message = thread.messages.last()
                    threads_data.append({
                        'id': thread.id,
                        'other_user': {
                            'id': thread.freelancer.user.id,
                            'name': thread.freelancer.user.get_full_name(),
                            'role': 'freelancer',
                            'profile_picture': thread.freelancer.user.profile_picture,
                        },
                        'job': {
                            'id': thread.job.id,
                            'title': thread.job.title,
                        } if thread.job else None,
                        'last_message': {
                            'id': last_message.id,
                            'message': last_message.message,
                            'sender': last_message.sender.get_full_name(),
                            'sent_at': last_message.sent_at.isoformat(),
                        } if last_message else None,
                        'created_at': thread.created_at.isoformat(),
                        'unread_count': 0  # TODO: implement unread message counting
                    })
        
        elif user.is_freelancer:
            freelancer_profile = getattr(user, 'freelancer_profile', None)
            if freelancer_profile:
                threads = freelancer_profile.chat_threads.all().order_by('-created_at')
                for thread in threads:
                    # Get last message
                    last_message = thread.messages.last()
                    threads_data.append({
                        'id': thread.id,
                        'other_user': {
                            'id': thread.client.user.id,
                            'name': thread.client.user.get_full_name(),
                            'role': 'client',
                            'profile_picture': thread.client.user.profile_picture,
                            'company_name': thread.client.company_name,
                        },
                        'job': {
                            'id': thread.job.id,
                            'title': thread.job.title,
                        } if thread.job else None,
                        'last_message': {
                            'id': last_message.id,
                            'message': last_message.message,
                            'sender': last_message.sender.get_full_name(),
                            'sent_at': last_message.sent_at.isoformat(),
                        } if last_message else None,
                        'created_at': thread.created_at.isoformat(),
                        'unread_count': 0  # TODO: implement unread message counting
                    })
        
        return self.success_response(
            message="Inbox retrieved successfully",
            data={
                'threads': threads_data,
                'total_count': len(threads_data)
            }
        )


class ChatMessagesAPIView(APIView, StandardResponseMixin):
    """
    Get messages for a specific chat thread and send new messages
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, thread_id):
        """
        Get all messages for a chat thread
        """
        user = request.user
        
        try:
            thread = ChatThread.objects.get(id=thread_id)
            
            # Check if user is participant in this thread
            if user.is_client:
                client_profile = getattr(user, 'client_profile', None)
                if not client_profile or thread.client != client_profile:
                    return self.error_response(
                        message="Access denied",
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            elif user.is_freelancer:
                freelancer_profile = getattr(user, 'freelancer_profile', None)
                if not freelancer_profile or thread.freelancer != freelancer_profile:
                    return self.error_response(
                        message="Access denied",
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            else:
                return self.error_response(
                    message="Access denied",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            messages = thread.messages.all().order_by('sent_at')
            messages_data = []
            
            for message in messages:
                messages_data.append({
                    'id': message.id,
                    'message': message.message,
                    'sender': {
                        'id': message.sender.id,
                        'name': message.sender.get_full_name(),
                        'role': message.sender.role,
                        'profile_picture': message.sender.profile_picture,
                    },
                    'sent_at': message.sent_at.isoformat(),
                    'is_own_message': message.sender == user
                })
            
            # Get thread info
            thread_info = {
                'id': thread.id,
                'client': {
                    'id': thread.client.user.id,
                    'name': thread.client.user.get_full_name(),
                    'company_name': thread.client.company_name,
                },
                'freelancer': {
                    'id': thread.freelancer.user.id,
                    'name': thread.freelancer.user.get_full_name(),
                },
                'job': {
                    'id': thread.job.id,
                    'title': thread.job.title,
                } if thread.job else None,
                'created_at': thread.created_at.isoformat(),
            }
            
            return self.success_response(
                message="Messages retrieved successfully",
                data={
                    'thread': thread_info,
                    'messages': messages_data,
                    'total_count': len(messages_data)
                }
            )
            
        except ChatThread.DoesNotExist:
            return self.error_response(
                message="Chat thread not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, thread_id):
        """
        Send a new message in a chat thread
        """
        user = request.user
        message_text = request.data.get('message', '').strip()
        
        if not message_text:
            return self.error_response(
                message="Message content is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            thread = ChatThread.objects.get(id=thread_id)
            
            # Check if user is participant in this thread
            if user.is_client:
                client_profile = getattr(user, 'client_profile', None)
                if not client_profile or thread.client != client_profile:
                    return self.error_response(
                        message="Access denied",
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            elif user.is_freelancer:
                freelancer_profile = getattr(user, 'freelancer_profile', None)
                if not freelancer_profile or thread.freelancer != freelancer_profile:
                    return self.error_response(
                        message="Access denied",
                        status_code=status.HTTP_403_FORBIDDEN
                    )
            else:
                return self.error_response(
                    message="Access denied",
                    status_code=status.HTTP_403_FORBIDDEN
                )
            
            # Create new message
            message = ChatMessage.objects.create(
                thread=thread,
                sender=user,
                message=message_text
            )
            
            message_data = {
                'id': message.id,
                'message': message.message,
                'sender': {
                    'id': message.sender.id,
                    'name': message.sender.get_full_name(),
                    'role': message.sender.role,
                    'profile_picture': message.sender.profile_picture,
                },
                'sent_at': message.sent_at.isoformat(),
                'is_own_message': True
            }
            
            return self.success_response(
                message="Message sent successfully",
                data=message_data,
                status_code=status.HTTP_201_CREATED
            )
            
        except ChatThread.DoesNotExist:
            return self.error_response(
                message="Chat thread not found",
                status_code=status.HTTP_404_NOT_FOUND
            )


# ---------------------- PUBLIC LISTING ENDPOINTS ----------------------

class AllJobsAPIView(APIView, StandardResponseMixin):
    """
    Public endpoint to list all available jobs
    Accessible to both authenticated and unauthenticated users
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Get all open job listings with filtering and pagination
        """
        try:
            # Start with open jobs by default
            jobs = Job.objects.filter(status='open').select_related('client__user').order_by('-created_at')
            
            # Apply filters from query parameters
            category = request.GET.get('category')
            if category:
                jobs = jobs.filter(category__icontains=category)
            
            skills = request.GET.get('skills')
            if skills:
                jobs = jobs.filter(skills__icontains=skills)
            
            status_param = request.GET.get('status')
            if status_param:
                jobs = jobs.filter(status=status_param)
            
            min_budget = request.GET.get('min_budget')
            if min_budget:
                try:
                    jobs = jobs.filter(budget_min__gte=float(min_budget))
                except ValueError:
                    pass
            
            max_budget = request.GET.get('max_budget')
            if max_budget:
                try:
                    jobs = jobs.filter(budget_max__lte=float(max_budget))
                except ValueError:
                    pass
            
            # Pagination
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            start = (page - 1) * page_size
            end = start + page_size
            
            total_count = jobs.count()
            jobs_page = jobs[start:end]
            
            # Serialize the jobs
            from .serializers import JobListSerializer
            serializer = JobListSerializer(jobs_page, many=True)
            
            return self.success_response(
                message="Jobs retrieved successfully",
                data={
                    'jobs': serializer.data,
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_count': total_count,
                        'total_pages': (total_count + page_size - 1) // page_size,
                        'has_next': end < total_count,
                        'has_previous': page > 1
                    }
                }
            )
            
        except Exception as e:
            return self.error_response(
                message=f"Error retrieving jobs: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AllFreelancersAPIView(APIView, StandardResponseMixin):
    """
    Public endpoint to list all freelancers
    Accessible to both authenticated and unauthenticated users
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """
        Get all freelancer profiles with filtering and pagination
        """
        try:
            # Get all freelancers with user data
            freelancers = Freelancer.objects.select_related('user').order_by('-created_at')
            
            # Apply filters from query parameters
            category = request.GET.get('category')
            if category:
                freelancers = freelancers.filter(category__icontains=category)
            
            skills = request.GET.get('skills')
            if skills:
                freelancers = freelancers.filter(skills__icontains=skills)
            
            location = request.GET.get('location')
            if location:
                freelancers = freelancers.filter(location__icontains=location)
            
            min_rate = request.GET.get('rate_min')
            if min_rate:
                try:
                    freelancers = freelancers.filter(rate__gte=float(min_rate))
                except ValueError:
                    pass
                    
            max_rate = request.GET.get('rate_max')
            if max_rate:
                try:
                    freelancers = freelancers.filter(rate__lte=float(max_rate))
                except ValueError:
                    pass
            
            # Ordering
            ordering = request.GET.get('ordering', '-created_at')
            if ordering in ['-created_at', 'created_at', 'rate', '-rate']:
                freelancers = freelancers.order_by(ordering)
            
            # Pagination
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            start = (page - 1) * page_size
            end = start + page_size
            
            total_count = freelancers.count()
            freelancers_page = freelancers[start:end]
            
            # Serialize the freelancers
            from .serializers import FreelancerListSerializer
            serializer = FreelancerListSerializer(freelancers_page, many=True)
            
            return self.success_response(
                message="Freelancers retrieved successfully",
                data={
                    'freelancers': serializer.data,
                    'pagination': {
                        'current_page': page,
                        'page_size': page_size,
                        'total_count': total_count,
                        'total_pages': (total_count + page_size - 1) // page_size,
                        'has_next': end < total_count,
                        'has_previous': page > 1
                    }
                }
            )
            
        except Exception as e:
            return self.error_response(
                message=f"Error retrieving freelancers: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )