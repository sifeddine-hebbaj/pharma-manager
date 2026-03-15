"""
Local development settings for PharmaManager.
Extends base settings with debug-specific configurations.
"""

from .base import *

DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Development convenience: allow unauthenticated access to the API.
# This avoids 401 errors in the frontend when no JWT is stored.
from rest_framework.permissions import AllowAny  # noqa: E402
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
    'rest_framework.permissions.AllowAny',
]
