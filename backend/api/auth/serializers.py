from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .models import Freelancer, Client, Job


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user registration
    """
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone'
        )
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """
        Validate email uniqueness
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_username(self, value):
        """
        Validate username uniqueness
        """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate_role(self, value):
        """
        Validate role choice - only freelancer and client allowed for registration
        """
        valid_roles = ['freelancer', 'client']
        if value not in valid_roles:
            raise serializers.ValidationError("Invalid role. Choose either 'freelancer' or 'client'.")
        return value
    
    def validate(self, attrs):
        """
        Simple validation - only check that passwords match
        """
        password = attrs.get('password')
        password_confirm = attrs.pop('password_confirm', None)
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': "Passwords do not match."
            })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create and return a new user instance
        """
        # Remove password_confirm from validated_data as it shouldn't be saved
        validated_data.pop('password_confirm', None)
        
        # Extract password for secure handling
        password = validated_data.pop('password')
        
        # Create user instance
        user = User.objects.create(**validated_data)
        
        # Set password securely using Django's built-in method
        user.set_password(password)
        user.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    username = serializers.CharField()
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """
        Validate user credentials
        """
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Allow login with either username or email
            user = None
            if '@' in username:
                # Login with email
                try:
                    user_obj = User.objects.get(email=username.lower())
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            else:
                # Login with username
                user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
            
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Both username and password are required.")


class AdminLoginSerializer(UserLoginSerializer):
    """
    Serializer for admin login - extends UserLoginSerializer with admin check
    """
    
    def validate(self, attrs):
        """
        Validate admin credentials
        """
        attrs = super().validate(attrs)
        user = attrs['user']
        
        if not (user.role == 'admin' or user.is_superuser):
            raise serializers.ValidationError("Access denied. Admin privileges required.")
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'bio', 'profile_picture', 'date_joined', 
            'last_login', 'email_verified', 'is_active'
        )
        read_only_fields = ('id', 'username', 'date_joined', 'last_login', 'email_verified')
    
    def get_full_name(self, obj):
        """
        Get user's full name
        """
        return obj.get_full_name()


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    
    class Meta:
        model = User
        fields = (
            'first_name', 'last_name', 'phone', 'bio', 'profile_picture'
        )
    
    def validate_phone(self, value):
        """
        Validate phone number format
        """
        if value and not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Please enter a valid phone number.")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        """
        Validate old password
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value
    
    def validate(self, attrs):
        """
        Validate new password confirmation
        """
        new_password = attrs.get('new_password')
        new_password_confirm = attrs.get('new_password_confirm')
        
        if new_password != new_password_confirm:
            raise serializers.ValidationError({
                'new_password_confirm': "New passwords do not match."
            })
        
        return attrs
    
    def save(self):
        """
        Save the new password
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class TokenSerializer(serializers.Serializer):
    """
    Serializer for token response
    """
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserProfileSerializer()
    
    def create(self, validated_data):
        """
        Not implemented - this is for response only
        """
        raise NotImplementedError("TokenSerializer is read-only")
    
    def update(self, instance, validated_data):
        """
        Not implemented - this is for response only
        """
        raise NotImplementedError("TokenSerializer is read-only")


class FreelancerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a Freelancer profile linked to the authenticated user."""
    user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Freelancer
        fields = ('id', 'user_id', 'title', 'category', 'rate', 'skills', 'bio', 'location', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError('Request context is required.')

        user = request.user

        # If user_id provided, ensure it matches authenticated user
        provided_user_id = attrs.pop('user_id', None)
        if provided_user_id is not None and provided_user_id != user.id:
            raise serializers.ValidationError({'user_id': 'Authenticated user does not match provided user_id.'})

        # Ensure user role is freelancer
        if user.role != 'freelancer':
            raise serializers.ValidationError('User role is not "freelancer".')

        # Ensure freelancer profile does not already exist
        if hasattr(user, 'freelancer_profile'):
            raise serializers.ValidationError('Freelancer profile already exists for this user.')

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        freelancer = Freelancer.objects.create(user=user, **validated_data)
        return freelancer


class FreelancerSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Freelancer
        fields = ('id', 'user', 'title', 'category', 'rate', 'skills', 'bio', 'location', 'created_at')


class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a Client profile linked to the authenticated user."""
    user_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Client
        fields = ('id', 'user_id', 'company_name', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate(self, attrs):
        request = self.context.get('request')
        if not request:
            raise serializers.ValidationError('Request context is required.')

        user = request.user

        provided_user_id = attrs.pop('user_id', None)
        if provided_user_id is not None and provided_user_id != user.id:
            raise serializers.ValidationError({'user_id': 'Authenticated user does not match provided user_id.'})

        if user.role != 'client':
            raise serializers.ValidationError('User role is not "client".')

        if hasattr(user, 'client_profile'):
            raise serializers.ValidationError('Client profile already exists for this user.')

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        client = Client.objects.create(user=user, **validated_data)
        return client


class ClientSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Client
        fields = ('id', 'user', 'company_name', 'created_at')


# ---------------------- JOB LISTING SERIALIZERS ----------------------
class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job listings"""
    client_name = serializers.CharField(source='client.user.get_full_name', read_only=True)
    client_username = serializers.CharField(source='client.user.username', read_only=True)
    skills_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = (
            'id', 'title', 'description', 'category', 'budget_min', 'budget_max', 
            'duration', 'status', 'skills_list', 'created_at', 'proposals_count',
            'client_name', 'client_username'
        )
    
    def get_skills_list(self, obj):
        """Convert skills field to list format"""
        if obj.skills:
            # Handle both comma-separated and JSON array formats
            try:
                import json
                return json.loads(obj.skills) if obj.skills.startswith('[') else obj.skills.split(',')
            except:
                return obj.skills.split(',') if ',' in obj.skills else [obj.skills]
        return []


class FreelancerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for freelancer listings"""
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    profile_picture = serializers.CharField(source='user.profile_picture', read_only=True)
    bio = serializers.CharField(source='user.bio', read_only=True)
    skills_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Freelancer
        fields = (
            'id', 'name', 'username', 'email', 'title', 'category', 'rate', 
            'skills_list', 'location', 'profile_picture', 'bio', 'created_at'
        )
    
    def get_skills_list(self, obj):
        """Convert skills field to list format"""
        if obj.skills:
            # Handle both comma-separated and JSON array formats
            try:
                import json
                return json.loads(obj.skills) if obj.skills.startswith('[') else obj.skills.split(',')
            except:
                return obj.skills.split(',') if ',' in obj.skills else [obj.skills]
        return []


# ---------------------- DISPUTE SERIALIZERS -------------------------
from .models import Dispute

class DisputeSerializer(serializers.ModelSerializer):
    """
    Serializer for dispute CRUD operations
    """
    client_name = serializers.CharField(source='client.user.username', read_only=True)
    freelancer_name = serializers.CharField(source='freelancer.user.username', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.username', read_only=True)
    
    class Meta:
        model = Dispute
        fields = (
            'id', 'job', 'client', 'freelancer', 'description', 'status', 
            'resolution', 'created_at', 'resolved_at', 'resolved_by',
            'client_name', 'freelancer_name', 'job_title', 'resolved_by_name'
        )
        read_only_fields = ('id', 'status', 'resolution', 'created_at', 'resolved_at', 'resolved_by')

class DisputeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating disputes
    """
    class Meta:
        model = Dispute
        fields = ('job', 'description')
    
    def validate_job(self, value):
        """
        Validate that the user has access to dispute this job
        """
        user = self.context['request'].user
        
        # Check if user is either the client who posted the job or a freelancer working on it
        if hasattr(user, 'client_profile'):
            if value.client != user.client_profile:
                raise serializers.ValidationError("You can only create disputes for your own jobs.")
        elif hasattr(user, 'freelancer_profile'):
            # For simplicity, allow any freelancer to create disputes for any job
            # In a real system, you'd check if the freelancer is assigned to the job
            pass
        else:
            raise serializers.ValidationError("Only clients and freelancers can create disputes.")
        
        return value
    
    def create(self, validated_data):
        """
        Create dispute with proper client/freelancer assignment
        """
        user = self.context['request'].user
        job = validated_data['job']
        
        # Determine client and freelancer based on who's creating the dispute
        if hasattr(user, 'client_profile'):
            client = user.client_profile
            # For simplicity, we'll set freelancer to None if client creates dispute
            # In a real system, you'd determine the specific freelancer working on the job
            freelancer = None  
        else:  # freelancer creating dispute
            freelancer = user.freelancer_profile
            client = job.client
        
        dispute = Dispute.objects.create(
            job=job,
            client=client,
            freelancer=freelancer,
            description=validated_data['description']
        )
        
        return dispute

class DisputeResolveSerializer(serializers.ModelSerializer):
    """
    Serializer for resolving disputes (admin only)
    """
    class Meta:
        model = Dispute
        fields = ('resolution',)
    
    def validate_resolution(self, value):
        """
        Validate that resolution is not empty
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Resolution cannot be empty.")
        return value.strip()