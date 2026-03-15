import React from 'react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatCurrency, formatDate, getFormeLabel } from '../../utils/formatters'

/**
 * Table for displaying the list of medications.
 * Shows stock alerts, prescription status, and action buttons.
 */
const MedicamentTable = ({ medicaments, onEdit, onDelete }) => {
  if (medicaments.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: 'var(--color-text-muted)', fontSize: '13px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>💊</div>
        Aucun médicament trouvé.
      </div>
    )
  }

  const thStyle = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--color-text-faint)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap',
  }

  const tdStyle = {
    padding: '12px 16px',
    fontSize: '13px',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle}>Médicament</th>
            <th style={thStyle}>Catégorie</th>
            <th style={thStyle}>Forme</th>
            <th style={thStyle}>Prix vente</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Péremption</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicaments.map((med) => (
            <tr
              key={med.id}
              style={{
                transition: 'background 0.1s',
                background: med.est_en_alerte ? 'rgba(244,63,94,0.03)' : 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = med.est_en_alerte ? 'rgba(244,63,94,0.03)' : 'transparent'}
            >
              <td style={tdStyle}>
                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{med.nom}</div>
                {med.dci && (
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {med.dci}
                  </div>
                )}
              </td>
              <td style={tdStyle}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{med.categorie_nom}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{getFormeLabel(med.forme)}</span>
              </td>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--color-success)' }}>
                  {formatCurrency(med.prix_vente)}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700,
                    color: med.est_en_alerte ? 'var(--color-danger)' : 'var(--color-text)',
                  }}>
                    {med.stock_actuel}
                  </span>
                  {med.est_en_alerte && (
                    <Badge color="danger" small>⚠ Alerte</Badge>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
                  min. {med.stock_minimum}
                </div>
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {formatDate(med.date_expiration)}
                </span>
              </td>
              <td style={tdStyle}>
                {med.ordonnance_requise
                  ? <Badge color="warning" small>Ordonnance</Badge>
                  : <Badge color="info" small>Libre</Badge>
                }
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="secondary" onClick={() => onEdit(med)}>
                    Modifier
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => onDelete(med)}>
                    Archiver
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MedicamentTable
