import React, { useState } from 'react'
import { useVentes } from '../hooks/useVentes'
import VenteTable from '../components/ventes/VenteTable'
import VenteForm from '../components/ventes/VenteForm'
import VenteDetail from '../components/ventes/VenteDetail'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { Input, Select } from '../components/common/FormField'
import { annulerVente, fetchVente } from '../api/ventesApi'

const VentesPage = () => {
  const { ventes, pagination, loading, error, filters, setFilters, reload } = useVentes()
  const [showForm, setShowForm] = useState(false)
  const [detailVente, setDetailVente] = useState(null)
  const [annulerTarget, setAnnulerTarget] = useState(null)
  const [annulerLoading, setAnnulerLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleView = async (vente) => {
    try {
      const full = await fetchVente(vente.id)
      setDetailVente(full)
    } catch {
      setDetailVente(vente)
    }
  }

  const handleSuccess = () => {
    setShowForm(false)
    reload()
    showToast('Vente enregistrée avec succès.')
  }

  const confirmAnnuler = async () => {
    if (!annulerTarget) return
    setAnnulerLoading(true)
    try {
      await annulerVente(annulerTarget.id)
      setAnnulerTarget(null)
      reload()
      showToast(`Vente ${annulerTarget.reference} annulée. Stock réintégré.`)
    } catch (err) {
      showToast(err.userMessage || 'Erreur lors de l\'annulation.', 'danger')
      setAnnulerTarget(null)
    } finally {
      setAnnulerLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
          background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          color: '#fff', padding: '12px 20px', borderRadius: 'var(--radius-md)',
          fontSize: '13px', fontWeight: 600, boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Ventes</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            {pagination.count !== undefined ? `${pagination.count} transaction${pagination.count !== 1 ? 's' : ''}` : 'Historique des transactions'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Nouvelle vente</Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <Input
          type="date"
          value={filters.date_debut || ''}
          onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
          style={{ width: '160px' }}
          placeholder="Date début"
        />
        <Input
          type="date"
          value={filters.date_fin || ''}
          onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
          style={{ width: '160px' }}
        />
        <Select
          value={filters.statut || ''}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
          style={{ width: '160px' }}
        >
          <option value="">Tous les statuts</option>
          <option value="completee">Complétée</option>
          <option value="annulee">Annulée</option>
          <option value="en_cours">En cours</option>
        </Select>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          padding: '9px 14px',
          background: filters.aujourd_hui ? 'var(--color-primary-dim)' : 'var(--color-surface-2)',
          border: `1px solid ${filters.aujourd_hui ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer', fontSize: '13px', fontWeight: 500,
          color: filters.aujourd_hui ? 'var(--color-primary)' : 'var(--color-text-muted)',
          transition: 'all 0.15s',
        }}>
          <input
            type="checkbox"
            checked={!!filters.aujourd_hui}
            onChange={(e) => setFilters({ ...filters, aujourd_hui: e.target.checked ? true : undefined })}
            style={{ accentColor: 'var(--color-primary)', width: '13px', height: '13px' }}
          />
          Aujourd'hui uniquement
        </label>
        {(filters.date_debut || filters.date_fin || filters.statut || filters.aujourd_hui) && (
          <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
            × Effacer filtres
          </Button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {loading ? <Spinner label="Chargement des ventes…" />
          : error ? <div style={{ padding: '24px' }}><ErrorMessage message={error} onRetry={reload} /></div>
          : <VenteTable ventes={ventes} onView={handleView} onAnnuler={setAnnulerTarget} />
        }
      </div>

      {/* New sale modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nouvelle vente" width="700px">
        <VenteForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Detail modal */}
      <Modal isOpen={!!detailVente} onClose={() => setDetailVente(null)} title={`Vente — ${detailVente?.reference}`} width="560px">
        <VenteDetail vente={detailVente} />
      </Modal>

      {/* Annuler confirm modal */}
      <Modal isOpen={!!annulerTarget} onClose={() => setAnnulerTarget(null)} title="Annuler la vente" width="400px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Annuler <strong style={{ color: 'var(--color-text)' }}>{annulerTarget?.reference}</strong> ?
            Les quantités seront réintégrées au stock.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setAnnulerTarget(null)}>Retour</Button>
            <Button variant="danger" loading={annulerLoading} onClick={confirmAnnuler}>Confirmer l'annulation</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default VentesPage
