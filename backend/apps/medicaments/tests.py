"""
Unit tests for the medicaments application.
Tests models, serializers, viewsets, and stock alert logic.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from apps.categories.models import Categorie
from .models import Medicament


def make_categorie(nom='TestCat'):
    """Helper: create a test category."""
    return Categorie.objects.create(nom=nom)


def make_medicament(categorie, **kwargs):
    """Helper: create a test medication with sensible defaults."""
    defaults = {
        'nom': 'Paracétamol 500mg',
        'dci': 'Paracétamol',
        'forme': 'comprime',
        'dosage': '500mg',
        'prix_achat': '5.00',
        'prix_vente': '9.00',
        'stock_actuel': 50,
        'stock_minimum': 10,
    }
    defaults.update(kwargs)
    return Medicament.objects.create(categorie=categorie, **defaults)


class MedicamentModelTest(TestCase):
    """Tests for the Medicament model and its computed properties."""

    def setUp(self):
        self.cat = make_categorie()

    def test_str_representation(self):
        """__str__ includes name and dosage."""
        med = make_medicament(self.cat, nom='Ibuprofène', dosage='400mg')
        self.assertIn('Ibuprofène', str(med))
        self.assertIn('400mg', str(med))

    def test_est_en_alerte_true_when_stock_at_minimum(self):
        """est_en_alerte is True when stock_actuel equals stock_minimum."""
        med = make_medicament(self.cat, stock_actuel=10, stock_minimum=10)
        self.assertTrue(med.est_en_alerte)

    def test_est_en_alerte_true_when_stock_below_minimum(self):
        """est_en_alerte is True when stock_actuel is below stock_minimum."""
        med = make_medicament(self.cat, stock_actuel=3, stock_minimum=10)
        self.assertTrue(med.est_en_alerte)

    def test_est_en_alerte_false_when_stock_sufficient(self):
        """est_en_alerte is False when stock_actuel is above stock_minimum."""
        med = make_medicament(self.cat, stock_actuel=50, stock_minimum=10)
        self.assertFalse(med.est_en_alerte)

    def test_marge_beneficiaire_calculation(self):
        """marge_beneficiaire equals prix_vente minus prix_achat."""
        med = make_medicament(self.cat, prix_achat='5.00', prix_vente='9.00')
        self.assertEqual(float(med.marge_beneficiaire), 4.0)

    def test_soft_delete_keeps_record(self):
        """Setting est_actif=False does not delete the database record."""
        med = make_medicament(self.cat)
        med.est_actif = False
        med.save()
        self.assertTrue(Medicament.objects.filter(id=med.id).exists())
        self.assertFalse(Medicament.objects.filter(id=med.id, est_actif=True).exists())


class MedicamentAPITest(APITestCase):
    """Tests for the /api/v1/medicaments/ endpoints."""

    def setUp(self):
        self.cat = make_categorie()
        self.med = make_medicament(self.cat, stock_actuel=50, stock_minimum=10)
        self.alerte_med = make_medicament(
            self.cat, nom='Alerte Med', stock_actuel=5, stock_minimum=20
        )
        self.list_url = '/api/v1/medicaments/'

    def test_list_returns_only_active(self):
        """GET /medicaments/ only returns active (est_actif=True) medications."""
        archived = make_medicament(self.cat, nom='Archivé', est_actif=False)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        names = [r['nom'] for r in results]
        self.assertNotIn('Archivé', names)

    def test_create_medicament(self):
        """POST /medicaments/ creates a new medication."""
        payload = {
            'nom': 'Amoxicilline 500mg',
            'dci': 'Amoxicilline',
            'categorie': self.cat.id,
            'forme': 'comprime',
            'dosage': '500mg',
            'prix_achat': '10.00',
            'prix_vente': '16.00',
            'stock_actuel': 100,
            'stock_minimum': 20,
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Medicament.objects.filter(nom='Amoxicilline 500mg').exists())

    def test_create_fails_when_prix_vente_lte_prix_achat(self):
        """POST /medicaments/ fails if prix_vente <= prix_achat."""
        payload = {
            'nom': 'Test',
            'categorie': self.cat.id,
            'forme': 'comprime',
            'prix_achat': '15.00',
            'prix_vente': '10.00',  # lower than achat — invalid
            'stock_actuel': 10,
            'stock_minimum': 5,
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_soft_delete_via_api(self):
        """DELETE /medicaments/{id}/ sets est_actif=False without removing the record."""
        url = f'{self.list_url}{self.med.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.med.refresh_from_db()
        self.assertFalse(self.med.est_actif)

    def test_soft_deleted_not_in_list(self):
        """A soft-deleted medication no longer appears in the list."""
        self.med.est_actif = False
        self.med.save()
        response = self.client.get(self.list_url)
        results = response.data.get('results', response.data)
        ids = [r['id'] for r in results]
        self.assertNotIn(self.med.id, ids)

    def test_alertes_endpoint_returns_low_stock(self):
        """GET /medicaments/alertes/ returns only medications below minimum stock."""
        response = self.client.get(f'{self.list_url}alertes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', [])
        for med in results:
            self.assertLessEqual(med['stock_actuel'], med['stock_minimum'])

    def test_alertes_excludes_sufficient_stock(self):
        """GET /medicaments/alertes/ does not include medications with sufficient stock."""
        response = self.client.get(f'{self.list_url}alertes/')
        results = response.data.get('results', [])
        ids = [r['id'] for r in results]
        self.assertNotIn(self.med.id, ids)

    def test_search_filter(self):
        """GET /medicaments/?search=Alerte returns only matching medications."""
        response = self.client.get(self.list_url, {'search': 'Alerte'})
        results = response.data.get('results', response.data)
        self.assertTrue(all('Alerte' in r['nom'] for r in results))

    def test_partial_update(self):
        """PATCH /medicaments/{id}/ updates only specified fields."""
        url = f'{self.list_url}{self.med.id}/'
        response = self.client.patch(url, {'stock_minimum': 25}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.med.refresh_from_db()
        self.assertEqual(self.med.stock_minimum, 25)
