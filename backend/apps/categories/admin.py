"""Admin configuration for the categories application."""

from django.contrib import admin
from .models import Categorie


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    """Admin interface for Categorie model."""

    list_display = ['nom', 'description', 'date_creation']
    search_fields = ['nom']
    ordering = ['nom']
