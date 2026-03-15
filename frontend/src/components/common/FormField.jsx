import React from 'react'

/**
 * Reusable form field wrapper with label and error display.
 */
const FormField = ({ label, error, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{
        fontSize: '12px', fontWeight: 600,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}{required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>*</span>}
      </label>
    )}
    {children}
    {error && (
      <span style={{ fontSize: '12px', color: 'var(--color-danger)' }}>{error}</span>
    )}
  </div>
)

const inputStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '9px 12px',
  color: 'var(--color-text)',
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.15s',
  width: '100%',
}

export const Input = ({ error, ...props }) => (
  <input
    {...props}
    style={{
      ...inputStyle,
      borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
    }}
    onFocus={(e) => {
      e.target.style.borderColor = 'var(--color-primary)'
      if (props.onFocus) props.onFocus(e)
    }}
    onBlur={(e) => {
      e.target.style.borderColor = error ? 'var(--color-danger)' : 'var(--color-border)'
      if (props.onBlur) props.onBlur(e)
    }}
  />
)

export const Select = ({ children, error, ...props }) => (
  <select
    {...props}
    style={{
      ...inputStyle,
      borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238892aa' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      paddingRight: '32px',
    }}
  >
    {children}
  </select>
)

export const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    style={{
      ...inputStyle,
      resize: 'vertical',
      minHeight: '80px',
      borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
    }}
  />
)

export default FormField
