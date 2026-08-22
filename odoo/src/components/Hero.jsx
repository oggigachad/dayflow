export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-left animate-fade-in-up">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot"></span>
              New · Role-based HRMS for modern teams
            </div>
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
                <button className="cta-primary">
                  <span className="cta-primary-circle">
                    <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                  <span>Get started free</span>
                </button>
              </div>
              <button className="cta-secondary">Request a demo</button>
            </div>
            <div className="trust-notes">
              <span>• 31-day free trial</span>
              <span>• No credit card required</span>
              <span>• Cancel anytime</span>
            </div>
          </div>

          <div className="hero-right animate-fade-in-right">
            <HeroDashboardMockup />
          </div>
        </div>

        {/* Offer Strip */}
        <div className="offer-strip">
          <div className="offer-text">
            <span>Enjoy 50% off premium features for first 3 months — 21 days remaining</span>
            <a href="#pricing">Start 14-day trial</a>
          </div>
          <LogoTicker />
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
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Employees
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Attendance
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            Leave
          </div>
          <div className="hero-mockup-nav-item">
            <svg className="hero-mockup-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.598 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.598-1M12 16v1"/></svg>
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

function LogoTicker() {
  const items = [
    'Slack', 'Notion', 'Figma', 'Linear', 'GitHub', 'Stripe', 'Vercel', 'Zoom'
  ]
  const triple = [...items, ...items, ...items]
  return (
    <div className="logo-ticker">
      <div className="logo-ticker-mask"></div>
      <div className="logo-ticker-track">
        {triple.map((name, i) => (
          <div className="logo-ticker-item" key={i}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"/>
              <path d="M8 12l3 3 5-6"/>
            </svg>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}
