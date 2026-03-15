"""
Views for the medicaments application.
Provides full CRUD operations and stock alert endpoint.
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample

from .models import Medicament
from .serializers import MedicamentListSerializer, MedicamentDetailSerializer
from .filters import MedicamentFilter


@extend_schema_view(
    list=extend_schema(
        tags=['medicaments'],
        summary='Lister les médicaments actifs',
        description=(
            'Retourne la liste paginée des médicaments actifs. '
            'Supporte la recherche par nom/DCI et le filtrage par catégorie, forme, ordonnance.'
        ),
        parameters=[
            OpenApiParameter('search', str, description='Recherche par nom ou DCI'),
            OpenApiParameter('categorie', int, description='Filtrer par ID de catégorie'),
            OpenApiParameter('forme', str, description='Filtrer par forme galénique'),
            OpenApiParameter('ordonnance_requise', bool, description='Filtrer par besoin d\'ordonnance'),
            OpenApiParameter('en_alerte', bool, description='Afficher uniquement les médicaments en alerte stock'),
        ],
    ),
    create=extend_schema(
        tags=['medicaments'],
        summary='Créer un médicament',
        description='Ajoute un nouveau médicament au catalogue de la pharmacie.',
        examples=[
            OpenApiExample(
                'Exemple création',
                value={
                    'nom': 'Amoxicilline',
                    'dci': 'Amoxicilline trihydrate',
                    'categorie': 1,
                    'forme': 'comprime',
                    'dosage': '500mg',
                    'prix_achat': '12.50',
                    'prix_vente': '18.00',
                    'stock_actuel': 100,
                    'stock_minimum': 20,
                    'ordonnance_requise': True,
                },
                request_only=True,
            )
        ],
    ),
    retrieve=extend_schema(
        tags=['medicaments'],
        summary='Détail d\'un médicament',
        description='Retourne toutes les informations d\'un médicament spécifique.',
    ),
    update=extend_schema(
        tags=['medicaments'],
        summary='Modifier un médicament (complet)',
    ),
    partial_update=extend_schema(
        tags=['medicaments'],
        summary='Modifier un médicament (partiel)',
        description='Met à jour un ou plusieurs champs d\'un médicament existant.',
    ),
    destroy=extend_schema(
        tags=['medicaments'],
        summary='Archiver un médicament',
        description='Effectue un soft delete (est_actif=False). Le médicament reste dans la base.',
    ),
)
class MedicamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing pharmacy medications.

    Provides full CRUD plus a custom /alertes/ endpoint for
    low-stock medications. Soft delete is implemented via est_actif flag.
    """

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = MedicamentFilter
    search_fields = ['nom', 'dci']
    ordering_fields = ['nom', 'prix_vente', 'stock_actuel', 'date_creation']
    ordering = ['nom']

    def get_queryset(self):
        """Returns only active medications by default."""
        return Medicament.objects.select_related('categorie').filter(est_actif=True)

    def get_serializer_class(self):
        """Uses lightweight serializer for list, full serializer otherwise."""
        if self.action == 'list':
            return MedicamentListSerializer
        return MedicamentDetailSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Soft deletes a medication by setting est_actif=False.
        The record remains in the database for historical integrity.
        """
        instance = self.get_object()
        instance.est_actif = False
        instance.save(update_fields=['est_actif'])
        return Response(
            {'message': f'Médicament "{instance.nom}" archivé avec succès.'},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['medicaments'],
        summary='Médicaments en alerte de stock',
        description=(
            'Retourne tous les médicaments actifs dont le stock actuel '
            'est inférieur ou égal au seuil minimum défini.'
        ),
        responses={200: MedicamentListSerializer(many=True)},
    )
    @action(detail=False, methods=['get'], url_path='alertes')
    def alertes(self, request):
        """
        Returns medications with stock at or below the minimum threshold.
        Used to trigger restock notifications.
        """
        from django.db.models import F
        alertes_qs = self.get_queryset().filter(
            stock_actuel__lte=F('stock_minimum')
        )
        serializer = MedicamentListSerializer(alertes_qs, many=True)
        return Response({
            'count': alertes_qs.count(),
            'results': serializer.data
        })
