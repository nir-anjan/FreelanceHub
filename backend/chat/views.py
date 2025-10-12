from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max, Count
from django.contrib.auth import get_user_model
from api.auth.models import Client, Freelancer, Job
from .models import ChatThread, ChatMessage, MessageRead
from .serializers import (
    ChatThreadSerializer, ChatThreadCreateSerializer,
    ChatMessageSerializer, ChatMessageCreateSerializer,
    MessageReadSerializer
)

User = get_user_model()


class ChatThreadListCreateView(generics.ListCreateAPIView):
    """List user's chat threads or create a new thread"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user)
        ).select_related(
            'client__user', 'freelancer__user', 'job'
        ).prefetch_related(
            'messages'
        ).annotate(
            last_message_time=Max('messages__sent_at')
        ).order_by('-last_message_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatThreadCreateSerializer
        return ChatThreadSerializer
    
    def perform_create(self, serializer):
        # Additional validation can be added here
        thread = serializer.save()
        return thread
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        thread = self.perform_create(serializer)
        
        # Return the created thread with full details
        response_serializer = ChatThreadSerializer(thread, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ChatThreadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific chat thread"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatThreadSerializer
    
    def get_queryset(self):
        user = self.request.user
        return ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user)
        ).select_related('client__user', 'freelancer__user', 'job')
    
    def perform_update(self, serializer):
        # Only allow updating certain fields
        allowed_fields = ['is_active']
        update_data = {k: v for k, v in serializer.validated_data.items() if k in allowed_fields}
        serializer.save(**update_data)


class ChatMessageListCreateView(generics.ListCreateAPIView):
    """List messages in a thread or create a new message"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        thread_id = self.kwargs['thread_id']
        user = self.request.user
        
        # Ensure user is participant in the thread
        thread = get_object_or_404(
            ChatThread.objects.filter(
                Q(client__user=user) | Q(freelancer__user=user),
                id=thread_id
            )
        )
        
        return ChatMessage.objects.filter(thread=thread).select_related(
            'sender', 'thread'
        ).order_by('sent_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ChatMessageCreateSerializer
        return ChatMessageSerializer
    
    def perform_create(self, serializer):
        thread_id = self.kwargs['thread_id']
        user = self.request.user
        
        # Get the thread and verify user is participant
        thread = get_object_or_404(
            ChatThread.objects.filter(
                Q(client__user=user) | Q(freelancer__user=user),
                id=thread_id
            )
        )
        
        serializer.save(thread=thread, sender=user)


class ChatMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific message"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(
            sender=user  # Users can only modify their own messages
        ).select_related('sender', 'thread')
    
    def perform_update(self, serializer):
        # Only allow updating message content and mark as edited
        from django.utils import timezone
        serializer.save(edited_at=timezone.now())


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, thread_id):
    """Mark messages as read in a thread"""
    user = request.user
    message_ids = request.data.get('message_ids', [])
    
    # Verify user is participant in thread
    thread = get_object_or_404(
        ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user),
            id=thread_id
        )
    )
    
    if message_ids:
        # Mark specific messages as read
        messages = ChatMessage.objects.filter(
            id__in=message_ids,
            thread=thread
        ).exclude(sender=user)  # Don't mark own messages
    else:
        # Mark all unread messages in thread as read
        messages = ChatMessage.objects.filter(
            thread=thread,
            is_read=False
        ).exclude(sender=user)
    
    # Update read status
    updated_count = messages.update(is_read=True)
    
    # Create read receipts
    for message in messages:
        MessageRead.objects.get_or_create(
            message=message,
            user=user
        )
    
    return Response({
        'status': 'success',
        'marked_read': updated_count,
        'thread_id': thread_id
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_thread_by_participants(request):
    """Get or create thread between specific participants"""
    client_id = request.query_params.get('client_id')
    freelancer_id = request.query_params.get('freelancer_id')
    job_id = request.query_params.get('job_id')
    
    if not client_id or not freelancer_id:
        return Response(
            {'error': 'client_id and freelancer_id are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        client = Client.objects.get(id=client_id)
        freelancer = Freelancer.objects.get(id=freelancer_id)
        
        # Check if current user is one of the participants
        user = request.user
        if user != client.user and user != freelancer.user:
            return Response(
                {'error': 'Not authorized to access this thread'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create thread
        thread_params = {
            'client': client,
            'freelancer': freelancer,
        }
        if job_id:
            try:
                job = Job.objects.get(id=job_id)
                thread_params['job'] = job
            except Job.DoesNotExist:
                return Response(
                    {'error': 'Job not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        thread, created = ChatThread.objects.get_or_create(**thread_params)
        
        serializer = ChatThreadSerializer(thread, context={'request': request})
        return Response({
            'thread': serializer.data,
            'created': created
        })
        
    except (Client.DoesNotExist, Freelancer.DoesNotExist):
        return Response(
            {'error': 'Client or freelancer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_message_count(request):
    """Get total unread message count for current user"""
    user = request.user
    
    unread_count = ChatMessage.objects.filter(
        thread__in=ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user)
        ),
        is_read=False
    ).exclude(sender=user).count()
    
    return Response({'unread_count': unread_count})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_dispute_from_chat(request, thread_id):
    """Create a dispute from a chat thread"""
    from api.auth.models import Dispute
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    user = request.user
    
    # Verify user is participant in thread
    thread = get_object_or_404(
        ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user),
            id=thread_id
        )
    )
    
    # Get dispute details from request
    subject = request.data.get('subject', '')
    description = request.data.get('description', '')
    
    if not subject or not description:
        return Response(
            {'error': 'Subject and description are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Create dispute
        dispute = Dispute.objects.create(
            client=thread.client,
            freelancer=thread.freelancer,
            job=thread.job,
            subject=subject,
            description=description,
            created_by=user
        )
        
        # Create system message in chat
        system_message = ChatMessage.objects.create(
            thread=thread,
            sender=user,
            message=f"Dispute created: {subject}",
            message_type='dispute_created',
            metadata={
                'dispute_id': dispute.id,
                'subject': subject,
                'description': description
            }
        )
        
        # Broadcast dispute creation to chat
        channel_layer = get_channel_layer()
        room_group_name = f'chat_{thread_id}'
        
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'chat_message_broadcast',
                'message_data': {
                    'id': system_message.id,
                    'thread': thread.id,
                    'sender': {
                        'id': user.id,
                        'username': user.username
                    },
                    'message': system_message.message,
                    'message_type': 'dispute_created',
                    'sent_at': system_message.sent_at.isoformat(),
                    'metadata': system_message.metadata
                }
            }
        )
        
        return Response({
            'status': 'success',
            'dispute_id': dispute.id,
            'message': 'Dispute created successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to create dispute: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def initiate_payment_from_chat(request, thread_id):
    """Initiate a payment from a chat thread"""
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    user = request.user
    
    # Verify user is participant in thread
    thread = get_object_or_404(
        ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user),
            id=thread_id
        )
    )
    
    # Get payment details from request
    amount = request.data.get('amount')
    description = request.data.get('description', '')
    
    if not amount:
        return Response(
            {'error': 'Amount is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Here you would integrate with actual payment processor
        # For now, we'll create a placeholder payment record
        
        payment_data = {
            'amount': float(amount),
            'description': description,
            'client_id': thread.client.id,
            'freelancer_id': thread.freelancer.id,
            'job_id': thread.job.id if thread.job else None,
            'initiated_by': user.id,
            'status': 'initiated'
        }
        
        # Create system message in chat
        system_message = ChatMessage.objects.create(
            thread=thread,
            sender=user,
            message=f"Payment initiated: ${amount}",
            message_type='payment_completed',
            metadata=payment_data
        )
        
        # Broadcast payment initiation to chat
        channel_layer = get_channel_layer()
        room_group_name = f'chat_{thread_id}'
        
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'chat_message_broadcast',
                'message_data': {
                    'id': system_message.id,
                    'thread': thread.id,
                    'sender': {
                        'id': user.id,
                        'username': user.username
                    },
                    'message': system_message.message,
                    'message_type': 'payment_completed',
                    'sent_at': system_message.sent_at.isoformat(),
                    'metadata': system_message.metadata
                }
            }
        )
        
        return Response({
            'status': 'success',
            'payment_data': payment_data,
            'message': 'Payment initiated successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to initiate payment: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_job_update_to_chat(request, thread_id):
    """Send job status update to chat"""
    from channels.layers import get_channel_layer
    from asgiref.sync import async_to_sync
    
    user = request.user
    
    # Verify user is participant in thread
    thread = get_object_or_404(
        ChatThread.objects.filter(
            Q(client__user=user) | Q(freelancer__user=user),
            id=thread_id
        )
    )
    
    # Get job update details
    job_status = request.data.get('job_status')
    update_message = request.data.get('message', '')
    
    if not job_status:
        return Response(
            {'error': 'Job status is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Update job status if thread has associated job
        if thread.job:
            thread.job.status = job_status
            thread.job.save()
        
        # Create system message in chat
        system_message = ChatMessage.objects.create(
            thread=thread,
            sender=user,
            message=update_message or f"Job status updated to: {job_status}",
            message_type='job_update',
            metadata={
                'job_id': thread.job.id if thread.job else None,
                'old_status': thread.job.status if thread.job else None,
                'new_status': job_status,
                'update_message': update_message
            }
        )
        
        # Broadcast job update to chat
        channel_layer = get_channel_layer()
        room_group_name = f'chat_{thread_id}'
        
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'chat_message_broadcast',
                'message_data': {
                    'id': system_message.id,
                    'thread': thread.id,
                    'sender': {
                        'id': user.id,
                        'username': user.username
                    },
                    'message': system_message.message,
                    'message_type': 'job_update',
                    'sent_at': system_message.sent_at.isoformat(),
                    'metadata': system_message.metadata
                }
            }
        )
        
        return Response({
            'status': 'success',
            'job_status': job_status,
            'message': 'Job update sent successfully'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to send job update: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
