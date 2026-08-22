import React from 'react'

export default function RoleComparison() {
  return (
    <section className="pricing-section" id="roles">
      <div className="pricing-inner">
        <div className="pricing-header">
          <div className="pricing-eyebrow">Built for every role</div>
          <h2 className="pricing-title">Two roles. Total clarity.</h2>
          <p className="pricing-subtitle">
            Employees and HR officers each get exactly the access they need — nothing more, nothing less. Every action is logged, every record is auditable.
          </p>
        </div>

        <div className="role-comparison">
          <div className="role-comparison-header">
            <div className="role-comparison-header-cell">
              <span className="role-comparison-header-label">Capability</span>
              <span className="role-comparison-header-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                Feature
              </span>
            </div>
            <div className="role-comparison-header-cell">
              <span className="role-comparison-header-label">Self-service</span>
              <span className="role-comparison-header-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-7 8-7s8 3 8 7"/></svg>
                Employees
              </span>
            </div>
            <div className="role-comparison-header-cell">
              <span className="role-comparison-header-label">Full control</span>
              <span className="role-comparison-header-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3"/><path d="M2 22c0-3 3-5 7-5s7 2 7 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 22c0-2 1.5-4 4-4"/></svg>
                Admin / HR
              </span>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <div className="role-comparison-row" key={i}>
              <div className="role-comparison-cell">
                <span className="role-comparison-feature">{row.feature}</span>
                <span className="role-comparison-feature-desc">{row.desc}</span>
              </div>
              <div className="role-comparison-cell">
                <div className="role-comparison-value">
                  <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {row.employee}
                </div>
              </div>
              <div className="role-comparison-cell">
                <div className="role-comparison-value">
                  <svg className="admin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
                  {row.admin}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const ROWS = [
  {
    feature: 'Profile',
    desc: 'Personal details, job info, documents',
    employee: 'View & edit limited fields',
    admin: 'Full edit access',
  },
  {
    feature: 'Attendance',
    desc: 'Daily check-in / check-out history',
    employee: 'View own records, check-in/out',
    admin: 'View & manage all employee records',
  },
  {
    feature: 'Leave',
    desc: 'Paid, Sick, Unpaid leave requests',
    employee: 'Apply, track status',
    admin: 'Approve, reject, comment',
  },
  {
    feature: 'Payroll',
    desc: 'Salary structure & breakdown',
    employee: 'View-only',
    admin: 'View, update, and manage',
  },
]
