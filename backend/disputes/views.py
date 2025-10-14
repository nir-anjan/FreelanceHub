from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage

from api.auth.models import Dispute, User
from api.common.permissions import IsAdminUser
from api.common.responses import StandardResponseMixin


class AdminDisputeListView(APIView, StandardResponseMixin):
    """
    Admin endpoint to list all disputes with filtering and pagination
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get all disputes for admin review"""
        try:
            disputes = Dispute.objects.select_related(
                'job', 'client__user', 'freelancer__user', 'resolved_by'
            ).order_by('-created_at')
            
            # Filter by status if specified
            status_filter = request.GET.get('status')
            if status_filter and status_filter in ['open', 'resolved', 'dismissed']:
                disputes = disputes.filter(status=status_filter)
            
            # Pagination
            page = int(request.GET.get('page', 1))
            page_size = int(request.GET.get('page_size', 20))
            
            paginator = Paginator(disputes, page_size)
            
            try:
                disputes_page = paginator.page(page)
            except PageNotAnInteger:
                disputes_page = paginator.page(1)
            except EmptyPage:
                disputes_page = paginator.page(paginator.num_pages)
            
            disputes_data = []
            for dispute in disputes_page:
                disputes_data.append({
                    'id': dispute.id,
                    'job': {
                        'id': dispute.job.id,
                        'title': dispute.job.title
                    },
                    'client': {
                        'id': dispute.client.id,
                        'name': dispute.client.user.get_full_name() or dispute.client.user.username,
                        'username': dispute.client.user.username
                    },
                    'freelancer': {
                        'id': dispute.freelancer.id,
                        'name': dispute.freelancer.user.get_full_name() or dispute.freelancer.user.username,
                        'username': dispute.freelancer.user.username
                    },
                    'description': dispute.description,
                    'status': dispute.status,
                    'resolution': dispute.resolution,
                    'created_at': dispute.created_at.isoformat(),
                    'resolved_at': dispute.resolved_at.isoformat() if dispute.resolved_at else None,
                    'resolved_by': dispute.resolved_by.username if dispute.resolved_by else None
                })
            
            return self.success_response(
                message="Disputes retrieved successfully",
                data={
                    'disputes': disputes_data,
                    'pagination': {
                        'current_page': disputes_page.number,
                        'total_pages': paginator.num_pages,
                        'total_count': paginator.count,
                        'has_next': disputes_page.has_next(),
                        'has_previous': disputes_page.has_previous()
                    }
                }
            )
            
        except Exception as e:
            return self.error_response(
                message=f"Error retrieving disputes: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminDisputeResolveView(APIView, StandardResponseMixin):
    """
    Admin endpoint to resolve or dismiss disputes
    """
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, dispute_id):
        """Resolve or dismiss a dispute"""
        try:
            dispute = get_object_or_404(Dispute, id=dispute_id)
            
            action = request.data.get('action')  # 'resolve' or 'dismiss'
            resolution = request.data.get('resolution', '')
            
            if action not in ['resolve', 'dismiss']:
                return self.error_response(
                    message="Action must be 'resolve' or 'dismiss'",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            if action == 'resolve' and not resolution.strip():
                return self.error_response(
                    message="Resolution notes are required when resolving a dispute",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            # Update dispute
            dispute.status = 'resolved' if action == 'resolve' else 'dismissed'
            dispute.resolution = resolution.strip() if resolution else None
            dispute.resolved_at = timezone.now()
            dispute.resolved_by = request.user
            dispute.save()
            
            return self.success_response(
                message=f"Dispute {action}d successfully",
                data={
                    'dispute': {
                        'id': dispute.id,
                        'status': dispute.status,
                        'resolution': dispute.resolution,
                        'resolved_at': dispute.resolved_at.isoformat(),
                        'resolved_by': dispute.resolved_by.username
                    }
                }
            )
            
        except Exception as e:
            return self.error_response(
                message=f"Error {action}ing dispute: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
