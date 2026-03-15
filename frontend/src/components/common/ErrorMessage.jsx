import React from 'react'

const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    background: 'var(--color-danger-dim)',
    border: '1px solid var(--color-danger)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 20px',
    color: 'var(--color-danger)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  }}>
    <span style={{ fontSize: '13px' }}>⚠ {message}</span>
    {onRetry && (
      <button onClick={onRetry} style={{
        background: 'transparent',
        border: '1px solid var(--color-danger)',
        color: 'var(--color-danger)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 12px',
        cursor: 'pointer',
        fontSize: '12px',
      }}>
        Réessayer
      </button>
    )}
  </div>
)

export default ErrorMessage
