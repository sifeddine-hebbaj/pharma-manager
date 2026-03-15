"""
Test settings for PharmaManager.
Uses SQLite in-memory database so tests run without a PostgreSQL instance.
"""

from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Use fast in-memory SQLite for tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Disable migrations for speed (use direct table creation)
class DisableMigrations:
    def __contains__(self, item):
        return True
    def __getitem__(self, item):
        return None

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Silence logging during tests
import logging
logging.disable(logging.CRITICAL)
