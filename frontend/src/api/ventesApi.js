/**
 * API functions for the ventes resource.
 * All calls go through the configured axiosInstance.
 */
import axiosInstance from './axiosConfig'

/**
 * Fetches paginated list of sales.
 * @param {Object} params - Query params: statut, date_debut, date_fin, aujourd_hui
 * @returns {Promise<Object>} Paginated response { count, next, previous, results }
 */
export const fetchVentes = async (params = {}) => {
  const response = await axiosInstance.get('/ventes/', { params })
  return response.data
}

/**
 * Fetches a single sale by ID with all line items.
 * @param {number} id - Sale ID
 * @returns {Promise<Object>} Sale detail object
 */
export const fetchVente = async (id) => {
  const response = await axiosInstance.get(`/ventes/${id}/`)
  return response.data
}

/**
 * Creates a new sale with line items.
 * Stock is automatically deducted server-side.
 * @param {Object} data - { notes, lignes_data: [{ medicament, quantite }] }
 * @returns {Promise<Object>} Created sale
 */
export const createVente = async (data) => {
  const response = await axiosInstance.post('/ventes/', data)
  return response.data
}

/**
 * Cancels a sale and restores stock.
 * @param {number} id - Sale ID
 * @returns {Promise<Object>} Cancellation response
 */
export const annulerVente = async (id) => {
  const response = await axiosInstance.post(`/ventes/${id}/annuler/`)
  return response.data
}
