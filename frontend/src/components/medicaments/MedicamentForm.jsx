import React, { useState, useEffect } from 'react'
import FormField, { Input, Select, Textarea } from '../common/FormField'
import Button from '../common/Button'
import { useCategories } from '../../hooks/useCategories'
import { createMedicament, updateMedicament } from '../../api/medicamentsApi'

const FORMES = [
  { value: 'comprime', label: 'Comprimé' },
  { value: 'sirop', label: 'Sirop' },
  { value: 'injection', label: 'Injectable' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'pommade', label: 'Pommade' },
  { value: 'suppositoire', label: 'Suppositoire' },
  { value: 'gouttes', label: 'Gouttes' },
  { value: 'patch', label: 'Patch' },
  { value: 'autre', label: 'Autre' },
]

const EMPTY = {
  nom: '', dci: '', categorie: '', forme: 'comprime', dosage: '',
  prix_achat: '', prix_vente: '', stock_actuel: 0, stock_minimum: 10,
  date_expiration: '', ordonnance_requise: false,
}

/**
 * Form for creating or editing a medication.
 * Handles validation and API submission internally.
 */
const MedicamentForm = ({ initial = null, onSuccess, onCancel }) => {
  const { categories } = useCategories()
  const [form, setForm] = useState(initial ? {
    nom: initial.nom || '',
    dci: initial.dci || '',
    categorie: initial.categorie || '',
    forme: initial.forme || 'comprime',
    dosage: initial.dosage || '',
    prix_achat: initial.prix_achat || '',
    prix_vente: initial.prix_vente || '',
    stock_actuel: initial.stock_actuel ?? 0,
    stock_minimum: initial.stock_minimum ?? 10,
    date_expiration: initial.date_expiration || '',
    ordonnance_requise: initial.ordonnance_requise || false,
  } : { ...EMPTY })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.nom.trim()) e.nom = 'Le nom est requis.'
    if (!form.categorie) e.categorie = 'La catégorie est requise.'
    if (!form.prix_achat || parseFloat(form.prix_achat) <= 0) e.prix_achat = 'Prix achat invalide.'
    if (!form.prix_vente || parseFloat(form.prix_vente) <= 0) e.prix_vente = 'Prix vente invalide.'
    if (parseFloat(form.prix_vente) <= parseFloat(form.prix_achat)) {
      e.prix_vente = 'Le prix de vente doit être supérieur au prix d\'achat.'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    setApiError(null)
    try {
      const payload = {
        ...form,
        prix_achat: parseFloat(form.prix_achat),
        prix_vente: parseFloat(form.prix_vente),
        stock_actuel: parseInt(form.stock_actuel),
        stock_minimum: parseInt(form.stock_minimum),
        date_expiration: form.date_expiration || null,
      }
      if (initial) {
        await updateMedicament(initial.id, payload)
      } else {
        await createMedicament(payload)
      }
      onSuccess()
    } catch (err) {
      setApiError(err.userMessage || 'Erreur lors de la sauvegarde.')
    } finally {
      setLoading(false)
    }
  }

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {apiError && (
        <div style={{
          background: 'var(--color-danger-dim)', border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          color: 'var(--color-danger)', fontSize: '13px',
        }}>
          {apiError}
        </div>
      )}

      <div style={grid2}>
        <FormField label="Nom commercial" required error={errors.nom}>
          <Input value={form.nom} onChange={set('nom')} placeholder="Ex: Amoxicilline 500mg" error={errors.nom} />
        </FormField>
        <FormField label="DCI">
          <Input value={form.dci} onChange={set('dci')} placeholder="Dénomination Commune Internationale" />
        </FormField>
      </div>

      <div style={grid2}>
        <FormField label="Catégorie" required error={errors.categorie}>
          <Select value={form.categorie} onChange={set('categorie')} error={errors.categorie}>
            <option value="">— Sélectionner —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="Forme galénique">
          <Select value={form.forme} onChange={set('forme')}>
            {FORMES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
        </FormField>
      </div>

      <FormField label="Dosage">
        <Input value={form.dosage} onChange={set('dosage')} placeholder="Ex: 500mg, 250mg/5ml" />
      </FormField>

      <div style={grid2}>
        <FormField label="Prix d'achat (MAD)" required error={errors.prix_achat}>
          <Input type="number" step="0.01" min="0" value={form.prix_achat} onChange={set('prix_achat')} error={errors.prix_achat} />
        </FormField>
        <FormField label="Prix de vente (MAD)" required error={errors.prix_vente}>
          <Input type="number" step="0.01" min="0" value={form.prix_vente} onChange={set('prix_vente')} error={errors.prix_vente} />
        </FormField>
      </div>

      <div style={grid2}>
        <FormField label="Stock actuel">
          <Input type="number" min="0" value={form.stock_actuel} onChange={set('stock_actuel')} />
        </FormField>
        <FormField label="Stock minimum (alerte)">
          <Input type="number" min="0" value={form.stock_minimum} onChange={set('stock_minimum')} />
        </FormField>
      </div>

      <div style={grid2}>
        <FormField label="Date de péremption">
          <Input type="date" value={form.date_expiration} onChange={set('date_expiration')} />
        </FormField>
        <FormField label="Ordonnance requise">
          <label style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontSize: '13px',
            color: 'var(--color-text)',
          }}>
            <input
              type="checkbox"
              checked={form.ordonnance_requise}
              onChange={set('ordonnance_requise')}
              style={{ width: '14px', height: '14px', accentColor: 'var(--color-primary)' }}
            />
            Ordonnance médicale requise
          </label>
        </FormField>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          {initial ? 'Enregistrer les modifications' : 'Créer le médicament'}
        </Button>
      </div>
    </div>
  )
}

export default MedicamentForm
