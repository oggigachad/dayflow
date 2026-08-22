import React from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function EmployeeDashboard() {
  const {
    currentUser,
    activeEmployee,
    setActiveTab,
    attendance,
    leaveRequests,
    notifications,
    liveDate,
    liveTime,
    liveTimeWithSeconds,
    liveDateFormatted,
    handleCheckIn,
    handleCheckOut,
    onClosePortal,
  } = useHRMS()

  const todayStr = liveDate
  const todayRecord = attendance.find(
    (a) => (a.employeeId === activeEmployee.id || a.employeeId === activeEmployee.employeeId) && a.date === todayStr
  )
  const isCheckedInToday = todayRecord && todayRecord.checkIn && todayRecord.checkIn !== '--:--'
  const isCheckedOutToday = todayRecord && todayRecord.checkOut && todayRecord.checkOut !== '--:--'

  // User's own leave calculations
  const myLeaves = leaveRequests.filter(
    (l) => l.employeeId === activeEmployee.id || l.employeeId === activeEmployee.employeeId
  )
  const approvedLeavesCount = myLeaves
    .filter((l) => l.status === 'Approved')
    .reduce((acc, l) => acc + (l.days || 1), 0)

  const presentDaysCount = attendance.filter((a) => a.status === 'Present').length

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner Card */}
      <div className="hrms-card" style={{ padding: '36px 40px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(236,72,153) 50%, rgb(253,135,61) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 24,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(122,50,227,0.25)',
              }}
            >
              {activeEmployee.avatar || (activeEmployee.name || 'U').charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', color: '#000', margin: 0 }}>
                  Welcome, {activeEmployee.name || currentUser.name || 'Team Member'}
                </h1>
                <span className="hrms-pill present">
                  <span className="hrms-pill-dot" />
                  {activeEmployee.status || 'Active'}
                </span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.6)', margin: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span>{activeEmployee.title || 'Staff Member'}</span>
                <span>·</span>
                <span>{activeEmployee.department || 'Operations'}</span>
                {(activeEmployee.id || currentUser.id || currentUser.employeeId) && (
                  <>
                    <span>·</span>
                    <span>
                      ID: <strong style={{ color: '#000' }}>{activeEmployee.id || currentUser.id || currentUser.employeeId}</strong>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick Check-in / Out Widget */}
          <div
            style={{
              background: 'rgb(254, 241, 238)',
              padding: '16px 24px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              border: '1px solid rgba(122,50,227,0.12)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Attendance
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#000' }}>
                {isCheckedInToday ? `Checked in: ${todayRecord.checkIn}` : 'Not Checked In Yet'}
              </span>
            </div>

            {!isCheckedInToday ? (
              <button
                type="button"
                className="cta-primary"
                style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 14 }}
                onClick={handleCheckIn}
              >
                <span>Check In</span>
              </button>
            ) : !isCheckedOutToday ? (
              <button
                type="button"
                className="cta-secondary"
                style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 14, background: '#fff' }}
                onClick={handleCheckOut}
              >
                <span>Check Out</span>
              </button>
            ) : (
              <span className="hrms-pill approved" style={{ height: 36, padding: '0 14px' }}>
                Completed ({todayRecord.checkOut})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3.2.1 Quick-access Cards */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em' }}>
            Quick Access Tools
          </h2>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)' }}>Direct Workspace Navigation</span>
        </div>

        <div className="hrms-quick-cards-grid">
          {/* Profile Card */}
          <div className="hrms-quick-card" onClick={() => setActiveTab('profile')}>
            <div className="hrms-quick-card-icon">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="hrms-quick-card-info">
              <span className="hrms-quick-card-label">My Profile</span>
              <span className="hrms-quick-card-desc">Personal details, job role & docs</span>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="hrms-quick-card" onClick={() => setActiveTab('attendance')}>
            <div className="hrms-quick-card-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="hrms-quick-card-info">
              <span className="hrms-quick-card-label">Attendance</span>
              <span className="hrms-quick-card-desc">Daily check-in & weekly timesheets</span>
            </div>
          </div>

          {/* Leave Requests Card */}
          <div className="hrms-quick-card" onClick={() => setActiveTab('leave')}>
            <div className="hrms-quick-card-icon">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="hrms-quick-card-info">
              <span className="hrms-quick-card-label">Leave Requests</span>
              <span className="hrms-quick-card-desc">Apply for time-off & view status</span>
            </div>
          </div>

          {/* Payroll Card */}
          <div className="hrms-quick-card" onClick={() => setActiveTab('payroll')}>
            <div className="hrms-quick-card-icon">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="6" y1="8" x2="12" y2="8" />
                <line x1="6" y1="16" x2="10" y2="16" />
              </svg>
            </div>
            <div className="hrms-quick-card-info">
              <span className="hrms-quick-card-label">Salary & Payslips</span>
              <span className="hrms-quick-card-desc">Salary structure & monthly slips</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>This Month's Attendance</span>
            <span className="hrms-pill present">Live</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>
            {presentDaysCount} Logged
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Verified via real-time attendance logs</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Available Paid Leave</span>
            <span className="hrms-pill pending">{Math.max(0, 12 - approvedLeavesCount)} Days Left</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>
            {Math.max(0, 12 - approvedLeavesCount)} <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>/ 12 Total</span>
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>{approvedLeavesCount} Days Taken</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Net Monthly Payout</span>
            <span className="hrms-pill paid">On File</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#000' }}>
            ${(activeEmployee.salary?.net || activeEmployee.salary?.basic || 0).toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Direct from payroll structure</span>
        </div>
      </div>

      {/* 3.2.1 Recent Activity / Alerts Panel */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Recent Activity & Alerts
            </h3>
            <p className="hrms-card-subtitle">Real-time status updates across attendance, approvals, and payroll</p>
          </div>

          <button
            type="button"
            className="cta-secondary"
            style={{ height: 40, padding: '0 16px', fontSize: 13, borderRadius: 12 }}
            onClick={() => setActiveTab('leave')}
          >
            View Leave History
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
              No recent notifications. Real-time check-ins and leave approval status changes will appear here.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'rgb(254, 241, 238)',
                  borderRadius: 16,
                  gap: 16,
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background:
                        item.type === 'approved' || item.type === 'present'
                          ? 'rgb(16,185,129)'
                          : item.type === 'pending'
                          ? 'rgb(122,50,227)'
                          : 'rgb(253,135,61)',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <strong style={{ color: '#000', fontSize: 14 }}>{item.title}</strong>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>{item.desc}</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', fontWeight: 500 }}>{item.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
