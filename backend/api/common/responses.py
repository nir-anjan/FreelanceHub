from rest_framework.response import Response
from rest_framework import status


class StandardResponseMixin:
    """
    Mixin to provide standardized API responses
    """
    
    @staticmethod
    def success_response(message="Success", data=None, status_code=status.HTTP_200_OK):
        """
        Standard success response format
        """
        response_data = {
            'success': True,
            'message': message,
        }
        if data is not None:
            response_data['data'] = data
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error_response(message="Error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
        """
        Standard error response format
        """
        response_data = {
            'success': False,
            'message': message,
        }
        if errors is not None:
            response_data['errors'] = errors
            
        return Response(response_data, status=status_code)


def get_client_ip(request):
    """
    Get client IP address from request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip