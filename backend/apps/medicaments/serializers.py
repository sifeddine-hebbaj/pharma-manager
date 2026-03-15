"""
Serializers for the medicaments application.
Handles validation and serialization of Medicament objects.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Medicament
from apps.categories.serializers import CategorieSerializer


class MedicamentListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing medications.
    Includes computed fields for stock alerts.
    """

    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    est_en_alerte = serializers.BooleanField(read_only=True)

    class Meta:
        model = Medicament
        fields = [
            'id', 'nom', 'dci', 'categorie', 'categorie_nom',
            'forme', 'dosage', 'prix_vente', 'stock_actuel',
            'stock_minimum', 'est_en_alerte', 'ordonnance_requise',
            'date_expiration', 'est_actif',
        ]


class MedicamentDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for creating and retrieving a single medication.
    Includes nested category data and all computed fields.
    """

    categorie_detail = CategorieSerializer(source='categorie', read_only=True)
    est_en_alerte = serializers.BooleanField(read_only=True)
    marge_beneficiaire = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Medicament
        fields = [
            'id', 'nom', 'dci', 'categorie', 'categorie_detail',
            'forme', 'dosage', 'prix_achat', 'prix_vente',
            'marge_beneficiaire', 'stock_actuel', 'stock_minimum',
            'est_en_alerte', 'date_expiration', 'ordonnance_requise',
            'date_creation', 'date_modification', 'est_actif',
        ]
        read_only_fields = ['id', 'date_creation', 'date_modification']

    def validate_prix_vente(self, value):
        """Ensures selling price is greater than purchase price."""
        prix_achat = self.initial_data.get('prix_achat')
        if prix_achat and float(value) <= float(prix_achat):
            raise serializers.ValidationError(
                "Le prix de vente doit être supérieur au prix d'achat."
            )
        return value

    def validate_date_expiration(self, value):
        """Ensures expiry date is in the future."""
        if value and value < timezone.now().date():
            raise serializers.ValidationError(
                "La date de péremption ne peut pas être dans le passé."
            )
        return value

    def validate(self, data):
        """Cross-field validation."""
        stock_minimum = data.get('stock_minimum', 0)
        if stock_minimum < 0:
            raise serializers.ValidationError(
                {'stock_minimum': 'Le stock minimum ne peut pas être négatif.'}
            )
        return data
