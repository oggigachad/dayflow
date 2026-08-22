import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero({ onOpenAuth }) {
  const heroRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered reveal for Hero text and CTAs
      gsap.from('.hero-heading-line1, .hero-heading-line2', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: 'power3.out',
      })

      gsap.from('.hero-paragraph', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        delay: 0.25,
        ease: 'power3.out',
      })

      gsap.from('.hero-ctas, .trust-notes span', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        delay: 0.35,
        ease: 'power3.out',
      })

      gsap.from('.hero-mockup', {
        scale: 0.94,
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      })

      // Continuous subtle breathing float on mockup
      gsap.to('.hero-mockup', {
        y: -8,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      // Continuous bar charts animation
      gsap.to('.hero-mockup-bar-item', {
        scaleY: 0.6,
        transformOrigin: 'bottom',
        duration: 1.4,
        stagger: {
          each: 0.12,
          repeat: -1,
          yoyo: true,
        },
        ease: 'power1.inOut',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero-section" ref={heroRef}>
      <div className="hero-inner">
        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-heading">
              <span className="hero-heading-line1">HRMS — One platform</span>
              <span className="hero-heading-line2">for every HR task.</span>
            </h1>
            <p className="hero-paragraph">
              From onboarding to payroll — streamline attendance, leave, profiles, and approvals for your entire team. Role-based access for Admins and Employees, built in.
            </p>
            <div className="hero-ctas">
              <div className="cta-primary-wrapper">
                <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
                <div className="cta-primary-bg"></div>
                <button className="cta-primary" onClick={() => onOpenAuth && onOpenAuth('signup')}>
                  <span className="cta-primary-circle">
                    <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span>Get started free</span>
                </button>
              </div>
              <button className="cta-secondary" onClick={() => onOpenAuth && onOpenAuth('signin')}>Sign in</button>
            </div>
            <div className="trust-notes">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                31-day free trial
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                No credit card required
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                Cancel anytime
              </span>
            </div>
          </div>

          <div className="hero-right">
            <HeroDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroDashboardMockup() {
  return (
    <div className="hero-mockup">
      <div className="hero-mockup-bar">
        <div className="hero-mockup-dot r"></div>
        <div className="hero-mockup-dot y"></div>
        <div className="hero-mockup-dot g"></div>
      </div>
      <div className="hero-mockup-body">
        <div className="hero-mockup-sidebar">
          <div className="hero-mockup-sidebar-title">HRMS</div>
          <div className="hero-mockup-nav-item active">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Employees
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Attendance
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Leave
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.598 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.598-1M12 16v1"/></svg>
            Payroll
          </div>
        </div>
        <div className="hero-mockup-main">
          <div className="hero-mockup-card">
            <div className="hero-mockup-card-row">
              <span className="hero-mockup-card-label">Total employees</span>
              <span className="hero-mockup-card-label">+12 this month</span>
            </div>
            <span className="hero-mockup-card-value">248</span>
          </div>
          <div className="hero-mockup-stat-grid">
            <div className="hero-mockup-stat">
              <div className="hero-mockup-stat-label">Present today</div>
              <div className="hero-mockup-stat-value" style={{color: 'rgb(16,185,129)'}}>224</div>
            </div>
            <div className="hero-mockup-stat">
              <div className="hero-mockup-stat-label">On leave</div>
              <div className="hero-mockup-stat-value" style={{color: 'rgb(253,135,61)'}}>14</div>
            </div>
            <div className="hero-mockup-stat">
              <div className="hero-mockup-stat-label">Pending</div>
              <div className="hero-mockup-stat-value" style={{color: 'rgb(122,50,227)'}}>10</div>
            </div>
          </div>
          <div className="hero-mockup-bars">
            <div className="hero-mockup-bar-item" style={{height: '40%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '70%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '55%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '90%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '60%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '75%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '50%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '85%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '65%'}}></div>
            <div className="hero-mockup-bar-item" style={{height: '95%'}}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
