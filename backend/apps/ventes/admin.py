"""Admin configuration for the ventes application."""

from django.contrib import admin
from .models import Vente, LigneVente


class LigneVenteInline(admin.TabularInline):
    """Inline for displaying line items inside a sale."""
    model = LigneVente
    extra = 0
    readonly_fields = ['sous_total']


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    """Admin interface for Vente model."""

    list_display = ['reference', 'date_vente', 'total_ttc', 'statut']
    list_filter = ['statut', 'date_vente']
    search_fields = ['reference']
    readonly_fields = ['reference', 'total_ttc', 'date_creation']
    inlines = [LigneVenteInline]
    ordering = ['-date_vente']
