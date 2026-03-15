import React from 'react'

/**
 * Reusable badge/chip component for status indicators and tags.
 * @param {string} color - 'success' | 'danger' | 'warning' | 'info' | 'primary'
 */
const Badge = ({ children, color = 'info', small = false }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: small ? '2px 8px' : '4px 10px',
    borderRadius: '99px',
    fontSize: small ? '11px' : '12px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    background: `var(--color-${color}-dim)`,
    color: `var(--color-${color})`,
    border: `1px solid color-mix(in srgb, var(--color-${color}) 30%, transparent)`,
    whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
)

export default Badge
