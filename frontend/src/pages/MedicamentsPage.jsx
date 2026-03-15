import React, { useState } from 'react'
import { useMedicaments } from '../hooks/useMedicaments'
import MedicamentTable from '../components/medicaments/MedicamentTable'
import MedicamentFilters from '../components/medicaments/MedicamentFilters'
import MedicamentForm from '../components/medicaments/MedicamentForm'
import Modal from '../components/common/Modal'
import Button from '../components/common/Button'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'
import { deleteMedicament } from '../api/medicamentsApi'

const MedicamentsPage = () => {
  const { medicaments, pagination, loading, error, filters, setFilters, reload } = useMedicaments()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleEdit = (med) => { setEditTarget(med); setShowForm(true) }
  const handleNew = () => { setEditTarget(null); setShowForm(true) }
  const handleClose = () => { setShowForm(false); setEditTarget(null) }

  const handleSuccess = () => {
    handleClose()
    reload()
    showToast(editTarget ? 'Médicament modifié avec succès.' : 'Médicament créé avec succès.')
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteMedicament(deleteTarget.id)
      setDeleteTarget(null)
      reload()
      showToast(`"${deleteTarget.nom}" archivé.`)
    } catch (err) {
      showToast(err.userMessage || 'Erreur lors de l\'archivage.', 'danger')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Médicaments</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            {pagination.count !== undefined ? `${pagination.count} médicament${pagination.count !== 1 ? 's' : ''} actif${pagination.count !== 1 ? 's' : ''}` : 'Catalogue de la pharmacie'}
          </p>
        </div>
        <Button onClick={handleNew}>+ Nouveau médicament</Button>
      </div>

      {/* Filters */}
      <MedicamentFilters filters={filters} onChange={setFilters} />

      {/* Content */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {loading ? <Spinner label="Chargement des médicaments…" />
          : error ? <div style={{ padding: '24px' }}><ErrorMessage message={error} onRetry={reload} /></div>
          : <MedicamentTable medicaments={medicaments} onEdit={handleEdit} onDelete={setDeleteTarget} />
        }
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={handleClose}
        title={editTarget ? `Modifier — ${editTarget.nom}` : 'Nouveau médicament'}
        width="680px"
      >
        <MedicamentForm initial={editTarget} onSuccess={handleSuccess} onCancel={handleClose} />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Archiver le médicament"
        width="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Voulez-vous archiver <strong style={{ color: 'var(--color-text)' }}>"{deleteTarget?.nom}"</strong> ?
            Il ne sera plus visible dans le catalogue mais restera dans la base de données.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" loading={deleteLoading} onClick={confirmDelete}>Archiver</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default MedicamentsPage
