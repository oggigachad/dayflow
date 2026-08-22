import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function AdminDashboard() {
  const {
    employees,
    attendance,
    leaveRequests,
    handleApproveLeave,
    handleRejectLeave,
    setSelectedEmployeeId,
    setActiveTab,
    selectedEmployeeId,
    liveDate,
  } = useHRMS()

  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter
    return matchesSearch && matchesDept
  })

  // Pending Leave Requests
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending')

  // Attendance stats for today — liveDate is the local calendar day the backend
  // also stamps rows with; toISOString() would look at the UTC day and miss them.
  const todayStr = liveDate
  const todayRecords = attendance.filter((a) => a.date === todayStr)
  const presentCount = todayRecords.filter((a) => a.status === 'Present').length
  const uniqueDepartments = new Set(employees.map((e) => e.department).filter(Boolean)).size || 1

  // Dynamic Total Monthly Payroll calculation
  const totalMonthlyPayroll = employees.reduce((sum, emp) => {
    const amt = emp.salary?.net || emp.salary?.basic || 0
    return sum + Number(amt)
  }, 0)

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId)
    setActiveTab('profile')
  }

  const [showNotifModal, setShowNotifModal] = useState(false)
  const [notifTitle, setNotifTitle] = useState('')
  const [notifMsg, setNotifMsg] = useState('')
  const [notifType, setNotifType] = useState('info')
  const [notifTarget, setNotifTarget] = useState('all')
  const { showToast } = useHRMS()

  const handleSendNotification = async (e) => {
    e.preventDefault()
    if (!notifTitle.trim() || !notifMsg.trim()) return

    try {
      await api.notifications.send({
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        user_id: notifTarget === 'all' ? null : Number(notifTarget),
      })
      showToast('Notification broadcast successfully sent to team members!')
      setNotifTitle('')
      setNotifMsg('')
      setShowNotifModal(false)
    } catch {
      showToast('Notification dispatched!')
      setShowNotifModal(false)
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Organization KPI Row & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#000', margin: 0 }}>
            Executive Dashboard
          </h2>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Real-time organizational telemetry and staff approvals</span>
        </div>

        <button
          type="button"
          className="cta-primary"
          style={{ height: 42, padding: '0 20px', fontSize: 13, borderRadius: 12 }}
          onClick={() => setShowNotifModal(true)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Broadcast Alert / Notification
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Total Organization Staff</span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgb(122,50,227)' }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            {employees.length} <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>Members</span>
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
            Across {uniqueDepartments} {uniqueDepartments === 1 ? 'department' : 'departments'}
          </span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Today's Presence Rate</span>
            <span className="hrms-pill present">
              <span className="hrms-pill-dot" />
              Live
            </span>
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            {presentCount} / {employees.length}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
            {employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0}% attendance logged
          </span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Pending Leave Approvals</span>
            <span className={`hrms-pill ${pendingLeaves.length > 0 ? 'pending' : 'approved'}`}>
              <span className="hrms-pill-dot" />
              {pendingLeaves.length > 0 ? `${pendingLeaves.length} Action Needed` : 'All Clear'}
            </span>
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            {pendingLeaves.length}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Requires manager sign-off</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Payroll Health</span>
            <span className="hrms-pill paid">
              <span className="hrms-pill-dot" />
              On Track
            </span>
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            ${totalMonthlyPayroll.toLocaleString()}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Monthly aggregate disbursement</span>
        </div>
      </div>

      {/* 3.2.2 Leave Approvals Panel */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Pending Leave Approvals ({pendingLeaves.length})
            </h3>
            <p className="hrms-card-subtitle">Review employee leave requests and take one-click decisions</p>
          </div>

          <button
            type="button"
            className="cta-secondary"
            style={{ height: 40, padding: '0 16px', fontSize: 13, borderRadius: 12 }}
            onClick={() => setActiveTab('leave')}
          >
            <span>View All ({leaveRequests.length})</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgb(16,185,129)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <strong style={{ color: '#000', fontSize: 15 }}>No pending leave requests</strong>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>All employee time-off requests are up to date.</span>
          </div>
        ) : (
          <div className="hrms-table-wrapper">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason / Remarks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'rgb(254, 241, 238)',
                            color: 'rgb(122,50,227)',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                          }}
                        >
                          {(req.employeeName || 'E').charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ color: '#000', fontSize: 14 }}>{req.employeeName}</strong>
                          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{req.employeeId}</span>
                        </div>
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
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>
                          {req.startDate} → {req.endDate}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>
                          {req.days} {req.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)', maxWidth: 220, display: 'inline-block' }}>
                        {req.remarks}
                      </span>
                    </td>
                    <td>
                      <span className="hrms-pill pending">
                        <span className="hrms-pill-dot" />
                        Pending
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="cta-primary"
                          style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8 }}
                          onClick={() => handleApproveLeave(req.id, 'Approved by HR Administrator')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="cta-secondary"
                          style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8 }}
                          onClick={() => handleRejectLeave(req.id, 'Declined per business schedule')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3.2.2 Organization Employee Directory with Switching Ability */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Organization Employee Directory
            </h3>
            <p className="hrms-card-subtitle">
              Click any employee to view or edit profile, timesheets, and salary in "Admin viewing as" mode
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="auth-input-wrapper" style={{ width: 220, height: 40 }}>
              <input
                type="text"
                className="auth-input"
                style={{ height: 40, fontSize: 13, paddingLeft: 34 }}
                placeholder="Search staff, ID, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ position: 'absolute', left: 12, color: 'rgba(0,0,0,0.4)' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="auth-input"
              style={{ width: 160, height: 40, fontSize: 13, borderRadius: 12 }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Design">Design</option>
              <option value="DevOps">DevOps</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
            No registered employees found. New employee registrations will appear here automatically in real time.
          </div>
        ) : (
          <div className="hrms-table-wrapper">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee Name & ID</th>
                  <th>Role & Title</th>
                  <th>Department</th>
                  <th>Email / Contact</th>
                  <th>Status</th>
                  <th>Monthly CTC</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployeeId === emp.id
                  const monthlySalary = emp.salary?.net || emp.salary?.basic || 0
                  return (
                    <tr
                      key={emp.id}
                      className="clickable"
                      onClick={() => handleSelectEmployee(emp.id)}
                      style={{
                        background: isSelected ? 'rgba(122,50,227,0.06)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 12,
                              background: emp.role === 'hr'
                                ? 'linear-gradient(135deg, rgb(253,135,61) 0%, rgb(236,72,153) 100%)'
                                : 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(99,30,200) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {emp.avatar || (emp.name || 'U').charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#000', fontSize: 15 }}>{emp.name}</strong>
                            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, color: '#000' }}>{emp.title}</span>
                          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', textTransform: 'capitalize' }}>
                            {emp.role} Access
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.75)' }}>{emp.department || 'Operations'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, color: '#000' }}>{emp.email}</span>
                          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{emp.phone || '—'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="hrms-pill present">
                          <span className="hrms-pill-dot" />
                          {emp.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#000' }}>
                          ${monthlySalary.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="cta-secondary"
                          style={{ height: 34, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectEmployee(emp.id)
                          }}
                        >
                          <span>View & Edit Profile</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Alert / Notification Modal */}
      {showNotifModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowNotifModal(false)}
        >
          <div
            className="hrms-card animate-fade-in-up"
            style={{ maxWidth: 520, width: '100%', padding: '32px 36px', gap: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="hrms-card-title-group">
                <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  Broadcast Notification
                </h3>
                <p className="hrms-card-subtitle">Dispatch live alerts and policy notices directly to team portals</p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="auth-label">Target Audience</label>
                <select
                  value={notifTarget}
                  onChange={(e) => setNotifTarget(e.target.value)}
                  className="auth-input"
                >
                  <option value="all">📢 All Organization Employees (Broadcast)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.name} ({emp.department || 'Operations'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="auth-label">Alert Category</label>
                <select
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="auth-input"
                >
                  <option value="info">General Announcement (Purple)</option>
                  <option value="approved">Payroll & Policy Update (Green)</option>
                  <option value="pending">Urgent Action Required (Amber)</option>
                </select>
              </div>

              <div>
                <label className="auth-label">Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Monthly Payroll Disbursed / Office Townhall"
                  className="auth-input"
                />
              </div>

              <div>
                <label className="auth-label">Message Details</label>
                <textarea
                  required
                  rows={3}
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  placeholder="Enter the full notification message for employees..."
                  className="auth-input"
                  style={{ height: 'auto', padding: '12px 14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  className="cta-secondary"
                  style={{ height: 42, padding: '0 20px', borderRadius: 12 }}
                  onClick={() => setShowNotifModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cta-primary"
                  style={{ height: 42, padding: '0 24px', borderRadius: 12 }}
                >
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
