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
  } = useHRMS()

  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter
    return matchesSearch && matchesDept
  })

  // Pending Leave Requests
  const pendingLeaves = leaveRequests.filter((l) => l.status === 'Pending')

  // Attendance stats for today
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRecords = attendance.filter((a) => a.date === todayStr)
  const presentCount = todayRecords.filter((a) => a.status === 'Present').length

  const handleSelectEmployee = (empId) => {
    setSelectedEmployeeId(empId)
    setActiveTab('profile')
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Organization KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Total Organization Staff</span>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgb(122,50,227)' }} />
          </div>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            {employees.length} <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(0,0,0,0.5)' }}>Members</span>
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Across 4 core departments</span>
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
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>{Math.round((presentCount / employees.length) * 100)}% attendance logged</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>Pending Leave Approvals</span>
            <span className="hrms-pill pending">
              <span className="hrms-pill-dot" />
              {pendingLeaves.length} Action Needed
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
            $42,000
          </span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>Monthly aggregate disbursement</span>
        </div>
      </div>

      {/* 3.2.2 Leave Approvals Panel (Pending requests surfaced prominently) */}
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
            Manage All Requests
          </button>
        </div>

        {pendingLeaves.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.5)', background: 'rgb(254, 241, 238)', borderRadius: 16 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 8px', opacity: 0.6 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p style={{ fontWeight: 500 }}>All leave requests have been reviewed.</p>
          </div>
        ) : (
          <div className="hrms-table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Date Range</th>
                  <th>Days</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: '#000' }}>{req.employeeName}</strong>
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
                      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.75)' }}>
                        {req.startDate} to {req.endDate}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#000' }}>{req.days} days</strong>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>{req.remarks}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="cta-primary"
                          style={{ height: 36, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                          onClick={() => handleApproveLeave(req.id, 'Approved by HR Lead')}
                        >
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          className="hrms-btn-coral"
                          style={{ height: 36, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                          onClick={() => handleRejectLeave(req.id, 'Declined due to coverage constraints')}
                        >
                          <span>Reject</span>
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

      {/* 3.2.2 Employee Directory & Switcher Table */}
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search staff, ID, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: 42,
                  padding: '0 16px 0 36px',
                  borderRadius: 14,
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="2"
                style={{ position: 'absolute', left: 12, top: 13 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                height: 42,
                padding: '0 16px',
                borderRadius: 14,
                border: '1.5px solid rgba(0,0,0,0.12)',
                fontSize: 14,
                outline: 'none',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>
        </div>

        <div className="hrms-table-container">
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
                          {emp.avatar}
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
                      <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.75)' }}>{emp.department}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 13, color: '#000' }}>{emp.email}</span>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{emp.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="hrms-pill present">
                        <span className="hrms-pill-dot" />
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#000' }}>
                        ${emp.salary?.net?.toLocaleString() || '8,000'}
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
                        View & Edit Profile →
                      </button>
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
