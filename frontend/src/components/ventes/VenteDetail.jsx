import React from 'react'
import Badge from '../common/Badge'
import { formatCurrency, formatDateTime, getStatutColor, getStatutLabel } from '../../utils/formatters'

/**
 * Detail view of a single sale, shown inside a modal.
 */
const VenteDetail = ({ vente }) => {
  if (!vente) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header info */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        padding: '16px',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}>
        {[
          ['Référence', <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{vente.reference}</span>],
          ['Statut', <Badge color={getStatutColor(vente.statut)}>{getStatutLabel(vente.statut)}</Badge>],
          ['Date', formatDateTime(vente.date_vente)],
          ['Total TTC', <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)', fontSize: '16px' }}>{formatCurrency(vente.total_ttc)}</span>],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {vente.notes && (
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '0 4px' }}>
          "{vente.notes}"
        </div>
      )}

      {/* Line items */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Articles ({vente.lignes?.length || 0})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {vente.lignes?.map((ligne) => (
            <div key={ligne.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              gap: '12px', alignItems: 'center',
              padding: '10px 14px',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{ligne.medicament_nom}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(ligne.prix_unitaire)} × {ligne.quantite}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Qté: <strong style={{ color: 'var(--color-text)' }}>{ligne.quantite}</strong>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)', fontSize: '13px' }}>
                {formatCurrency(ligne.sous_total)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VenteDetail
