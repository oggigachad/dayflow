import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import LeaveRequestForm from './LeaveRequestForm.jsx'

export default function LeaveApprovals() {
  const {
    currentUser,
    leaveRequests,
    handleApproveLeave,
    handleRejectLeave,
  } = useHRMS()

  const isAdmin = currentUser.role === 'hr'

  const [activeTabFilter, setActiveTabFilter] = useState('All') // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [commentInputs, setCommentInputs] = useState({})
  const [showApplyForm, setShowApplyForm] = useState(!isAdmin)

  if (!isAdmin || showApplyForm) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 40, padding: '0 16px', fontSize: 13, borderRadius: 12 }}
              onClick={() => setShowApplyForm(false)}
            >
              ← Back to Admin Leave Approvals Table
            </button>
          </div>
        )}
        <LeaveRequestForm />
      </div>
    )
  }

  const filteredRequests = leaveRequests.filter((l) => {
    if (activeTabFilter === 'All') return true
    return l.status === activeTabFilter
  })

  const handleCommentChange = (id, text) => {
    setCommentInputs((prev) => ({ ...prev, [id]: text }))
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Leave Management Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Pending Action</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgb(122,50,227)' }}>
            {leaveRequests.filter((l) => l.status === 'Pending').length} Requests
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Requires HR decision</span>
        </div>

        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Approved This Month</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgb(5,150,105)' }}>
            {leaveRequests.filter((l) => l.status === 'Approved').length} Requests
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Authorized and scheduled</span>
        </div>

        <div className="hrms-card" style={{ padding: 22, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Rejected</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'rgb(220,38,38)' }}>
            {leaveRequests.filter((l) => l.status === 'Rejected').length} Requests
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Coverage / schedule constraints</span>
        </div>
      </div>

      {/* Main Leave Approvals Table Card */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h2 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Organization Leave Approvals Hub
            </h2>
            <p className="hrms-card-subtitle">
              Review requests with reason audit trail, leave balance impact, and one-click decisions
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 40, padding: '0 16px', fontSize: 13, borderRadius: 12 }}
              onClick={() => setShowApplyForm(true)}
            >
              + Apply on Behalf of Employee
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 6, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTabFilter(tab)}
              style={{
                padding: '8px 18px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                background: activeTabFilter === tab ? 'rgb(122,50,227)' : 'transparent',
                color: activeTabFilter === tab ? '#fff' : 'rgba(0,0,0,0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab} ({tab === 'All' ? leaveRequests.length : leaveRequests.filter((l) => l.status === tab).length})
            </button>
          ))}
        </div>

        {/* Approvals Table */}
        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Employee Name & ID</th>
                <th>Leave Type</th>
                <th>Dates & Duration</th>
                <th>Reason / Remarks</th>
                <th>Admin Decision Comment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const comment = commentInputs[req.id] || req.adminComment || ''
                const isPending = req.status === 'Pending'

                return (
                  <tr key={req.id}>
                    <td>
                      <strong style={{ color: '#000' }}>{req.id}</strong>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: '#000', fontSize: 15 }}>{req.employeeName}</strong>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{req.employeeId}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`hrms-pill ${req.type.toLowerCase()}`}>
                        <span className="hrms-pill-dot" />
                        {req.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, color: '#000', fontWeight: 500 }}>
                          {req.startDate} to {req.endDate}
                        </span>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{req.days} days duration</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>{req.remarks}</span>
                    </td>
                    <td style={{ minWidth: 180 }}>
                      {isPending ? (
                        <input
                          type="text"
                          placeholder="Optional comment..."
                          value={comment}
                          onChange={(e) => handleCommentChange(req.id, e.target.value)}
                          style={{
                            width: '100%',
                            height: 36,
                            padding: '0 12px',
                            borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.14)',
                            fontSize: 12,
                            outline: 'none',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
                          {req.adminComment || 'No comment added'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`hrms-pill ${req.status.toLowerCase()}`}>
                        <span className="hrms-pill-dot" />
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="cta-primary"
                            style={{ height: 36, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                            onClick={() => handleApproveLeave(req.id, comment || 'Approved by HR Lead')}
                          >
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            className="hrms-btn-coral"
                            style={{ height: 36, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                            onClick={() => handleRejectLeave(req.id, comment || 'Declined per schedule constraints')}
                          >
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
                          Decision Logged
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
