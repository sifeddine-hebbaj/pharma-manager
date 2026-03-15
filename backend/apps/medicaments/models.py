"""
Models for the medicaments application.
Manages the pharmacy's medication inventory.
"""

from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Medicament(models.Model):
    """
    Represents a medication in the pharmacy inventory.

    Attributes:
        nom (str): Commercial name of the medication.
        dci (str): International Non-proprietary Name (DCI).
        categorie (Categorie): FK to the medication category.
        forme (str): Galenic form (tablet, syrup, injection, etc.).
        dosage (str): Dosage information (e.g., 500mg, 250mg/5ml).
        prix_achat (Decimal): Unit purchase price.
        prix_vente (Decimal): Public selling price.
        stock_actuel (int): Current quantity in stock.
        stock_minimum (int): Minimum stock threshold triggering an alert.
        date_expiration (date): Medication expiry date.
        ordonnance_requise (bool): Whether a prescription is required.
        date_creation (datetime): Auto-set creation timestamp.
        est_actif (bool): Soft delete flag. False = archived medication.
    """

    FORME_CHOICES = [
        ('comprime', 'Comprimé'),
        ('sirop', 'Sirop'),
        ('injection', 'Injectable'),
        ('capsule', 'Capsule'),
        ('pommade', 'Pommade'),
        ('suppositoire', 'Suppositoire'),
        ('gouttes', 'Gouttes'),
        ('patch', 'Patch'),
        ('autre', 'Autre'),
    ]

    nom = models.CharField(
        max_length=200,
        verbose_name='Nom commercial'
    )
    dci = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Dénomination Commune Internationale'
    )
    categorie = models.ForeignKey(
        'categories.Categorie',
        on_delete=models.PROTECT,
        related_name='medicaments',
        verbose_name='Catégorie'
    )
    forme = models.CharField(
        max_length=50,
        choices=FORME_CHOICES,
        default='comprime',
        verbose_name='Forme galénique'
    )
    dosage = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Dosage'
    )
    prix_achat = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Prix d\'achat (MAD)'
    )
    prix_vente = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name='Prix de vente (MAD)'
    )
    stock_actuel = models.PositiveIntegerField(
        default=0,
        verbose_name='Stock actuel'
    )
    stock_minimum = models.PositiveIntegerField(
        default=10,
        verbose_name='Stock minimum (seuil d\'alerte)'
    )
    date_expiration = models.DateField(
        null=True,
        blank=True,
        verbose_name='Date de péremption'
    )
    ordonnance_requise = models.BooleanField(
        default=False,
        verbose_name='Ordonnance requise'
    )
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name='Dernière modification'
    )
    est_actif = models.BooleanField(
        default=True,
        verbose_name='Actif'
    )

    class Meta:
        verbose_name = 'Médicament'
        verbose_name_plural = 'Médicaments'
        ordering = ['nom']

    def __str__(self) -> str:
        dosage_str = f' {self.dosage}' if self.dosage else ''
        return f'{self.nom}{dosage_str}'

    @property
    def est_en_alerte(self) -> bool:
        """Returns True if stock is at or below the minimum threshold."""
        return self.stock_actuel <= self.stock_minimum

    @property
    def marge_beneficiaire(self) -> Decimal:
        """Returns the profit margin per unit sold."""
        return self.prix_vente - self.prix_achat
