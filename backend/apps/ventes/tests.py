"""
Unit tests for the ventes application.
Tests sale creation, automatic stock deduction, cancellation, and stock restoration.
"""

from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase
from apps.categories.models import Categorie
from apps.medicaments.models import Medicament
from .models import Vente, LigneVente


def make_categorie():
    return Categorie.objects.create(nom='TestCategorie')


def make_medicament(cat, nom='TestMed', stock=100, prix_achat='5.00', prix_vente='10.00', stock_minimum=10):
    """Helper: create a test medication."""
    return Medicament.objects.create(
        nom=nom,
        categorie=cat,
        forme='comprime',
        prix_achat=prix_achat,
        prix_vente=prix_vente,
        stock_actuel=stock,
        stock_minimum=stock_minimum,
    )


class VenteModelTest(TestCase):
    """Tests for the Vente model."""

    def setUp(self):
        self.cat = make_categorie()
        self.med = make_medicament(self.cat)

    def test_reference_auto_generated(self):
        """A sale reference is generated automatically on save."""
        vente = Vente.objects.create(total_ttc='20.00')
        self.assertTrue(vente.reference.startswith('VNT-'))

    def test_reference_is_unique(self):
        """Two sales receive different references."""
        v1 = Vente.objects.create(total_ttc='10.00')
        v2 = Vente.objects.create(total_ttc='20.00')
        self.assertNotEqual(v1.reference, v2.reference)

    def test_reference_sequential(self):
        """References increment sequentially within the same year."""
        from django.utils import timezone
        year = timezone.now().year
        v1 = Vente.objects.create(total_ttc='10.00')
        v2 = Vente.objects.create(total_ttc='20.00')
        seq1 = int(v1.reference.split('-')[-1])
        seq2 = int(v2.reference.split('-')[-1])
        self.assertEqual(seq2, seq1 + 1)

    def test_ligne_vente_sous_total_auto_calculated(self):
        """LigneVente.sous_total = quantite × prix_unitaire on save."""
        vente = Vente.objects.create(total_ttc='0.00')
        ligne = LigneVente.objects.create(
            vente=vente,
            medicament=self.med,
            quantite=3,
            prix_unitaire='10.00',
        )
        self.assertEqual(float(ligne.sous_total), 30.0)

    def test_prix_unitaire_snapshot(self):
        """LigneVente stores prix_unitaire as a snapshot, independent of the medication."""
        vente = Vente.objects.create(total_ttc='0.00')
        ligne = LigneVente.objects.create(
            vente=vente,
            medicament=self.med,
            quantite=1,
            prix_unitaire='10.00',
        )
        # Change medication price
        self.med.prix_vente = '99.00'
        self.med.save()
        # Snapshot should remain unchanged
        ligne.refresh_from_db()
        self.assertEqual(float(ligne.prix_unitaire), 10.0)


class VenteAPITest(APITestCase):
    """Tests for the /api/v1/ventes/ endpoints."""

    def setUp(self):
        self.cat = make_categorie()
        self.med1 = make_medicament(self.cat, nom='Med1', stock=50)
        self.med2 = make_medicament(self.cat, nom='Med2', stock=20)
        self.list_url = '/api/v1/ventes/'

    def _create_vente(self, lignes, notes=None):
        """Helper: POST a sale via the API."""
        payload = {'lignes_data': lignes}
        if notes:
            payload['notes'] = notes
        return self.client.post(self.list_url, payload, format='json')

    def test_create_vente_deducts_stock(self):
        """POST /ventes/ decrements stock for each sold medication."""
        initial_stock = self.med1.stock_actuel
        response = self._create_vente([{'medicament': self.med1.id, 'quantite': 5}])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, initial_stock - 5)

    def test_create_vente_calculates_total(self):
        """POST /ventes/ correctly calculates total_ttc from line items."""
        # med1.prix_vente = 10.00, quantite = 3 → 30.00
        response = self._create_vente([{'medicament': self.med1.id, 'quantite': 3}])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertAlmostEqual(float(response.data['total_ttc']), 30.0, places=2)

    def test_create_vente_multiple_lignes(self):
        """POST /ventes/ handles multiple line items correctly."""
        response = self._create_vente([
            {'medicament': self.med1.id, 'quantite': 2},  # 20.00
            {'medicament': self.med2.id, 'quantite': 1},  # 10.00
        ])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertAlmostEqual(float(response.data['total_ttc']), 30.0, places=2)

    def test_create_vente_snapshots_prix_unitaire(self):
        """LigneVente prix_unitaire is snapshotted from current medication price."""
        response = self._create_vente([{'medicament': self.med1.id, 'quantite': 1}])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vente_id = response.data['id']
        vente = Vente.objects.get(id=vente_id)
        ligne = vente.lignes.first()
        self.assertEqual(float(ligne.prix_unitaire), float(self.med1.prix_vente))

    def test_create_vente_fails_insufficient_stock(self):
        """POST /ventes/ fails with HTTP 400 when requested quantity exceeds stock."""
        response = self._create_vente([{'medicament': self.med1.id, 'quantite': 9999}])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_vente_fails_duplicate_medicament(self):
        """POST /ventes/ fails if the same medication appears twice."""
        response = self._create_vente([
            {'medicament': self.med1.id, 'quantite': 1},
            {'medicament': self.med1.id, 'quantite': 2},
        ])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_annuler_vente_restores_stock(self):
        """POST /ventes/{id}/annuler/ restores stock for all line items."""
        initial_stock = self.med1.stock_actuel
        # Create sale
        create_resp = self._create_vente([{'medicament': self.med1.id, 'quantite': 5}])
        self.assertEqual(create_resp.status_code, status.HTTP_201_CREATED)
        vente_id = create_resp.data['id']
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, initial_stock - 5)

        # Cancel sale
        annuler_url = f'{self.list_url}{vente_id}/annuler/'
        cancel_resp = self.client.post(annuler_url)
        self.assertEqual(cancel_resp.status_code, status.HTTP_200_OK)

        # Stock should be restored
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, initial_stock)

    def test_annuler_vente_sets_statut_annulee(self):
        """POST /ventes/{id}/annuler/ changes sale status to 'annulee'."""
        create_resp = self._create_vente([{'medicament': self.med1.id, 'quantite': 1}])
        vente_id = create_resp.data['id']
        self.client.post(f'{self.list_url}{vente_id}/annuler/')
        vente = Vente.objects.get(id=vente_id)
        self.assertEqual(vente.statut, Vente.STATUT_ANNULEE)

    def test_annuler_already_annulee_fails(self):
        """POST /ventes/{id}/annuler/ on an already cancelled sale returns HTTP 400."""
        create_resp = self._create_vente([{'medicament': self.med1.id, 'quantite': 1}])
        vente_id = create_resp.data['id']
        annuler_url = f'{self.list_url}{vente_id}/annuler/'
        self.client.post(annuler_url)  # First cancel
        second_cancel = self.client.post(annuler_url)  # Second attempt
        self.assertEqual(second_cancel.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_vente_is_atomic(self):
        """A sale that fails mid-way does not partially modify stock."""
        # med2 has only stock=20 but we request 99 — should fail and rollback
        initial_med1_stock = self.med1.stock_actuel
        response = self._create_vente([
            {'medicament': self.med1.id, 'quantite': 5},
            {'medicament': self.med2.id, 'quantite': 9999},  # will fail validation
        ])
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # med1 stock must be unchanged — transaction was rolled back
        self.med1.refresh_from_db()
        self.assertEqual(self.med1.stock_actuel, initial_med1_stock)

    def test_list_ventes(self):
        """GET /ventes/ returns paginated sales list."""
        self._create_vente([{'medicament': self.med1.id, 'quantite': 1}])
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_retrieve_vente_with_lignes(self):
        """GET /ventes/{id}/ returns the sale with all its line items."""
        create_resp = self._create_vente([{'medicament': self.med1.id, 'quantite': 2}])
        vente_id = create_resp.data['id']
        response = self.client.get(f'{self.list_url}{vente_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('lignes', response.data)
        self.assertEqual(len(response.data['lignes']), 1)

    def test_filter_ventes_by_statut(self):
        """GET /ventes/?statut=annulee returns only cancelled sales."""
        create_resp = self._create_vente([{'medicament': self.med1.id, 'quantite': 1}])
        vente_id = create_resp.data['id']
        self.client.post(f'{self.list_url}{vente_id}/annuler/')

        response = self.client.get(self.list_url, {'statut': 'annulee'})
        results = response.data.get('results', response.data)
        self.assertTrue(all(r['statut'] == 'annulee' for r in results))
