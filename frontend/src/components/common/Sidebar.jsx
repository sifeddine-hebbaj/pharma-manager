import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⬡', exact: true },
  { to: '/medicaments', label: 'Médicaments', icon: '⬡' },
  { to: '/ventes', label: 'Ventes', icon: '⬡' },
  { to: '/categories', label: 'Catégories', icon: '⬡' },
]

const Sidebar = ({ alertCount = 0 }) => (
  <aside style={{
    width: 'var(--sidebar-width)',
    minHeight: '100vh',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    flexShrink: 0,
  }}>
    {/* Logo */}
    <div style={{
      padding: '24px 20px 20px',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
        }}>
          ✚
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text)' }}>
            PharmaManager
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>
            SMARTHOLOL
          </div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ padding: '16px 12px', flex: 1 }}>
      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
        Navigation
      </div>
      {navItems.map(({ to, label, icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: isActive ? 'var(--color-primary-dim)' : 'transparent',
            marginBottom: '2px',
            transition: 'all 0.15s',
            position: 'relative',
          })}
        >
          <span style={{ fontSize: '10px' }}>●</span>
          <span>{label}</span>
          {label === 'Médicaments' && alertCount > 0 && (
            <span style={{
              marginLeft: 'auto',
              background: 'var(--color-danger)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '99px',
              padding: '1px 7px',
              minWidth: '20px',
              textAlign: 'center',
            }}>
              {alertCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div style={{
      padding: '16px 20px',
      borderTop: '1px solid var(--color-border)',
      fontSize: '11px',
      color: 'var(--color-text-faint)',
    }}>
      v1.0.0 — © 2026 SMARTHOLOL
    </div>
  </aside>
)

export default Sidebar
