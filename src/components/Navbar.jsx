import { useEffect, useState } from 'react'

export default function Navbar({ onOpenAuth }) {
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
          background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
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
          {/* Animated HRMS Brand */}
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
          <button className="navbar-btn" aria-label="Search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
          <button className="navbar-btn" aria-label="Theme">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          </button>
          <button className="navbar-signin" onClick={() => onOpenAuth && onOpenAuth('signin')}>Sign in</button>
        </div>
      </nav>
    </div>
  )
}
