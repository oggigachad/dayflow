export default function FinalCTA({ onOpenAuth }) {
  return (
    <section className="final-cta-section" id="faq">
      <div className="final-cta-blob purple"></div>
      <div className="final-cta-blob orange"></div>
      <div className="final-cta-inner">
        <h2 className="final-cta-title">
          Ready to simplify <span className="grad">HR for your team?</span>
        </h2>
        <p className="final-cta-paragraph">
          Bring onboarding, attendance, leave, and payroll visibility into one secure, role-based system. Have questions? Contact us or check out our full feature documentation.
        </p>
        <div className="final-cta-buttons">
          <div className="cta-primary-wrapper">
            <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
            <div className="cta-primary-bg"></div>
            <button className="cta-primary" onClick={() => onOpenAuth && onOpenAuth('signup')}>
              <span className="cta-primary-circle">
                <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <span>Start free trial</span>
            </button>
          </div>
          <button className="cta-secondary" onClick={() => onOpenAuth && onOpenAuth('signin')}>Sign in to account</button>
        </div>
      </div>
    </section>
  )
}
