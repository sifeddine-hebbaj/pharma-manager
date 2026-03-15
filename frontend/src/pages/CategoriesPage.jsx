import React, { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { createCategorie, updateCategorie, deleteCategorie } from '../api/categoriesApi'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import FormField, { Input, Textarea } from '../components/common/FormField'
import Spinner from '../components/common/Spinner'
import ErrorMessage from '../components/common/ErrorMessage'

const CategoriesPage = () => {
  const { categories, loading, error, reload } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openNew = () => { setEditTarget(null); setForm({ nom: '', description: '' }); setFormError(null); setShowForm(true) }
  const openEdit = (cat) => { setEditTarget(cat); setForm({ nom: cat.nom, description: cat.description || '' }); setFormError(null); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditTarget(null) }

  const handleSubmit = async () => {
    if (!form.nom.trim()) { setFormError('Le nom est requis.'); return }
    setFormLoading(true); setFormError(null)
    try {
      if (editTarget) {
        await updateCategorie(editTarget.id, form)
        showToast('Catégorie modifiée.')
      } else {
        await createCategorie(form)
        showToast('Catégorie créée.')
      }
      closeForm(); reload()
    } catch (err) {
      setFormError(err.userMessage || 'Erreur lors de la sauvegarde.')
    } finally {
      setFormLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteCategorie(deleteTarget.id)
      setDeleteTarget(null); reload()
      showToast(`Catégorie "${deleteTarget.nom}" supprimée.`)
    } catch (err) {
      showToast(err.userMessage || 'Suppression impossible.', 'danger')
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Catégories</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openNew}>+ Nouvelle catégorie</Button>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {loading ? <Spinner /> : error ? (
          <div style={{ padding: '24px' }}><ErrorMessage message={error} onRetry={reload} /></div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Aucune catégorie. Créez-en une.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nom', 'Description', 'Médicaments', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: i === 3 ? 'right' : 'left',
                    fontSize: '11px', fontWeight: 700, color: 'var(--color-text-faint)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid var(--color-border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  style={{ transition: 'background 0.1s' }}
                >
                  <td style={{ padding: '12px 20px', fontWeight: 600, fontSize: '13px', borderBottom: '1px solid var(--color-border)' }}>
                    {cat.nom}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                    {cat.description || '—'}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>{cat.medicaments_count}</span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="secondary" onClick={() => openEdit(cat)}>Modifier</Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteTarget(cat)}>Supprimer</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form modal */}
      <Modal isOpen={showForm} onClose={closeForm} title={editTarget ? `Modifier — ${editTarget.nom}` : 'Nouvelle catégorie'} width="420px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div style={{ background: 'var(--color-danger-dim)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--color-danger)', fontSize: '13px' }}>
              {formError}
            </div>
          )}
          <FormField label="Nom" required>
            <Input value={form.nom} onChange={(e) => setForm(p => ({ ...p, nom: e.target.value }))} placeholder="Ex: Antibiotique" />
          </FormField>
          <FormField label="Description">
            <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description optionnelle…" rows={3} />
          </FormField>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="secondary" onClick={closeForm}>Annuler</Button>
            <Button variant="primary" loading={formLoading} onClick={handleSubmit}>
              {editTarget ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer la catégorie" width="380px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Supprimer <strong style={{ color: 'var(--color-text)' }}>"{deleteTarget?.nom}"</strong> ?
            Cette action est irréversible. Impossible si des médicaments y sont liés.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Annuler</Button>
            <Button variant="danger" loading={deleteLoading} onClick={confirmDelete}>Supprimer</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CategoriesPage
