"""Django-filter FilterSet for the ventes application."""

import django_filters
from .models import Vente


class VenteFilter(django_filters.FilterSet):
    """
    FilterSet for filtering sales by date range and status.
    """

    date_debut = django_filters.DateFilter(field_name='date_vente', lookup_expr='date__gte')
    date_fin = django_filters.DateFilter(field_name='date_vente', lookup_expr='date__lte')
    aujourd_hui = django_filters.BooleanFilter(method='filter_aujourd_hui', label="Ventes d'aujourd'hui")

    class Meta:
        model = Vente
        fields = ['statut']

    def filter_aujourd_hui(self, queryset, name, value):
        """Filters sales made today."""
        from django.utils import timezone
        if value:
            today = timezone.now().date()
            return queryset.filter(date_vente__date=today)
        return queryset
