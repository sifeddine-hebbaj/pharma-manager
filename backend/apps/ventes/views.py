"""
Views for the ventes application.
Provides sale management with stock control and cancellation.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample

from .models import Vente
from .serializers import VenteListSerializer, VenteDetailSerializer
from .filters import VenteFilter


@extend_schema_view(
    list=extend_schema(
        tags=['ventes'],
        summary='Historique des ventes',
        description='Retourne la liste paginée des ventes, triées par date décroissante. Supporte le filtrage par date et statut.',
    ),
    create=extend_schema(
        tags=['ventes'],
        summary='Enregistrer une vente',
        description=(
            'Crée une nouvelle vente avec ses articles. '
            'Le stock est automatiquement déduit. '
            'Le prix unitaire est un snapshot du prix actuel du médicament.'
        ),
        examples=[
            OpenApiExample(
                'Exemple vente',
                value={
                    'notes': 'Client régulier',
                    'lignes_data': [
                        {'medicament': 1, 'quantite': 2},
                        {'medicament': 3, 'quantite': 1},
                    ]
                },
                request_only=True,
            )
        ],
    ),
    retrieve=extend_schema(
        tags=['ventes'],
        summary='Détail d\'une vente',
        description='Retourne tous les détails d\'une vente incluant ses lignes d\'articles.',
    ),
)
class VenteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pharmacy sales.

    Supports creating sales with automatic stock deduction,
    viewing history, and cancelling sales with stock restoration.
    Read-only methods (update, partial_update) are disabled — sales are immutable.
    """

    queryset = Vente.objects.prefetch_related('lignes__medicament').all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = VenteFilter
    ordering_fields = ['date_vente', 'total_ttc']
    ordering = ['-date_vente']
    http_method_names = ['get', 'post', 'head', 'options']  # No PUT/PATCH — sales are immutable

    def get_serializer_class(self):
        """Uses lightweight serializer for list, full serializer otherwise."""
        if self.action == 'list':
            return VenteListSerializer
        return VenteDetailSerializer

    @extend_schema(
        tags=['ventes'],
        summary='Annuler une vente',
        description=(
            'Annule une vente complétée et réintègre les quantités dans le stock. '
            'Une vente déjà annulée ne peut pas être annulée à nouveau.'
        ),
        responses={
            200: {'description': 'Vente annulée avec succès'},
            400: {'description': 'Vente déjà annulée'},
        },
    )
    @action(detail=True, methods=['post'], url_path='annuler')
    @transaction.atomic
    def annuler(self, request, pk=None):
        """
        Cancels a completed sale and restores stock for all line items.
        Sets sale status to 'annulee' (soft cancel).
        """
        vente = self.get_object()

        if vente.statut == Vente.STATUT_ANNULEE:
            return Response(
                {'error': 'Cette vente est déjà annulée.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock for each line item
        for ligne in vente.lignes.select_related('medicament').all():
            medicament = ligne.medicament
            medicament.stock_actuel += ligne.quantite
            medicament.save(update_fields=['stock_actuel'])

        vente.statut = Vente.STATUT_ANNULEE
        vente.save(update_fields=['statut'])

        serializer = VenteDetailSerializer(vente)
        return Response({
            'message': f'Vente {vente.reference} annulée. Stock réintégré.',
            'vente': serializer.data,
        }, status=status.HTTP_200_OK)
