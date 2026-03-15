import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('medicaments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reference', models.CharField(editable=False, max_length=20, unique=True, verbose_name='Référence')),
                ('date_vente', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Date de vente')),
                ('total_ttc', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12, verbose_name='Total TTC (MAD)')),
                ('statut', models.CharField(choices=[('en_cours', 'En cours'), ('completee', 'Complétée'), ('annulee', 'Annulée')], default='completee', max_length=20, verbose_name='Statut')),
                ('notes', models.TextField(blank=True, null=True, verbose_name='Notes')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Vente',
                'verbose_name_plural': 'Ventes',
                'ordering': ['-date_vente'],
            },
        ),
        migrations.CreateModel(
            name='LigneVente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.PositiveIntegerField(validators=[django.core.validators.MinValueValidator(1)], verbose_name='Quantité')),
                ('prix_unitaire', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Prix unitaire (snapshot)')),
                ('sous_total', models.DecimalField(decimal_places=2, editable=False, max_digits=12, verbose_name='Sous-total')),
                ('medicament', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='lignes_vente', to='medicaments.medicament', verbose_name='Médicament')),
                ('vente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lignes', to='ventes.vente', verbose_name='Vente')),
            ],
            options={
                'verbose_name': 'Ligne de vente',
                'verbose_name_plural': 'Lignes de vente',
            },
        ),
    ]
