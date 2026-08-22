import { useEffect, useRef, useState } from 'react'

const SCENARIOS = [
  {
    heading: 'Secure sign in for every role',
    paragraph: 'Register with Employee ID, email, and a role-appropriate account (Employee or HR). Email verification and strong password policies keep every account safe — with clear error messages guiding users through every step.',
    features: [
      { icon: 'shield', text: 'Email verification & password strength checks' },
      { icon: 'user', text: 'Role-based accounts: Employee or HR / Admin' },
      { icon: 'lock', text: 'Clear error messages on every sign-in step' },
    ],
    mockup: <SignInMockup />,
  },
  {
    heading: 'Dashboards tailored to each role',
    paragraph: 'Employees get quick-access cards for Profile, Attendance, and Leave — plus recent activity and alerts. Admin / HR get a full organization view with one-click switching between employee records.',
    features: [
      { icon: 'grid', text: 'Employee dashboard with quick-access cards' },
      { icon: 'users', text: 'Admin view across the entire organization' },
      { icon: 'switch', text: 'Switch between employee records instantly' },
    ],
    mockup: <DashboardMockup />,
  },
  {
    heading: 'Attendance that tracks itself',
    paragraph: 'Daily and weekly views with simple check-in / check-out. Every day is tracked as Present, Absent, Half-Day, or Leave. Employees see their own history; admins see the whole organization at once.',
    features: [
      { icon: 'clock', text: 'One-tap check-in / check-out for employees' },
      { icon: 'calendar', text: 'Daily & weekly attendance history' },
      { icon: 'chart', text: 'Org-wide attendance visibility for HR' },
    ],
    mockup: <AttendanceMockup />,
  },
  {
    heading: 'Leave requests, end to end',
    paragraph: 'Employees apply for Paid, Sick, or Unpaid leave with date ranges and remarks — then track status as Pending, Approved, or Rejected. HR can approve, reject, or comment in a click.',
    features: [
      { icon: 'doc', text: 'Paid, Sick, or Unpaid leave with remarks' },
      { icon: 'eye', text: 'Real-time status: Pending / Approved / Rejected' },
      { icon: 'check', text: 'Approve, reject, or comment instantly' },
    ],
    mockup: <LeaveMockup />,
  },
]

export default function Scenarios() {
  const [index, setIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [visibleFeatures, setVisibleFeatures] = useState([false, false, false])
  const timerRef = useRef(null)

  useEffect(() => {
    setVisibleFeatures([false, false, false])
    const timers = [
      setTimeout(() => setVisibleFeatures([true, false, false]), 350),
      setTimeout(() => setVisibleFeatures([true, true, false]), 550),
      setTimeout(() => setVisibleFeatures([true, true, true]), 750),
    ]
    return () => timers.forEach(clearTimeout)
  }, [index])

  useEffect(() => {
    const DURATION = 6000
    const STEP = 50
    let elapsed = 0
    timerRef.current = setInterval(() => {
      elapsed += STEP
      const pct = Math.min(100, (elapsed / DURATION) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timerRef.current)
        setIndex((i) => (i + 1) % SCENARIOS.length)
        setProgress(0)
      }
    }, STEP)
    return () => clearInterval(timerRef.current)
  }, [index])

  const scenario = SCENARIOS[index]

  const goTo = (i) => {
    setIndex(i)
    setProgress(0)
  }

  return (
    <section className="scenarios-section" id="scenarios">
      <div className="scenarios-inner">
        <div className="scenarios-left">
          <div className="scenarios-left-content">
            <div className="scenarios-label">Why teams choose our HRMS</div>
            <div className="scenarios-heading-container">
              <h2 className="scenarios-heading" key={`h-${index}`} style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
                {scenario.heading}
              </h2>
            </div>
            <div className="scenarios-paragraph-container">
              <p className="scenarios-paragraph" key={`p-${index}`} style={{ animation: 'fadeInUp 0.5s ease 0.1s forwards', opacity: 0 }}>
                {scenario.paragraph}
              </p>
            </div>
            <div className="scenarios-features">
              {scenario.features.map((f, i) => (
                <div className={`scenario-feature-card ${visibleFeatures[i] ? 'visible' : ''}`} key={`${index}-${i}`}>
                  <div className="scenario-feature-icon">
                    <FeatureIcon name={f.icon} />
                  </div>
                  <span className="scenario-feature-text">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="scenarios-pagination">
            {SCENARIOS.map((_, i) => (
              <div className="pagination-btn" key={i} onClick={() => goTo(i)}>
                {i === index ? (
                  <>
                    <svg viewBox="0 0 44 44">
                      <defs>
                        <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#9333ea"/>
                          <stop offset="100%" stopColor="#fd873d"/>
                        </linearGradient>
                      </defs>
                      <circle className="bg" cx="22" cy="22" r="20"/>
                      <circle className="progress" cx="22" cy="22" r="20"
                        strokeDasharray={`${(progress/100) * 125.6} 125.6`}/>
                    </svg>
                    <div className="pagination-btn-active"><span>{i+1}</span></div>
                  </>
                ) : (
                  <div className="pagination-btn-inactive"><span>{i+1}</span></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="scenarios-right">
          <div className="scenarios-image-container">
            <div className="scenarios-image active" key={`img-${index}`} style={{ animation: 'slideInFromRight 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}>
              {scenario.mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureIcon({ name }) {
  const icons = {
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M2 22c0-3 3-5 7-5s7 2 7 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 22c0-2 1.5-4 4-4"/></>,
    switch: <><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    chart: <><path d="M3 21V3M3 21h18M7 17V9M12 17V5M17 17v-7"/></>,
    doc: <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    check: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.doc}
    </svg>
  )
}

/* ===== Mockups for each scenario ===== */

function SignInMockup() {
  return (
    <div className="scenario-mockup">
      <div className="scenario-mockup-header">
        <div className="scenario-mockup-title">Sign in to HRMS</div>
        <div className="scenario-mockup-badge">Secure</div>
      </div>
      <div className="scenario-mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>Employee ID</label>
          <input type="text" defaultValue="EMP-2024-0148" readOnly style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, background: '#fafafa', color: '#000' }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>Email</label>
          <input type="email" defaultValue="alex.morgan@company.com" readOnly style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, background: '#fafafa', color: '#000' }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'rgba(0,0,0,0.6)' }}>Password</label>
          <input type="password" defaultValue="********" readOnly style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 14, background: '#fafafa', color: '#000' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, fontSize: 12, color: 'rgb(22,163,74)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
          Email verified · Password strength: Strong
        </div>
        <button style={{ marginTop: 8, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgb(122,50,227), rgb(253,135,61))', color: '#fff', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          Sign in to dashboard →
        </button>
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="scenario-mockup">
      <div className="scenario-mockup-header">
        <div className="scenario-mockup-title">Admin / HR Dashboard</div>
        <div className="scenario-mockup-badge">Admin view</div>
      </div>
      <div className="scenario-mockup-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'rgb(254,241,238)', padding: 14, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Employees</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'rgb(122,50,227)' }}>248</div>
          </div>
          <div style={{ background: 'rgb(254,241,238)', padding: 14, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Present today</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'rgb(16,185,129)' }}>224</div>
          </div>
          <div style={{ background: 'rgb(254,241,238)', padding: 14, borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Pending</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'rgb(253,135,61)' }}>10</div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'rgba(0,0,0,0.7)' }}>Pending leave approvals</div>
        {[
          { name: 'Alex Morgan', type: 'Sick leave', dates: 'Aug 22 - Aug 23' },
          { name: 'Priya Sharma', type: 'Paid leave', dates: 'Aug 25 - Aug 27' },
          { name: 'Daniel Lee', type: 'Unpaid leave', dates: 'Sep 02' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${['#9333ea', '#ec4899', '#fd873d'][i]}, ${['#ec4899', '#fd873d', '#9333ea'][i]})` }}></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>{r.type} · {r.dates}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(22,163,74)" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
              <button style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceMockup() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1)
  const statusMap = { p: '#22c55e', a: '#ef4444', h: '#f59e0b', l: '#9333ea' }
  const statusArr = days.map((_, i) => {
    const r = (i * 7 + 3) % 10
    if (r === 0) return 'a'
    if (r === 5) return 'h'
    if (r === 8) return 'l'
    return 'p'
  })
  return (
    <div className="scenario-mockup">
      <div className="scenario-mockup-header">
        <div className="scenario-mockup-title">Attendance — August 2024</div>
        <div className="scenario-mockup-badge">22 present</div>
      </div>
      <div className="scenario-mockup-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(0,0,0,0.4)', padding: '4px 0' }}>{d}</div>
          ))}
          {days.map((day, i) => (
            <div key={day} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f6fb', borderRadius: 8, position: 'relative' }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{day}</span>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusMap[statusArr[i]], marginTop: 2 }}></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11 }}>
          <Legend color="#22c55e" label="Present" />
          <Legend color="#ef4444" label="Absent" />
          <Legend color="#f59e0b" label="Half-day" />
          <Legend color="#9333ea" label="Leave" />
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></div>
      <span style={{ color: 'rgba(0,0,0,0.6)' }}>{label}</span>
    </div>
  )
}

function LeaveMockup() {
  return (
    <div className="scenario-mockup">
      <div className="scenario-mockup-header">
        <div className="scenario-mockup-title">Leave request</div>
        <div className="scenario-mockup-badge" style={{ background: 'rgba(245,158,11,0.15)', color: 'rgb(217,119,6)' }}>Pending</div>
      </div>
      <div className="scenario-mockup-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#f7f6fb', padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Leave type</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Sick leave</div>
          </div>
          <div style={{ background: '#f7f6fb', padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Duration</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>2 days</div>
          </div>
          <div style={{ background: '#f7f6fb', padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>From</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Aug 22, 2024</div>
          </div>
          <div style={{ background: '#f7f6fb', padding: 12, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>To</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Aug 23, 2024</div>
          </div>
        </div>
        <div style={{ background: '#f7f6fb', padding: 14, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', marginBottom: 6 }}>Remarks</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.8)' }}> Fever and rest advised by doctor. Will resume work on Monday.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgb(34,197,94)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Approve</button>
          <button style={{ flex: 1, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: 'rgb(239,68,68)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Reject</button>
        </div>
      </div>
    </div>
  )
}
