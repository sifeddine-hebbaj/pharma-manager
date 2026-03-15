"""
Views for the categories application.
Provides CRUD operations for medication categories.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiExample

from .models import Categorie
from .serializers import CategorieSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['categories'],
        summary='Lister toutes les catégories',
        description='Retourne la liste complète des catégories de médicaments avec le nombre de médicaments par catégorie.',
    ),
    create=extend_schema(
        tags=['categories'],
        summary='Créer une catégorie',
        description='Crée une nouvelle catégorie de médicaments.',
        examples=[
            OpenApiExample(
                'Exemple création',
                value={'nom': 'Antibiotique', 'description': 'Médicaments antibactériens'},
                request_only=True,
            )
        ],
    ),
    retrieve=extend_schema(
        tags=['categories'],
        summary='Détail d\'une catégorie',
    ),
    update=extend_schema(
        tags=['categories'],
        summary='Modifier une catégorie (complet)',
    ),
    partial_update=extend_schema(
        tags=['categories'],
        summary='Modifier une catégorie (partiel)',
    ),
    destroy=extend_schema(
        tags=['categories'],
        summary='Supprimer une catégorie',
        description='Supprime définitivement une catégorie. Attention: impossible si des médicaments y sont liés.',
    ),
)
class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medication categories.
    Provides full CRUD operations on Categorie objects.
    """

    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    search_fields = ['nom', 'description']
    ordering_fields = ['nom', 'date_creation']

    def destroy(self, request, *args, **kwargs):
        """
        Deletes a category. Returns 409 if medications are linked to it.
        """
        instance = self.get_object()
        if instance.medicaments.filter(est_actif=True).exists():
            return Response(
                {'error': 'Impossible de supprimer une catégorie contenant des médicaments actifs.'},
                status=status.HTTP_409_CONFLICT
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
