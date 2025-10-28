"""
Supabase integration utilities for FreelanceMarketplace
Provides helper functions for Supabase operations
"""

import os
from supabase import create_client, Client
from django.conf import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    """
    Singleton Supabase client for the application
    """
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Optional[Client]:
        """
        Get or create Supabase client instance
        """
        if cls._instance is None:
            try:
                supabase_url = getattr(settings, 'SUPABASE_URL', '')
                supabase_key = getattr(settings, 'SUPABASE_KEY', '')
                
                if not supabase_url or not supabase_key:
                    logger.warning("Supabase URL or Key not configured")
                    return None
                
                cls._instance = create_client(supabase_url, supabase_key)
                logger.info("Supabase client initialized successfully")
                
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                return None
        
        return cls._instance
    
    @classmethod
    def test_connection(cls) -> bool:
        """
        Test Supabase connection
        """
        try:
            client = cls.get_client()
            if client is None:
                return False
            
            # Test with a simple query (you can adjust this based on your needs)
            result = client.table('auth.users').select('id').limit(1).execute()
            return True
            
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False

# Convenience functions
def get_supabase_client() -> Optional[Client]:
    """
    Get Supabase client instance
    """
    return SupabaseClient.get_client()

def test_supabase_connection() -> bool:
    """
    Test Supabase connection
    """
    return SupabaseClient.test_connection()

# Storage utilities (if you plan to use Supabase Storage)
def upload_file_to_supabase(bucket_name: str, file_path: str, file_data: bytes) -> dict:
    """
    Upload file to Supabase storage
    """
    try:
        client = get_supabase_client()
        if client is None:
            raise Exception("Supabase client not available")
        
        result = client.storage.from_(bucket_name).upload(file_path, file_data)
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        return {"success": False, "error": str(e)}

def delete_file_from_supabase(bucket_name: str, file_path: str) -> dict:
    """
    Delete file from Supabase storage
    """
    try:
        client = get_supabase_client()
        if client is None:
            raise Exception("Supabase client not available")
        
        result = client.storage.from_(bucket_name).remove([file_path])
        return {"success": True, "data": result}
        
    except Exception as e:
        logger.error(f"File deletion failed: {e}")
        return {"success": False, "error": str(e)}

def get_file_url_from_supabase(bucket_name: str, file_path: str) -> Optional[str]:
    """
    Get public URL for file in Supabase storage
    """
    try:
        client = get_supabase_client()
        if client is None:
            return None
        
        result = client.storage.from_(bucket_name).get_public_url(file_path)
        return result
        
    except Exception as e:
        logger.error(f"Failed to get file URL: {e}")
        return None