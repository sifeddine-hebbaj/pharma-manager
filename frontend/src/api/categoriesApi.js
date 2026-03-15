/**
 * API functions for the categories resource.
 * All calls go through the configured axiosInstance.
 */
import axiosInstance from './axiosConfig'

/**
 * Fetches the full list of medication categories.
 * @returns {Promise<Array>} List of category objects
 */
export const fetchCategories = async () => {
  const response = await axiosInstance.get('/categories/')
  return response.data
}

/**
 * Creates a new category.
 * @param {Object} data - { nom, description }
 * @returns {Promise<Object>} Created category
 */
export const createCategorie = async (data) => {
  const response = await axiosInstance.post('/categories/', data)
  return response.data
}

/**
 * Updates an existing category.
 * @param {number} id - Category ID
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated category
 */
export const updateCategorie = async (id, data) => {
  const response = await axiosInstance.patch(`/categories/${id}/`, data)
  return response.data
}

/**
 * Deletes a category by ID.
 * @param {number} id - Category ID
 */
export const deleteCategorie = async (id) => {
  await axiosInstance.delete(`/categories/${id}/`)
}
