"""
Models for the categories application.
Manages medication categories used to classify the pharmacy inventory.
"""

from django.db import models


class Categorie(models.Model):
    """
    Represents a medication category in the pharmacy system.

    Attributes:
        nom (str): Unique category name (e.g., Antibiotique, Antalgique).
        description (str): Optional detailed description of the category.
        date_creation (datetime): Timestamp of creation (auto-set).
    """

    nom = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nom de la catégorie'
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Description'
    )
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['nom']

    def __str__(self) -> str:
        return self.nom
