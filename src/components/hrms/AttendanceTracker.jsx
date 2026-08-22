import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function AttendanceTracker() {
  const {
    activeEmployee,
    attendance,
    liveDate,
    liveTime,
    liveTimeWithSeconds,
    liveDateFormatted,
    handleCheckIn,
    handleCheckOut,
  } = useHRMS()

  const [viewMode, setViewMode] = useState('daily') // 'daily' | 'weekly'
  const todayStr = liveDate

  const todayRecord = attendance.find(
    (a) => a.employeeId === activeEmployee.id && a.date === todayStr
  )
  const isCheckedIn = todayRecord && todayRecord.checkIn !== '--:--'
  const isCheckedOut = todayRecord && todayRecord.checkOut !== '--:--'

  // Weekly sample logs for the active employee
  const employeeHistory = attendance.filter((a) => a.employeeId === activeEmployee.id)

  // Current week Mon–Fri, built from the real attendance rows. This grid used to
  // be a hardcoded Aug 18–22 sample that never moved.
  const weekDays = (() => {
    const [y, m, d] = todayStr.split('-').map(Number)
    const monday = new Date(y, m - 1, d)
    // getDay() is 0 for Sunday, which belongs to the *previous* Monday.
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

    return Array.from({ length: 5 }, (_, i) => {
      const cursor = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
      const rec = employeeHistory.find((a) => a.date === iso)
      const isFuture = iso > todayStr

      return {
        day: cursor.toLocaleDateString('en-US', { weekday: 'long' }),
        date: cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: rec ? (rec.checkOut !== '--:--' ? rec.hours : 'Active') : isFuture ? '—' : '0 hrs',
        status: rec ? rec.status.toLowerCase() : isFuture ? 'pending' : 'absent',
      }
    })
  })()

  return (
    <div className="hrms-card animate-fade-in-up">
      {/* Top Header with Segmented Toggle (Daily / Weekly) */}
      <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="hrms-card-title-group">
          <h2 className="hrms-card-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Attendance Tracker & Timesheets
          </h2>
          <p className="hrms-card-subtitle">Real-time daily punch-in, punch-out, and weekly hours tally</p>
        </div>

        {/* Segmented Switch (Daily vs Weekly) */}
        <div
          style={{
            display: 'flex',
            background: 'rgb(254, 241, 238)',
            padding: 4,
            borderRadius: 14,
            border: '1px solid rgba(0,0,0,0.06)',
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: viewMode === 'daily' ? '#fff' : 'transparent',
              color: viewMode === 'daily' ? 'rgb(115, 34, 237)' : 'rgba(0,0,0,0.6)',
              boxShadow: viewMode === 'daily' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Daily View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: viewMode === 'weekly' ? '#fff' : 'transparent',
              color: viewMode === 'weekly' ? 'rgb(115, 34, 237)' : 'rgba(0,0,0,0.6)',
              boxShadow: viewMode === 'weekly' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Weekly Summary
          </button>
        </div>
      </div>

      {/* Main Check-In Widget Panel */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(122,50,227,0.06) 0%, rgba(253,135,61,0.06) 100%)',
          border: '1.5px solid rgba(122,50,227,0.15)',
          borderRadius: 22,
          padding: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgb(122,50,227)' }}>
              Current Shift · {liveDateFormatted} ({liveDate})
            </span>
            <span className={`hrms-pill ${isCheckedIn ? 'present' : 'absent'}`}>
              <span className="hrms-pill-dot" />
              {isCheckedIn ? (isCheckedOut ? 'Shift Completed' : 'Clocked In (Active)') : 'Not Clocked In'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', color: '#000', fontFamily: 'monospace' }}>
              {liveTimeWithSeconds || liveTime}
            </span>
            <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
              {isCheckedIn
                ? `Logged in at ${todayRecord?.checkIn} ${isCheckedOut ? `· Logged out at ${todayRecord?.checkOut}` : ''}`
                : 'Standard workday shift 09:00 AM – 06:00 PM'}
            </span>
          </div>
        </div>

        {/* Primary CTA Check-In / Check-Out */}
        <div>
          {!isCheckedIn ? (
            <div className="cta-primary-wrapper">
              <div className="cta-primary-border"><div className="cta-primary-border-inner" /></div>
              <div className="cta-primary-bg" />
              <button
                type="button"
                className="cta-primary"
                style={{ height: 54, padding: '0 32px', fontSize: 16, borderRadius: 16 }}
                onClick={handleCheckIn}
              >
                <span>Check In for Shift</span>
                <span className="cta-primary-circle" style={{ width: 26, height: 26 }}>
                  <svg viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          ) : !isCheckedOut ? (
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 54, padding: '0 32px', fontSize: 16, borderRadius: 16, background: '#fff', borderColor: 'rgba(122,50,227,0.3)' }}
              onClick={handleCheckOut}
            >
              <span>Clock Out (End Shift)</span>
            </button>
          ) : (
            <div
              style={{
                padding: '12px 24px',
                background: '#fff',
                borderRadius: 16,
                border: '1px solid rgba(16,185,129,0.3)',
                color: 'rgb(5,150,105)',
                fontWeight: 600,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Day Complete · {todayRecord?.hours || '0 hrs'} Logged</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily / Weekly View Mode Content */}
      {viewMode === 'daily' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>Recent Daily Punches</h3>
          <div className="hrms-table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employeeHistory.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <strong style={{ color: '#000' }}>{rec.date}</strong>
                    </td>
                    <td>{rec.checkIn}</td>
                    <td>{rec.checkOut}</td>
                    <td>{rec.hours}</td>
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
      ) : (
        /* Weekly Summary View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>Weekly Timesheet Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
            {weekDays.map((d, i) => (
              <div
                key={i}
                style={{
                  background: '#fafafa',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.5)' }}>{d.day}</span>
                <strong style={{ fontSize: 14, color: '#000' }}>{d.date}</strong>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'rgb(115,34,237)' }}>{d.hours}</span>
                <span className={`hrms-pill ${d.status}`} style={{ margin: '0 auto' }}>
                  <span className="hrms-pill-dot" />
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
