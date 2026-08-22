import React, { useEffect, useState } from 'react'

export default function Navbar({ onOpenAuth, currentUser, onNavigatePortal }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: scrolled ? '16px 32px 0' : '28px 64px 0', position: scrolled ? 'sticky' : 'relative', top: 0, zIndex: 100, transition: 'all 0.3s ease' }}>
      <nav
        className="navbar"
        style={{
          width: '100%',
          maxWidth: 1440,
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          padding: scrolled ? '12px 28px' : '0',
          borderRadius: scrolled ? 24 : 0,
          boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)' : 'none',
          border: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 100% Transparent Logo */}
          <img
            src="/logo.svg"
            alt="HRMS Logo"
            className="navbar-logo-transparent"
            style={{
              width: 44,
              height: 44,
              objectFit: 'contain',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }}
          />
          {/* Executive HRMS Brand Text */}
          <span className="navbar-brand hrms-brand-animated">HRMS</span>
        </div>

        <div className="navbar-links">
          <a href="#features">Features</a>
          <a href="#scenarios">How it works</a>
          <a href="#roles">Roles</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <button
              className="navbar-signin"
              onClick={() => onNavigatePortal && onNavigatePortal(currentUser.role === 'hr' ? 'admin' : 'employee')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, rgb(115,34,237) 0%, rgb(99,30,200) 100%)',
                color: '#fff',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(115,34,237,0.35)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span>Open {currentUser.role === 'hr' ? 'Admin Portal' : 'My Workspace'}</span>
            </button>
          ) : (
            <button className="navbar-signin" onClick={() => onOpenAuth && onOpenAuth('signin')}>Sign in</button>
          )}
        </div>
      </nav>
    </div>
  )
}
