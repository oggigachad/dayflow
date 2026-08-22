import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import AttendanceTracker from './AttendanceTracker.jsx'

export default function AttendanceView() {
  const { currentUser, attendance, employees, activeEmployee } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

  const [filterEmployeeId, setFilterEmployeeId] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Filtered records for Admin vs Employee
  const records = isAdmin
    ? attendance.filter((a) => {
        const matchesEmp = filterEmployeeId === 'All' || a.employeeId === filterEmployeeId
        const matchesStatus = filterStatus === 'All' || a.status.toLowerCase() === filterStatus.toLowerCase()
        return matchesEmp && matchesStatus
      })
    : attendance.filter((a) => a.employeeId === activeEmployee.id)

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Punch Tracker Component on Top */}
      <AttendanceTracker />

      {/* Attendance History Table Card */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {isAdmin ? 'Organization-Wide Attendance Logs' : 'My Personal Attendance Logs'}
            </h3>
            <p className="hrms-card-subtitle">
              {isAdmin
                ? 'Review team clock-ins, daily presence statuses, and filtered audit trails'
                : 'Complete historical logs of your check-in times and total daily hours'}
            </p>
          </div>

          {/* Admin Filters */}
          {isAdmin && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Employee Filter */}
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                style={{
                  height: 40,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Employees</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.id})
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  height: 40,
                  padding: '0 16px',
                  borderRadius: 12,
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  fontSize: 13,
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Statuses</option>
                <option value="present">Present</option>
                <option value="half-day">Half-Day</option>
                <option value="leave">Leave</option>
                <option value="absent">Absent</option>
              </select>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Date</th>
                {isAdmin && <th>Employee</th>}
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <strong style={{ color: '#000' }}>{rec.date}</strong>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ color: '#000' }}>{rec.employeeName}</strong>
                        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>{rec.employeeId}</span>
                      </div>
                    </td>
                  )}
                  <td>{rec.checkIn}</td>
                  <td>{rec.checkOut}</td>
                  <td>
                    <strong>{rec.hours}</strong>
                  </td>
                  <td>
                    <span className={`hrms-pill ${rec.status.toLowerCase()}`}>
                      <span className="hrms-pill-dot" />
                      {rec.status}
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
