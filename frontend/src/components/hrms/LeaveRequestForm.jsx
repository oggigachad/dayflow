import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function LeaveRequestForm() {
  const { activeEmployee, leaveRequests, handleApplyLeave } = useHRMS()

  const [leaveType, setLeaveType] = useState('Paid') // 'Paid' | 'Sick' | 'Unpaid'
  const [startDate, setStartDate] = useState('2026-09-01')
  const [endDate, setEndDate] = useState('2026-09-03')
  const [remarks, setRemarks] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Calculate days between start and end
  const calcDays = () => {
    const s = new Date(startDate)
    const e = new Date(endDate)
    const diff = (e - s) / (1000 * 60 * 60 * 24) + 1
    return diff > 0 ? diff : 1
  }

  const daysCount = calcDays()

  // My Leave history
  const myLeaves = leaveRequests.filter((l) => l.employeeId === activeEmployee.id)
  const approvedPaidCount = myLeaves
    .filter((l) => l.type === 'Paid' && l.status === 'Approved')
    .reduce((a, b) => a + (b.days || 1), 0)

  const approvedSickCount = myLeaves
    .filter((l) => l.type === 'Sick' && l.status === 'Approved')
    .reduce((a, b) => a + (b.days || 1), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!remarks.trim()) {
      setErrorMessage('Please provide brief remarks or a reason for your leave request.')
      return
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage('End date cannot be earlier than start date.')
      return
    }

    handleApplyLeave({
      type: leaveType,
      startDate,
      endDate,
      remarks,
      days: daysCount,
    })

    setRemarks('')
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Leave Balances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Paid Annual Leave</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgb(115,34,237)' }}>
            {12 - approvedPaidCount} <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>/ 12 days left</span>
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Accrues 1.0 day/month</span>
        </div>

        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Medical / Sick Leave</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgb(253,135,61)' }}>
            {6 - approvedSickCount} <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>/ 6 days left</span>
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Requires medical cert &gt; 2 days</span>
        </div>

        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Unpaid Leave</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>
            Unlimited
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Subject to HR approval</span>
        </div>
      </div>

      {/* 3.5.1 Leave Request Form */}
      <div className="hrms-card">
        <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="hrms-card-title-group">
            <h2 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Apply for Time Off
            </h2>
            <p className="hrms-card-subtitle">Submit a leave request for review and approval by HR management</p>
          </div>
        </div>

        {errorMessage && (
          <div className="auth-error-banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Segmented Leave Type Selector */}
          <div className="auth-role-toggle-container">
            <label className="auth-label">
              <span>Leave Category</span>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 400 }}>
                Select applicable time-off type
              </span>
            </label>
            <div className="auth-role-toggle" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {['Paid', 'Sick', 'Unpaid'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`auth-role-btn ${leaveType === type ? 'active' : ''}`}
                  onClick={() => setLeaveType(type)}
                >
                  <span>{type} Leave</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="auth-input-group">
              <label className="auth-label">Start Date</label>
              <input
                type="date"
                className="auth-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="auth-input-group">
              <label className="auth-label">End Date</label>
              <input
                type="date"
                className="auth-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Duration Banner */}
          <div
            style={{
              padding: '12px 18px',
              background: 'rgb(254, 241, 238)',
              borderRadius: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)', fontWeight: 500 }}>
              Calculated Time-Off Duration:
            </span>
            <strong style={{ fontSize: 16, color: 'rgb(115,34,237)' }}>
              {daysCount} Working {daysCount === 1 ? 'Day' : 'Days'}
            </strong>
          </div>

          {/* Remarks Textarea */}
          <div className="auth-input-group">
            <label className="auth-label">
              <span>Reason / Remarks</span>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Required for audit approval</span>
            </label>
            <textarea
              className="auth-input"
              rows={3}
              style={{ height: 'auto', padding: 14 }}
              placeholder="e.g. Attending annual family wedding / recovering from medical appointment"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Primary CTA Submit */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <div className="cta-primary-wrapper">
              <div className="cta-primary-border"><div className="cta-primary-border-inner" /></div>
              <div className="cta-primary-bg" />
              <button
                type="submit"
                className="cta-primary"
                style={{ height: 50, padding: '0 32px', fontSize: 15, borderRadius: 16 }}
              >
                <span>Submit Leave Request</span>
                <span className="cta-primary-circle" style={{ width: 24, height: 24 }}>
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Leave History List */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">My Leave History & Status</h3>
            <p className="hrms-card-subtitle">Real-time status updates on all applied leaves</p>
          </div>
        </div>

        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason / Remarks</th>
                <th>Admin Decision / Comment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((l) => (
                <tr key={l.id}>
                  <td>
                    <strong style={{ color: '#000' }}>{l.id}</strong>
                  </td>
                  <td>
                    <span className={`hrms-pill ${l.type.toLowerCase()}`}>
                      <span className="hrms-pill-dot" />
                      {l.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13 }}>{l.startDate} to {l.endDate}</span>
                  </td>
                  <td>
                    <strong>{l.days} days</strong>
                  </td>
                  <td style={{ maxWidth: 220 }}>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>{l.remarks}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: l.adminComment ? '#000' : 'rgba(0,0,0,0.4)' }}>
                      {l.adminComment || 'Awaiting review'}
                    </span>
                  </td>
                  <td>
                    <span className={`hrms-pill ${l.status.toLowerCase()}`}>
                      <span className="hrms-pill-dot" />
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
