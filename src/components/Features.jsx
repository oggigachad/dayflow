import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Features() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <section className="features-section" id="features" ref={sectionRef}>
        <div className="features-inner">
          <div className="features-header">
            <div className="features-label">Core features</div>
            <h2 className="features-title">Everything HR needs — in one role-based platform.</h2>
            <p className="features-subtitle">
              Manual HR processes slow everyone down. Our HRMS digitizes the core workflows every organization needs — so HR officers spend less time chasing approvals and employees always know where they stand.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      <AppAdvert />
    </>
  )
}

function FeatureCard({ icon, color, title, text, bullets }) {
  return (
    <div className="feature-card">
      <div className={`feature-card-icon ${color}`}>
        <FeatureIcon name={icon} />
      </div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-text">{text}</p>
      {bullets && (
        <div className="feature-card-list">
          {bullets.map((b, i) => (
            <div className="feature-card-list-item" key={i}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              {b}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FeatureIcon({ name }) {
  const icons = {
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/></>,
    attendance: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
    leave: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    payroll: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.dashboard}
    </svg>
  )
}

const FEATURES = [
  {
    icon: 'lock',
    color: 'purple',
    title: 'Secure sign up & sign in',
    text: 'Register with Employee ID, email, and a role-appropriate account. Email verification and strong password policies keep every account safe.',
    bullets: [
      'Email verification on every account',
      'Strong password policies enforced',
      'Clear error messages on sign-in',
    ],
  },
  {
    icon: 'dashboard',
    color: 'pink',
    title: 'Role-based dashboards',
    text: 'Employees see quick-access cards for Profile, Attendance, and Leave. Admins see the entire organization — switch between employee records instantly.',
    bullets: [
      'Employee dashboard with activity & alerts',
      'Admin view of all employee records',
      'One-click switching between records',
    ],
  },
  {
    icon: 'profile',
    color: 'orange',
    title: 'Employee profile management',
    text: 'Personal details, job information, salary structure, documents, and profile picture — all in one place. Update address, phone, or photo anytime.',
    bullets: [
      'Edit address, phone, or photo anytime',
      'Documents & salary structure in one view',
      'Admins get full edit access across records',
    ],
  },
  {
    icon: 'attendance',
    color: 'green',
    title: 'Attendance tracking',
    text: 'Daily and weekly views with simple check-in / check-out. Every day tracked as Present, Absent, Half-Day, or Leave.',
    bullets: [
      'One-tap check-in / check-out',
      'Present, Absent, Half-Day, Leave statuses',
      'Org-wide visibility for HR officers',
    ],
  },
  {
    icon: 'leave',
    color: 'blue',
    title: 'Leave & time-off management',
    text: 'Apply for Paid, Sick, or Unpaid leave with a date range and remarks. Track Pending, Approved, or Rejected in real time.',
    bullets: [
      'Paid, Sick, and Unpaid leave types',
      'Status tracking: Pending / Approved / Rejected',
      'HR can approve, reject, or comment instantly',
    ],
  },
  {
    icon: 'payroll',
    color: 'purple',
    title: 'Payroll visibility',
    text: 'Employees get a clear, read-only view of salary details. Admins can view, update, and manage payroll across the organization.',
    bullets: [
      'Read-only salary view for employees',
      'Org-wide payroll visibility for admins',
      'Audit-ready records, always accurate',
    ],
  },
]

/* ===== App Advert (gradient band) ===== */
function AppAdvert() {
  return (
    <section className="app-advert-section" id="how-it-works">
      <div className="app-advert-bg" style={{ background: 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(99,30,200) 40%, rgb(236,72,153) 100%)' }}></div>
      <div className="app-advert-overlay"></div>
      <div className="app-advert-content">
        <div className="app-advert-inner">
          <div className="app-advert-text">
            <div className="app-advert-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="iconGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7a32e3"/>
                    <stop offset="50%" stopColor="#ec4899"/>
                    <stop offset="100%" stopColor="#fd873d"/>
                  </linearGradient>
                </defs>
                <rect x="8" y="14" width="48" height="36" rx="6" stroke="url(#iconGrad)" strokeWidth="3"/>
                <path d="M8 22h48" stroke="url(#iconGrad)" strokeWidth="3"/>
                <circle cx="14" cy="18" r="1.5" fill="url(#iconGrad)"/>
                <circle cx="19" cy="18" r="1.5" fill="url(#iconGrad)"/>
                <circle cx="24" cy="18" r="1.5" fill="url(#iconGrad)"/>
                <rect x="14" y="28" width="14" height="8" rx="2" stroke="url(#iconGrad)" strokeWidth="2.5"/>
                <path d="M32 30h14M32 34h10M32 42h20M32 46h12" stroke="url(#iconGrad)" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="app-advert-heading-group">
              <h2 className="app-advert-heading">Built for every role in your organization.</h2>
              <p className="app-advert-paragraph">
                One platform. One source of truth. Employees get clarity, HR officers get control — and every action is logged for audit. Bring onboarding, attendance, leave, and payroll visibility into a single role-based system.
              </p>
            </div>
            <a className="app-advert-cta" href="#pricing">
              <span>Explore roles & permissions</span>
              <svg viewBox="0 0 32 32" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 6l10 10-10 10M26 16H6"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
