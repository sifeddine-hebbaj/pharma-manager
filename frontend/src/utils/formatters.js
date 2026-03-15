/**
 * Shared utility functions for PharmaManager frontend.
 */

/**
 * Formats a decimal number as Moroccan Dirham currency string.
 * @param {number|string} amount
 * @returns {string} e.g. "18,00 MAD"
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount)
  if (isNaN(num)) return '—'
  return `${num.toFixed(2).replace('.', ',')} MAD`
}

/**
 * Formats a date string to a readable French locale date.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "14 mars 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

/**
 * Formats a datetime string to a readable French locale datetime.
 * @param {string} dateStr - ISO datetime string
 * @returns {string} e.g. "14 mars 2026 à 10:30"
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

/**
 * Returns the CSS color variable name for a sale status badge.
 * @param {string} statut
 * @returns {string}
 */
export const getStatutColor = (statut) => {
  switch (statut) {
    case 'completee': return 'success'
    case 'annulee': return 'danger'
    case 'en_cours': return 'warning'
    default: return 'info'
  }
}

/**
 * Returns a French label for a sale status.
 * @param {string} statut
 * @returns {string}
 */
export const getStatutLabel = (statut) => {
  switch (statut) {
    case 'completee': return 'Complétée'
    case 'annulee': return 'Annulée'
    case 'en_cours': return 'En cours'
    default: return statut
  }
}

/**
 * Returns the French label for a galenic form.
 * @param {string} forme
 * @returns {string}
 */
export const getFormeLabel = (forme) => {
  const labels = {
    comprime: 'Comprimé', sirop: 'Sirop', injection: 'Injectable',
    capsule: 'Capsule', pommade: 'Pommade', suppositoire: 'Suppositoire',
    gouttes: 'Gouttes', patch: 'Patch', autre: 'Autre',
  }
  return labels[forme] || forme
}
