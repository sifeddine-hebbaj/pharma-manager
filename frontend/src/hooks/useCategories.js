/**
 * Custom hook for fetching the categories list.
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchCategories } from '../api/categoriesApi'

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCategories()
      setCategories(data.results ?? data)
    } catch (err) {
      setError(err.userMessage || 'Impossible de charger les catégories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { categories, loading, error, reload: load }
}
