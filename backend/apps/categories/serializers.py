"""
Serializers for the categories application.
Handles serialization/deserialization of Categorie objects.
"""

from rest_framework import serializers
from .models import Categorie


class CategorieSerializer(serializers.ModelSerializer):
    """
    Serializer for Categorie model.
    Includes medicament count for listing views.
    """

    medicaments_count = serializers.SerializerMethodField(
        help_text='Nombre de médicaments dans cette catégorie'
    )

    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'description', 'medicaments_count', 'date_creation']
        read_only_fields = ['id', 'date_creation', 'medicaments_count']

    def get_medicaments_count(self, obj) -> int:
        """Returns the number of active medications in this category."""
        return obj.medicaments.filter(est_actif=True).count()

    def validate_nom(self, value: str) -> str:
        """Validates that the category name is properly formatted."""
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                "Le nom de la catégorie doit contenir au moins 2 caractères."
            )
        return value.capitalize()
