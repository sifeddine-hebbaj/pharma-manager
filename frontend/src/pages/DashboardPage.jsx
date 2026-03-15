import React, { useEffect, useState } from 'react'
import { useAlertes } from '../hooks/useMedicaments'
import { useVentes } from '../hooks/useVentes'
import { useMedicaments } from '../hooks/useMedicaments'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import Badge from '../components/common/Badge'
import Spinner from '../components/common/Spinner'
import { Link } from 'react-router-dom'

const StatCard = ({ label, value, sub, color = 'primary', icon }) => (
  <div style={{
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '8px',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
      background: `var(--color-${color})`,
      borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
    }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <span style={{ fontSize: '20px' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: `var(--color-${color})` }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: '12px', color: 'var(--color-text-faint)' }}>{sub}</div>}
  </div>
)

const DashboardPage = () => {
  const { alertes, count: alertCount, loading: alertLoading } = useAlertes()
  const { ventes, loading: ventesLoading } = useVentes({ aujourd_hui: true, statut: 'completee' })
  const { pagination: medPagination } = useMedicaments()

  const totalAujourdhui = ventes.reduce((s, v) => s + parseFloat(v.total_ttc || 0), 0)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Tableau de bord</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
          Vue d'ensemble de votre pharmacie
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Médicaments actifs"
          value={medPagination.count ?? '—'}
          icon="💊"
          color="primary"
          sub="Dans le catalogue"
        />
        <StatCard
          label="Alertes stock"
          value={alertCount}
          icon="⚠"
          color={alertCount > 0 ? 'danger' : 'success'}
          sub={alertCount > 0 ? 'Réapprovisionnement requis' : 'Tous les stocks OK'}
        />
        <StatCard
          label="Ventes aujourd'hui"
          value={ventesLoading ? '…' : ventes.length}
          icon="🧾"
          color="success"
          sub={formatCurrency(totalAujourdhui) + ' de CA'}
        />
      </div>

      {/* Alert list */}
      {alertCount > 0 && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>
              ⚠ Médicaments en alerte stock
            </h2>
            <Link to="/medicaments?en_alerte=true" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
              Voir tous →
            </Link>
          </div>
          {alertLoading ? <Spinner /> : (
            <div>
              {alertes.slice(0, 5).map((med) => (
                <div key={med.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto',
                  gap: '16px', alignItems: 'center',
                  padding: '12px 24px',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{med.nom}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{med.categorie_nom}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-danger)', fontSize: '16px' }}>
                      {med.stock_actuel}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>/ {med.stock_minimum} min.</div>
                  </div>
                  <Badge color="danger" small>Critique</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent sales */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Ventes du jour</h2>
          <Link to="/ventes" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none' }}>
            Historique complet →
          </Link>
        </div>
        {ventesLoading ? <Spinner /> : ventes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Aucune vente aujourd'hui.
          </div>
        ) : (
          <div>
            {ventes.slice(0, 5).map((vente) => (
              <div key={vente.id} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto',
                gap: '16px', alignItems: 'center',
                padding: '12px 24px',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-primary)' }}>
                  {vente.reference}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {formatDateTime(vente.date_vente)} · {vente.nombre_articles} article{vente.nombre_articles !== 1 ? 's' : ''}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                  {formatCurrency(vente.total_ttc)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
