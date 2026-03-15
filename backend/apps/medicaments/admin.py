"""Admin configuration for the medicaments application."""

from django.contrib import admin
from .models import Medicament


@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):
    """Admin interface for Medicament model."""

    list_display = [
        'nom', 'dci', 'categorie', 'forme', 'dosage',
        'prix_vente', 'stock_actuel', 'stock_minimum', 'est_actif'
    ]
    list_filter = ['categorie', 'forme', 'ordonnance_requise', 'est_actif']
    search_fields = ['nom', 'dci']
    ordering = ['nom']
    list_editable = ['est_actif']
    readonly_fields = ['date_creation', 'date_modification']

    fieldsets = (
        ('Identification', {
            'fields': ('nom', 'dci', 'categorie', 'forme', 'dosage')
        }),
        ('Prix', {
            'fields': ('prix_achat', 'prix_vente')
        }),
        ('Stock', {
            'fields': ('stock_actuel', 'stock_minimum', 'date_expiration')
        }),
        ('Paramètres', {
            'fields': ('ordonnance_requise', 'est_actif')
        }),
        ('Métadonnées', {
            'fields': ('date_creation', 'date_modification'),
            'classes': ('collapse',)
        }),
    )
