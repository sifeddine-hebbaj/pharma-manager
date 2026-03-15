"""
Django-filter FilterSet for the medicaments application.
"""

import django_filters
from .models import Medicament


class MedicamentFilter(django_filters.FilterSet):
    """
    FilterSet for advanced medication filtering.
    Supports filtering by category, form, prescription requirement, and stock alert status.
    """

    en_alerte = django_filters.BooleanFilter(
        method='filter_en_alerte',
        label='En alerte stock'
    )
    prix_vente_min = django_filters.NumberFilter(field_name='prix_vente', lookup_expr='gte')
    prix_vente_max = django_filters.NumberFilter(field_name='prix_vente', lookup_expr='lte')

    class Meta:
        model = Medicament
        fields = ['categorie', 'forme', 'ordonnance_requise']

    def filter_en_alerte(self, queryset, name, value):
        """Filters medications that are at or below their minimum stock threshold."""
        from django.db.models import F
        if value:
            return queryset.filter(stock_actuel__lte=F('stock_minimum'))
        return queryset.exclude(stock_actuel__lte=F('stock_minimum'))
