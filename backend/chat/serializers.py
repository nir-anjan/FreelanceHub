from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ChatThread, ChatMessage, MessageRead
from api.auth.models import Client, Freelancer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for chat context"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ClientSerializer(serializers.ModelSerializer):
    """Basic client serializer for chat context"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'user', 'company_name']


class FreelancerSerializer(serializers.ModelSerializer):
    """Basic freelancer serializer for chat context"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Freelancer
        fields = ['id', 'user', 'title', 'rate']


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender = UserSerializer(read_only=True)
    sender_type = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'thread', 'sender', 'sender_type', 'message', 
            'message_type', 'sent_at', 'is_read', 'edited_at', 'metadata'
        ]
    
    def get_sender_type(self, obj):
        """Determine if sender is client or freelancer"""
        try:
            if hasattr(obj.sender, 'client_profile'):
                return 'client'
            elif hasattr(obj.sender, 'freelancer_profile'):
                return 'freelancer'
        except:
            pass
        return 'unknown'


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat messages"""
    class Meta:
        model = ChatMessage
        fields = ['message', 'message_type', 'metadata']
    
    def create(self, validated_data):
        # Thread and sender will be set in the view
        return ChatMessage.objects.create(**validated_data)


class ChatThreadSerializer(serializers.ModelSerializer):
    """Serializer for chat threads"""
    client = ClientSerializer(read_only=True)
    freelancer = FreelancerSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    participant_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatThread
        fields = [
            'id', 'client', 'freelancer', 'job', 'created_at', 
            'last_message_at', 'is_active', 'last_message', 
            'unread_count', 'participant_info'
        ]
    
    def get_last_message(self, obj):
        """Get the last message in this thread"""
        last_message = obj.messages.last()
        if last_message:
            return ChatMessageSerializer(last_message).data
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count for the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
    
    def get_participant_info(self, obj):
        """Get participant info relative to current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other_participant = obj.get_other_participant(request.user)
            if other_participant:
                return UserSerializer(other_participant).data
        return None


class ChatThreadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat threads"""
    client_id = serializers.IntegerField(write_only=True)
    freelancer_id = serializers.IntegerField(write_only=True)
    job_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = ChatThread
        fields = ['client_id', 'freelancer_id', 'job_id']
    
    def create(self, validated_data):
        client_id = validated_data.pop('client_id')
        freelancer_id = validated_data.pop('freelancer_id')
        job_id = validated_data.pop('job_id', None)
        
        try:
            client = Client.objects.get(id=client_id)
            freelancer = Freelancer.objects.get(id=freelancer_id)
            
            # Check if thread already exists
            thread, created = ChatThread.objects.get_or_create(
                client=client,
                freelancer=freelancer,
                job_id=job_id,
                defaults=validated_data
            )
            
            return thread
        except (Client.DoesNotExist, Freelancer.DoesNotExist) as e:
            raise serializers.ValidationError(f"Invalid participant: {str(e)}")


class MessageReadSerializer(serializers.ModelSerializer):
    """Serializer for message read receipts"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MessageRead
        fields = ['id', 'message', 'user', 'read_at']