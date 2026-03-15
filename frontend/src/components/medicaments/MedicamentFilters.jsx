import React from 'react'
import { Input, Select } from '../common/FormField'
import Button from '../common/Button'
import { useCategories } from '../../hooks/useCategories'

/**
 * Filter bar for the medications list.
 * Controls search, category, form, prescription filter, and alert toggle.
 */
const MedicamentFilters = ({ filters, onChange }) => {
  const { categories } = useCategories()

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? (e.target.checked ? 'true' : '') : e.target.value
    onChange({ ...filters, [key]: val, page: 1 })
  }

  const clearAll = () => onChange({ page: 1 })

  const hasFilters = filters.search || filters.categorie || filters.forme || filters.en_alerte

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      alignItems: 'center',
    }}>
      <div style={{ minWidth: '220px', flex: '1' }}>
        <Input
          placeholder="🔍  Rechercher par nom ou DCI…"
          value={filters.search || ''}
          onChange={set('search')}
        />
      </div>

      <Select value={filters.categorie || ''} onChange={set('categorie')} style={{ width: '160px' }}>
        <option value="">Toutes les catégories</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
      </Select>

      <Select value={filters.forme || ''} onChange={set('forme')} style={{ width: '140px' }}>
        <option value="">Toutes les formes</option>
        <option value="comprime">Comprimé</option>
        <option value="sirop">Sirop</option>
        <option value="injection">Injectable</option>
        <option value="capsule">Capsule</option>
        <option value="pommade">Pommade</option>
        <option value="gouttes">Gouttes</option>
        <option value="patch">Patch</option>
        <option value="autre">Autre</option>
      </Select>

      <label style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '9px 14px',
        background: filters.en_alerte ? 'var(--color-danger-dim)' : 'var(--color-surface-2)',
        border: `1px solid ${filters.en_alerte ? 'var(--color-danger)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '13px',
        color: filters.en_alerte ? 'var(--color-danger)' : 'var(--color-text-muted)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        transition: 'all 0.15s',
      }}>
        <input
          type="checkbox"
          checked={!!filters.en_alerte}
          onChange={set('en_alerte')}
          style={{ accentColor: 'var(--color-danger)', width: '13px', height: '13px' }}
        />
        ⚠ Alertes stock
      </label>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          × Effacer filtres
        </Button>
      )}
    </div>
  )
}

export default MedicamentFilters
