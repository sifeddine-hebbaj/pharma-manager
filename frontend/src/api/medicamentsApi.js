/**
 * API functions for the medicaments resource.
 * All calls go through the configured axiosInstance.
 */
import axiosInstance from './axiosConfig'

/**
 * Fetches paginated list of active medications.
 * @param {Object} params - Query params: search, categorie, forme, page, en_alerte
 * @returns {Promise<Object>} Paginated response { count, next, previous, results }
 */
export const fetchMedicaments = async (params = {}) => {
  const response = await axiosInstance.get('/medicaments/', { params })
  return response.data
}

/**
 * Fetches a single medication by ID.
 * @param {number} id - Medication ID
 * @returns {Promise<Object>} Medication detail object
 */
export const fetchMedicament = async (id) => {
  const response = await axiosInstance.get(`/medicaments/${id}/`)
  return response.data
}

/**
 * Creates a new medication.
 * @param {Object} data - Medication fields
 * @returns {Promise<Object>} Created medication
 */
export const createMedicament = async (data) => {
  const response = await axiosInstance.post('/medicaments/', data)
  return response.data
}

/**
 * Updates a medication (partial).
 * @param {number} id - Medication ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated medication
 */
export const updateMedicament = async (id, data) => {
  const response = await axiosInstance.patch(`/medicaments/${id}/`, data)
  return response.data
}

/**
 * Soft-deletes (archives) a medication.
 * @param {number} id - Medication ID
 */
export const deleteMedicament = async (id) => {
  const response = await axiosInstance.delete(`/medicaments/${id}/`)
  return response.data
}

/**
 * Fetches medications with stock at or below minimum threshold.
 * @returns {Promise<Object>} { count, results }
 */
export const fetchAlertes = async () => {
  const response = await axiosInstance.get('/medicaments/alertes/')
  return response.data
}
