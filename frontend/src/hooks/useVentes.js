/**
 * Custom hook for fetching and managing the sales list.
 */
import { useState, useEffect, useCallback } from 'react'
import { fetchVentes } from '../api/ventesApi'

/**
 * Hook for paginated sales list with filters.
 * @param {Object} initialFilters - Initial filter parameters
 */
export const useVentes = (initialFilters = {}) => {
  const [ventes, setVentes] = useState([])
  const [pagination, setPagination] = useState({ count: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVentes(filters)
      setVentes(data.results ?? data)
      setPagination({ count: data.count, next: data.next, previous: data.previous })
    } catch (err) {
      setError(err.userMessage || 'Impossible de charger les ventes.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    load()
  }, [load])

  return { ventes, pagination, loading, error, filters, setFilters, reload: load }
}
