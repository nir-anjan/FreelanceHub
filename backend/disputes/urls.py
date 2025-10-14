from django.urls import path
from .views import AdminDisputeListView, AdminDisputeResolveView

app_name = 'disputes'

urlpatterns = [
    path('admin/disputes/', AdminDisputeListView.as_view(), name='admin_dispute_list'),
    path('admin/disputes/<int:dispute_id>/resolve/', AdminDisputeResolveView.as_view(), name='admin_dispute_resolve'),
]