import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="navbar" style={{
      position: scrolled ? 'sticky' : 'relative',
      top: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(254,241,238,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      paddingTop: scrolled ? 16 : 0,
      paddingBottom: scrolled ? 16 : 0,
      transition: 'all 0.3s ease',
      borderRadius: scrolled ? 20 : 0,
      marginTop: scrolled ? 8 : 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="navbar-logo">H</div>
        <span className="navbar-brand">HRMS</span>
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
        <button className="navbar-signin">Sign in</button>
      </div>
    </nav>
  )
}
