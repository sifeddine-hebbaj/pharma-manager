import React, { useState } from 'react'
import FormField, { Select, Textarea } from '../common/FormField'
import { Input } from '../common/FormField'
import Button from '../common/Button'
import { useMedicaments } from '../../hooks/useMedicaments'
import { createVente } from '../../api/ventesApi'
import { formatCurrency } from '../../utils/formatters'

/**
 * Form for creating a new sale with multiple line items.
 * Validates stock availability before submission.
 */
const VenteForm = ({ onSuccess, onCancel }) => {
  const { medicaments } = useMedicaments({ page_size: 100 })
  const [lignes, setLignes] = useState([{ medicament_id: '', quantite: 1 }])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [errors, setErrors] = useState({})

  const getMedicament = (id) => medicaments.find((m) => String(m.id) === String(id))

  const addLigne = () => setLignes((prev) => [...prev, { medicament_id: '', quantite: 1 }])

  const removeLigne = (index) => setLignes((prev) => prev.filter((_, i) => i !== index))

  const updateLigne = (index, field, value) => {
    setLignes((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l))
    setErrors((prev) => ({ ...prev, [`ligne_${index}`]: null }))
  }

  const calcTotal = () => {
    return lignes.reduce((sum, l) => {
      const med = getMedicament(l.medicament_id)
      if (!med) return sum
      return sum + (parseFloat(med.prix_vente) * parseInt(l.quantite || 0))
    }, 0)
  }

  const validate = () => {
    const e = {}
    if (lignes.length === 0) { e.general = 'Ajoutez au moins un article.'; return e }
    lignes.forEach((l, i) => {
      if (!l.medicament_id) { e[`ligne_${i}`] = 'Sélectionnez un médicament.'; return }
      const med = getMedicament(l.medicament_id)
      const qty = parseInt(l.quantite)
      if (!qty || qty < 1) { e[`ligne_${i}`] = 'Quantité invalide.'; return }
      if (med && qty > med.stock_actuel) {
        e[`ligne_${i}`] = `Stock insuffisant (disponible: ${med.stock_actuel}).`
      }
    })
    // Duplicate check
    const ids = lignes.map((l) => l.medicament_id).filter(Boolean)
    if (new Set(ids).size !== ids.length) {
      e.general = 'Un médicament est sélectionné plusieurs fois.'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    setApiError(null)
    try {
      await createVente({
        notes: notes || null,
        lignes_data: lignes.map((l) => ({
          medicament: parseInt(l.medicament_id),
          quantite: parseInt(l.quantite),
        })),
      })
      onSuccess()
    } catch (err) {
      setApiError(err.userMessage || 'Erreur lors de la création de la vente.')
    } finally {
      setLoading(false)
    }
  }

  const total = calcTotal()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {(apiError || errors.general) && (
        <div style={{
          background: 'var(--color-danger-dim)', border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          color: 'var(--color-danger)', fontSize: '13px',
        }}>
          {apiError || errors.general}
        </div>
      )}

      {/* Line items */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <label style={{
            fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Articles
          </label>
          <Button size="sm" variant="secondary" onClick={addLigne}>
            + Ajouter un article
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {lignes.map((ligne, i) => {
            const med = getMedicament(ligne.medicament_id)
            return (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px auto',
                gap: '10px',
                alignItems: 'start',
                padding: '12px',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-md)',
                border: errors[`ligne_${i}`]
                  ? '1px solid var(--color-danger)'
                  : '1px solid var(--color-border)',
              }}>
                <div>
                  <Select
                    value={ligne.medicament_id}
                    onChange={(e) => updateLigne(i, 'medicament_id', e.target.value)}
                  >
                    <option value="">— Sélectionner un médicament —</option>
                    {medicaments.map((m) => (
                      <option key={m.id} value={m.id} disabled={m.stock_actuel === 0}>
                        {m.nom} {m.dosage ? `(${m.dosage})` : ''} — stock: {m.stock_actuel}
                      </option>
                    ))}
                  </Select>
                  {med && (
                    <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '4px' }}>
                      Prix unitaire: {formatCurrency(med.prix_vente)}
                      {ligne.quantite > 1 && ` × ${ligne.quantite} = ${formatCurrency(parseFloat(med.prix_vente) * parseInt(ligne.quantite || 0))}`}
                    </div>
                  )}
                  {errors[`ligne_${i}`] && (
                    <div style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '4px' }}>
                      {errors[`ligne_${i}`]}
                    </div>
                  )}
                </div>

                <Input
                  type="number"
                  min="1"
                  max={med?.stock_actuel || 9999}
                  value={ligne.quantite}
                  onChange={(e) => updateLigne(i, 'quantite', e.target.value)}
                  placeholder="Qté"
                />

                {lignes.length > 1 && (
                  <button
                    onClick={() => removeLigne(i)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-faint)', fontSize: '18px',
                      padding: '6px', lineHeight: 1, borderRadius: 'var(--radius-sm)',
                      transition: 'color 0.15s',
                    }}
                    title="Supprimer cet article"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Total */}
      {total > 0 && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          padding: '12px 16px',
          background: 'var(--color-primary-dim)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total TTC
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <FormField label="Notes (optionnel)">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Remarques sur la vente…"
          rows={2}
        />
      </FormField>

      <div style={{
        display: 'flex', gap: '10px', justifyContent: 'flex-end',
        paddingTop: '16px', borderTop: '1px solid var(--color-border)',
      }}>
        <Button variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button variant="primary" loading={loading} onClick={handleSubmit} disabled={lignes.every(l => !l.medicament_id)}>
          Enregistrer la vente
        </Button>
      </div>
    </div>
  )
}

export default VenteForm
