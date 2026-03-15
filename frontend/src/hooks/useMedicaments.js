/**
 * Custom hook for fetching and managing the medication list.
 * Handles loading state, error state, and filter changes.
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchMedicaments, fetchAlertes } from '../api/medicamentsApi'

/**
 * Hook for paginated medication list with filters.
 * @param {Object} initialFilters - Initial filter parameters
 */
export const useMedicaments = (initialFilters = {}) => {
  const [medicaments, setMedicaments] = useState([])
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMedicaments(filters)
      setMedicaments(data.results ?? data)
      setPagination({ count: data.count, next: data.next, previous: data.previous })
    } catch (err) {
      setError(err.userMessage || 'Impossible de charger les médicaments.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  return { medicaments, pagination, loading, error, filters, setFilters, reload: load }
}

/**
 * Hook for fetching low-stock alert medications.
 */
export const useAlertes = () => {
  const [alertes, setAlertes] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAlertes()
      setAlertes(data.results)
      setCount(data.count)
    } catch (err) {
      setError(err.userMessage || 'Impossible de charger les alertes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { alertes, count, loading, error, reload: load }
}
