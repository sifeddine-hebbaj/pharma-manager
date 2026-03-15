import React from 'react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatCurrency, formatDateTime, getStatutColor, getStatutLabel } from '../../utils/formatters'

/**
 * Table for displaying the list of sales.
 */
const VenteTable = ({ ventes, onView, onAnnuler }) => {
  if (ventes.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '60px 20px',
        color: 'var(--color-text-muted)', fontSize: '13px',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🧾</div>
        Aucune vente enregistrée.
      </div>
    )
  }

  const thStyle = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px', fontWeight: 700,
    color: 'var(--color-text-faint)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
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
            <th style={thStyle}>Référence</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Articles</th>
            <th style={thStyle}>Total TTC</th>
            <th style={thStyle}>Statut</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ventes.map((vente) => (
            <tr
              key={vente.id}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              style={{ transition: 'background 0.1s' }}
            >
              <td style={tdStyle}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '12px', color: 'var(--color-primary)' }}>
                  {vente.reference}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {formatDateTime(vente.date_vente)}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                  {vente.nombre_articles} article{vente.nombre_articles !== 1 ? 's' : ''}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-success)' }}>
                  {formatCurrency(vente.total_ttc)}
                </span>
              </td>
              <td style={tdStyle}>
                <Badge color={getStatutColor(vente.statut)} small>
                  {getStatutLabel(vente.statut)}
                </Badge>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <Button size="sm" variant="secondary" onClick={() => onView(vente)}>
                    Détail
                  </Button>
                  {vente.statut !== 'annulee' && (
                    <Button size="sm" variant="danger" onClick={() => onAnnuler(vente)}>
                      Annuler
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VenteTable
