"""
Unit tests for the categories application.
Tests models, serializers, and API endpoints.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Categorie


class CategorieModelTest(TestCase):
    """Tests for the Categorie model."""

    def test_str_representation(self):
        """Category __str__ returns the category name."""
        cat = Categorie(nom='Antibiotique')
        self.assertEqual(str(cat), 'Antibiotique')

    def test_create_with_description(self):
        """Category can be created with an optional description."""
        cat = Categorie.objects.create(nom='Antalgique', description='Contre la douleur')
        self.assertEqual(cat.description, 'Contre la douleur')

    def test_unique_nom_constraint(self):
        """Two categories cannot share the same name."""
        Categorie.objects.create(nom='Unique')
        with self.assertRaises(Exception):
            Categorie.objects.create(nom='Unique')


class CategorieAPITest(APITestCase):
    """Tests for the /api/v1/categories/ endpoints."""

    def setUp(self):
        self.cat1 = Categorie.objects.create(nom='Antibiotique', description='Anti-infectieux')
        self.cat2 = Categorie.objects.create(nom='Antalgique')
        self.list_url = '/api/v1/categories/'

    def test_list_categories(self):
        """GET /categories/ returns all categories with HTTP 200."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # May be paginated or plain list
        data = response.data
        results = data.get('results', data)
        self.assertGreaterEqual(len(results), 2)

    def test_create_category(self):
        """POST /categories/ creates a new category."""
        payload = {'nom': 'Antihistaminique', 'description': 'Contre les allergies'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Categorie.objects.filter(nom='Antihistaminique').count(), 1)

    def test_create_category_duplicate_name_fails(self):
        """POST /categories/ with duplicate name returns HTTP 400."""
        payload = {'nom': 'Antibiotique'}
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_category_name_too_short_fails(self):
        """POST /categories/ with a 1-char name fails validation."""
        response = self.client.post(self.list_url, {'nom': 'A'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_category(self):
        """GET /categories/{id}/ returns correct category."""
        url = f'{self.list_url}{self.cat1.id}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nom'], 'Antibiotique')

    def test_update_category(self):
        """PATCH /categories/{id}/ updates allowed fields."""
        url = f'{self.list_url}{self.cat1.id}/'
        response = self.client.patch(url, {'description': 'Nouvelle description'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cat1.refresh_from_db()
        self.assertEqual(self.cat1.description, 'Nouvelle description')

    def test_delete_empty_category(self):
        """DELETE /categories/{id}/ removes a category with no linked medications."""
        url = f'{self.list_url}{self.cat2.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Categorie.objects.filter(id=self.cat2.id).exists())
