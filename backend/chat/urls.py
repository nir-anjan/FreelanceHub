from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Thread endpoints
    path('threads/', views.ChatThreadListCreateView.as_view(), name='thread-list-create'),
    path('threads/<int:pk>/', views.ChatThreadDetailView.as_view(), name='thread-detail'),
    path('threads/by-participants/', views.get_thread_by_participants, name='thread-by-participants'),
    
    # Message endpoints
    path('threads/<int:thread_id>/messages/', views.ChatMessageListCreateView.as_view(), name='message-list-create'),
    path('messages/<int:pk>/', views.ChatMessageDetailView.as_view(), name='message-detail'),
    path('threads/<int:thread_id>/mark-read/', views.mark_messages_read, name='mark-messages-read'),
    
    # Utility endpoints
    path('unread-count/', views.get_unread_message_count, name='unread-count'),
    
    # Integration endpoints
    path('threads/<int:thread_id>/create-dispute/', views.create_dispute_from_chat, name='create-dispute'),
    path('threads/<int:thread_id>/initiate-payment/', views.initiate_payment_from_chat, name='initiate-payment'),
    path('threads/<int:thread_id>/job-update/', views.send_job_update_to_chat, name='job-update'),
]