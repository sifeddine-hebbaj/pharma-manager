"""
Serializers for the ventes application.
Handles sale creation with stock deduction and nested line items.
"""

from rest_framework import serializers
from django.db import transaction
from .models import Vente, LigneVente
from apps.medicaments.models import Medicament


class LigneVenteSerializer(serializers.ModelSerializer):
    """
    Serializer for individual line items within a sale.
    Includes medication name for display purposes.
    """

    medicament_nom = serializers.CharField(source='medicament.nom', read_only=True)

    class Meta:
        model = LigneVente
        fields = ['id', 'medicament', 'medicament_nom', 'quantite', 'prix_unitaire', 'sous_total']
        read_only_fields = ['id', 'prix_unitaire', 'sous_total', 'medicament_nom']


class LigneVenteCreateSerializer(serializers.Serializer):
    """
    Serializer for creating line items during sale creation.
    Prix_unitaire is automatically set from the medication's current price.
    """

    medicament = serializers.PrimaryKeyRelatedField(
        queryset=Medicament.objects.filter(est_actif=True)
    )
    quantite = serializers.IntegerField(min_value=1)


class VenteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing sales."""

    nombre_articles = serializers.SerializerMethodField()

    class Meta:
        model = Vente
        fields = ['id', 'reference', 'date_vente', 'total_ttc', 'statut', 'nombre_articles']

    def get_nombre_articles(self, obj) -> int:
        """Returns the total number of distinct medication types in the sale."""
        return obj.lignes.count()


class VenteDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for creating and retrieving a sale with all line items.
    Handles atomic stock deduction on creation.
    """

    lignes = LigneVenteSerializer(many=True, read_only=True)
    lignes_data = LigneVenteCreateSerializer(many=True, write_only=True)

    class Meta:
        model = Vente
        fields = [
            'id', 'reference', 'date_vente', 'total_ttc',
            'statut', 'notes', 'lignes', 'lignes_data', 'date_creation'
        ]
        read_only_fields = ['id', 'reference', 'total_ttc', 'date_creation']

    def validate_lignes_data(self, lignes_data):
        """
        Validates that all requested quantities are available in stock.
        Prevents creating a sale if any medication has insufficient stock.
        """
        errors = []
        for item in lignes_data:
            med = item['medicament']
            qty = item['quantite']
            if med.stock_actuel < qty:
                errors.append(
                    f'Stock insuffisant pour "{med.nom}": '
                    f'disponible={med.stock_actuel}, demandé={qty}.'
                )
        if errors:
            raise serializers.ValidationError(errors)

        # Check for duplicate medicaments in the same sale
        medicament_ids = [item['medicament'].id for item in lignes_data]
        if len(medicament_ids) != len(set(medicament_ids)):
            raise serializers.ValidationError(
                'Un médicament ne peut pas apparaître deux fois dans la même vente.'
            )

        return lignes_data

    @transaction.atomic
    def create(self, validated_data):
        """
        Creates a sale with all its line items in a single atomic transaction.
        Automatically deducts stock for each medication sold.
        """
        lignes_data = validated_data.pop('lignes_data')

        vente = Vente.objects.create(**validated_data)

        total = 0
        for item in lignes_data:
            medicament = item['medicament']
            quantite = item['quantite']
            prix_unitaire = medicament.prix_vente  # Snapshot current price

            ligne = LigneVente.objects.create(
                vente=vente,
                medicament=medicament,
                quantite=quantite,
                prix_unitaire=prix_unitaire,
            )
            total += ligne.sous_total

            # Deduct stock
            medicament.stock_actuel -= quantite
            medicament.save(update_fields=['stock_actuel'])

        vente.total_ttc = total
        vente.save(update_fields=['total_ttc'])

        return vente
