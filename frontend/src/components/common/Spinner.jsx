import React from 'react'

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    gap: '12px',
    color: 'var(--color-text-muted)',
    fontSize: '13px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid var(--color-border)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }
}

const Spinner = ({ label = 'Chargement…' }) => (
  <div style={styles.wrapper}>
    <div style={styles.spinner} className="animate-spin" />
    <span>{label}</span>
  </div>
)

export default Spinner
