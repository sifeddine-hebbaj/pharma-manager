"""
Models for the ventes application.
Manages sales transactions and their line items.
"""

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal


class Vente(models.Model):
    """
    Represents a sale transaction in the pharmacy.

    A sale contains one or more LigneVente line items.
    Stock is automatically adjusted when a sale is created or cancelled.

    Attributes:
        reference (str): Auto-generated unique reference code (e.g., VNT-2024-0001).
        date_vente (datetime): Date and time of the transaction.
        total_ttc (Decimal): Total amount, calculated from line items.
        statut (str): Current status: en_cours, completee, annulee.
        notes (str): Optional remarks for the sale.
    """

    STATUT_EN_COURS = 'en_cours'
    STATUT_COMPLETEE = 'completee'
    STATUT_ANNULEE = 'annulee'

    STATUT_CHOICES = [
        (STATUT_EN_COURS, 'En cours'),
        (STATUT_COMPLETEE, 'Complétée'),
        (STATUT_ANNULEE, 'Annulée'),
    ]

    reference = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        verbose_name='Référence'
    )
    date_vente = models.DateTimeField(
        default=timezone.now,
        verbose_name='Date de vente'
    )
    total_ttc = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name='Total TTC (MAD)'
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default=STATUT_COMPLETEE,
        verbose_name='Statut'
    )
    notes = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notes'
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Vente'
        verbose_name_plural = 'Ventes'
        ordering = ['-date_vente']

    def __str__(self) -> str:
        return f'{self.reference} — {self.total_ttc} MAD'

    def save(self, *args, **kwargs):
        """Auto-generates the unique reference on first save."""
        if not self.reference:
            self.reference = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self) -> str:
        """Generates a unique reference code in format VNT-YYYY-XXXX."""
        year = timezone.now().year
        last = Vente.objects.filter(
            reference__startswith=f'VNT-{year}-'
        ).order_by('-reference').first()

        if last:
            try:
                seq = int(last.reference.split('-')[-1]) + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1

        return f'VNT-{year}-{seq:04d}'

    def recalculate_total(self):
        """Recalculates total_ttc from all active line items."""
        total = sum(
            ligne.sous_total for ligne in self.lignes.all()
        )
        self.total_ttc = total
        self.save(update_fields=['total_ttc'])


class LigneVente(models.Model):
    """
    Represents a single line item in a sale transaction.

    Important: prix_unitaire is a snapshot of the price at sale time.
    It is NOT a ForeignKey — prices can change over time.

    Attributes:
        vente (Vente): FK to the parent sale.
        medicament (Medicament): FK to the medication sold.
        quantite (int): Quantity sold.
        prix_unitaire (Decimal): Price snapshot at the time of sale.
        sous_total (Decimal): Calculated as quantite × prix_unitaire.
    """

    vente = models.ForeignKey(
        'Vente',
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name='Vente'
    )
    medicament = models.ForeignKey(
        'medicaments.Medicament',
        on_delete=models.PROTECT,
        related_name='lignes_vente',
        verbose_name='Médicament'
    )
    quantite = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name='Quantité'
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Prix unitaire (snapshot)'
    )
    sous_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        editable=False,
        verbose_name='Sous-total'
    )

    class Meta:
        verbose_name = 'Ligne de vente'
        verbose_name_plural = 'Lignes de vente'

    def __str__(self) -> str:
        return f'{self.medicament.nom} x{self.quantite} = {self.sous_total} MAD'

    def save(self, *args, **kwargs):
        """Auto-calculates sous_total before saving."""
        self.sous_total = Decimal(str(self.quantite)) * self.prix_unitaire
        super().save(*args, **kwargs)
