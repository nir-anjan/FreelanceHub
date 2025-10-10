from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides consistent error responses
    """
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if response is not None:
        # Log the exception
        logger.error(f"API Exception: {exc}", exc_info=True)
        
        # Customize the response format
        custom_response_data = {
            'success': False,
            'message': 'An error occurred',
            'errors': {}
        }

        # Handle different types of errors
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['message'] = str(response.data['detail'])
            else:
                custom_response_data['errors'] = response.data
                
                # Try to extract a meaningful message
                if 'non_field_errors' in response.data:
                    custom_response_data['message'] = response.data['non_field_errors'][0]
                elif len(response.data) == 1:
                    field, errors = next(iter(response.data.items()))
                    if isinstance(errors, list) and len(errors) > 0:
                        custom_response_data['message'] = f"{field}: {errors[0]}"
                    else:
                        custom_response_data['message'] = f"{field}: {errors}"
        elif isinstance(response.data, list):
            custom_response_data['message'] = response.data[0] if response.data else 'An error occurred'
        else:
            custom_response_data['message'] = str(response.data)

        # Set the custom response data
        response.data = custom_response_data

    return response