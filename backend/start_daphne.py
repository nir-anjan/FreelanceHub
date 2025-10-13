#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Setup Django
django.setup()

# Import the ASGI application
from backend.asgi import application

if __name__ == "__main__":
    import daphne.management.commands.runserver as daphne_runserver
    
    # Start Daphne
    from daphne.server import Server
    from daphne.endpoints import build_endpoint_description_strings
    
    server = Server(
        application=application,
        endpoints=build_endpoint_description_strings(host="127.0.0.1", port=8000),
        verbosity=2,
    )
    
    print("Starting Daphne ASGI server on 127.0.0.1:8000...")
    server.run()