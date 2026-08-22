import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import HRTrends from './HRTrends.jsx'

export default function HRCalendar() {
  const { employees, attendance, leaveRequests, liveDate } = useHRMS()

  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const todayStr = liveDate

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDay(null)
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDay(null)
  }

  const handleSelectDay = (day) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDay(formatted)
  }

  // Get date summary for any day in this month
  const getDaySummary = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const dayAttendance = attendance.filter((a) => a.date === dateStr)
    const present = dayAttendance.filter((a) => a.status === 'Present').length
    const halfDay = dayAttendance.filter((a) => a.status === 'Half-Day' || a.status === 'half_day').length
    const onLeave = leaveRequests.filter((l) => {
      return l.status === 'Approved' && dateStr >= l.startDate && dateStr <= l.endDate
    }).length

    return {
      dateStr,
      present,
      halfDay,
      onLeave,
      totalLogs: dayAttendance.length,
    }
  }

  // Build employee list for selected day
  const getSelectedDayEmployees = () => {
    if (!selectedDay) return []

    return employees.map((emp) => {
      const attRecord = attendance.find(
        (a) => (a.employeeId === emp.id || a.employeeId === emp.employeeId) && a.date === selectedDay
      )
      const leaveRecord = leaveRequests.find(
        (l) =>
          (l.employeeId === emp.id || l.employeeId === emp.employeeId) &&
          l.status === 'Approved' &&
          selectedDay >= l.startDate &&
          selectedDay <= l.endDate
      )

      let status = 'Absent'
      let checkIn = '--:--'
      let checkOut = '--:--'

      if (leaveRecord) {
        status = 'Leave'
      } else if (attRecord) {
        status = attRecord.status || 'Present'
        checkIn = attRecord.checkIn || '--:--'
        checkOut = attRecord.checkOut || '--:--'
      }

      return {
        ...emp,
        dayStatus: status,
        checkIn,
        checkOut,
        leaveRemarks: leaveRecord?.remarks || '',
      }
    }).filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDept = deptFilter === 'All' || emp.department === deptFilter
      return matchesSearch && matchesDept
    })
  }

  const selectedDayList = getSelectedDayEmployees()

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 1. HR Trends Summary Bar */}
      <HRTrends />

      {/* 2. Calendar Month View Card */}
      <div className="hrms-card">
        {/* Calendar Header with Navigation */}
        <div className="hrms-card-header" style={{ paddingBottom: 18, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="hrms-card-title-group">
            <h2 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Attendance & Leave Activity Calendar
            </h2>
            <p className="hrms-card-subtitle">
              Daily organization presence trends. Click any date to view complete employee status breakdown.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 38, padding: '0 14px', borderRadius: 10 }}
              onClick={handlePrevMonth}
            >
              ◀ Prev
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, minWidth: 140, textAlign: 'center', color: '#000' }}>
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 38, padding: '0 14px', borderRadius: 10 }}
              onClick={handleNextMonth}
            >
              Next ▶
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', margin: '14px 0 6px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} style={{ fontSize: 12, fontWeight: 700, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {/* Leading Empty Cells */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ minHeight: 90, background: 'rgba(0,0,0,0.01)', borderRadius: 12 }} />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const summary = getDaySummary(dayNum)
            const isToday = summary.dateStr === todayStr
            const isSelected = summary.dateStr === selectedDay

            return (
              <div
                key={dayNum}
                onClick={() => handleSelectDay(dayNum)}
                style={{
                  minHeight: 90,
                  padding: '8px 10px',
                  borderRadius: 14,
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid rgb(122,50,227)'
                    : isToday
                    ? '2px solid rgb(253,135,61)'
                    : '1px solid rgba(0,0,0,0.06)',
                  background: isSelected
                    ? 'rgba(122,50,227,0.08)'
                    : isToday
                    ? 'rgba(253,135,61,0.06)'
                    : 'rgb(254, 241, 238)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: isToday || isSelected ? 700 : 600, color: isToday ? 'rgb(234,88,12)' : '#000' }}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgb(234,88,12)', textTransform: 'uppercase' }}>
                      Today
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  {summary.present > 0 && (
                    <span className="hrms-pill present" style={{ fontSize: 11, padding: '1px 6px', justifyContent: 'center' }}>
                      {summary.present} Present
                    </span>
                  )}
                  {summary.onLeave > 0 && (
                    <span className="hrms-pill pending" style={{ fontSize: 11, padding: '1px 6px', justifyContent: 'center' }}>
                      {summary.onLeave} Leave
                    </span>
                  )}
                  {summary.present === 0 && summary.onLeave === 0 && (
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                      —
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Date Detail Side Panel / Modal when a date is clicked */}
      {selectedDay && (
        <div className="hrms-card animate-fade-in-up" style={{ gap: 20 }}>
          <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="hrms-card-title-group">
              <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Employee Status Breakdown: {selectedDay}
              </h3>
              <p className="hrms-card-subtitle">
                Complete daily roster of presence, check-in timestamps, and active leaves
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div className="auth-input-wrapper" style={{ width: 220, height: 38 }}>
                <input
                  type="text"
                  className="auth-input"
                  style={{ height: 38, fontSize: 13, paddingLeft: 34 }}
                  placeholder="Filter staff by name/ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  width="14"
                  height="14"
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
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="auth-input"
                style={{ width: 150, height: 38, fontSize: 13, borderRadius: 10 }}
              >
                <option value="All">All Depts</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
              </select>

              <button
                type="button"
                className="cta-secondary"
                style={{ height: 38, padding: '0 14px', borderRadius: 10 }}
                onClick={() => setSelectedDay(null)}
              >
                Close Detail
              </button>
            </div>
          </div>

          {selectedDayList.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
              No staff records matching your filter for {selectedDay}.
            </div>
          ) : (
            <div className="hrms-table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee Name & ID</th>
                    <th>Department & Title</th>
                    <th>Attendance Status</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayList.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: emp.role === 'hr'
                                ? 'linear-gradient(135deg, rgb(253,135,61) 0%, rgb(236,72,153) 100%)'
                                : 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(99,30,200) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {emp.avatar || (emp.name || 'U').charAt(0)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: '#000', fontSize: 14 }}>{emp.name}</strong>
                            <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>{emp.title || 'Staff Member'}</span>
                          <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{emp.department || 'Operations'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`hrms-pill ${emp.dayStatus.toLowerCase()}`}>
                          <span className="hrms-pill-dot" />
                          {emp.dayStatus}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>{emp.checkIn}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#000' }}>{emp.checkOut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
