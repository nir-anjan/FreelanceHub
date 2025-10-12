from django.db import models
from django.contrib.auth import get_user_model
from api.auth.models import Client, Freelancer, Job

User = get_user_model()


class ChatThread(models.Model):
    """Chat thread between a client and freelancer, optionally linked to a job"""
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='new_chat_threads')
    freelancer = models.ForeignKey(Freelancer, on_delete=models.CASCADE, related_name='new_chat_threads')
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, blank=True, null=True, related_name='new_chat_threads')
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now_add=True)  # Enhanced: for sorting threads by activity
    is_active = models.BooleanField(default=True)  # Enhanced: to manage thread status

    class Meta:
        db_table = 'new_chat_threads'
        unique_together = ['client', 'freelancer', 'job']  # Prevent duplicate threads
        indexes = [
            models.Index(fields=['client', 'freelancer']),
            models.Index(fields=['last_message_at']),
        ]

    def __str__(self):
        return f"Thread: {self.client.user.username} <-> {self.freelancer.user.username}"

    def get_participant_users(self):
        """Get both participant users for this thread"""
        return [self.client.user, self.freelancer.user]

    def is_participant(self, user):
        """Check if a user is a participant in this thread"""
        return user == self.client.user or user == self.freelancer.user

    def get_other_participant(self, user):
        """Get the other participant given one user"""
        if user == self.client.user:
            return self.freelancer.user
        elif user == self.freelancer.user:
            return self.client.user
        return None


class ChatMessage(models.Model):
    """Individual chat messages within a thread"""
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text Message'),
        ('system', 'System Message'),
        ('payment_completed', 'Payment Completed'),
        ('dispute_created', 'Dispute Created'),
        ('job_update', 'Job Update'),
    ]
    
    thread = models.ForeignKey(ChatThread, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='new_sent_messages')
    message = models.TextField()
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)  # Enhanced: track read status
    edited_at = models.DateTimeField(null=True, blank=True)  # Enhanced: track edits
    
    # For system messages and special events
    metadata = models.JSONField(null=True, blank=True)  # Store additional data for special message types

    class Meta:
        db_table = 'new_chat_messages'
        indexes = [
            models.Index(fields=['thread', 'sent_at']),
            models.Index(fields=['sender', 'sent_at']),
            models.Index(fields=['is_read']),
        ]
        ordering = ['sent_at']

    def __str__(self):
        return f"Message {self.id} by {self.sender.username} in thread {self.thread.id}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update thread's last_message_at when a new message is added
        self.thread.last_message_at = self.sent_at
        self.thread.save(update_fields=['last_message_at'])

    def mark_as_read(self):
        """Mark this message as read"""
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read'])


class MessageRead(models.Model):
    """Track which messages have been read by which users"""
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='read_receipts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='new_message_reads')
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'new_message_reads'
        unique_together = ['message', 'user']
        indexes = [
            models.Index(fields=['message', 'user']),
            models.Index(fields=['user', 'read_at']),
        ]

    def __str__(self):
        return f"{self.user.username} read message {self.message.id}"
