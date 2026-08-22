export default function ComingSoon() {
  return (
    <section className="coming-soon-section" id="pricing">
      <div className="coming-soon-inner">
        <div className="coming-soon-header">
          <div className="coming-soon-label">Coming soon</div>
          <h2 className="coming-soon-title">What we're shipping next.</h2>
        </div>

        <div className="coming-soon-cards">
          <div className="coming-soon-card">
            <div className="coming-soon-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v12H4z"/>
                <path d="M22 6l-2 2-2-2M2 6l2 2 2-2"/>
                <path d="M8 20h8M12 16v4"/>
              </svg>
            </div>
            <span className="coming-soon-card-badge">In progress</span>
            <h3 className="coming-soon-card-title">Email & in-app notification alerts</h3>
            <p className="coming-soon-card-text">
              Real-time alerts for leave approvals, attendance reminders, profile updates, and policy changes — delivered to both email and an in-app notification center. Employees stay informed; HR officers never miss an approval.
            </p>
          </div>

          <div className="coming-soon-card">
            <div className="coming-soon-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M7 17V9M12 17V5M17 17v-6"/>
              </svg>
            </div>
            <span className="coming-soon-card-badge">In progress</span>
            <h3 className="coming-soon-card-title">Analytics & reports dashboard</h3>
            <p className="coming-soon-card-text">
              A unified analytics dashboard with downloadable salary slips, attendance reports, leave summaries, and headcount trends. Build custom date ranges and export ready-to-share PDFs in one click.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
