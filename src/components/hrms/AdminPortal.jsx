import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import EmployeeDashboard from './EmployeeDashboard.jsx'
import ProfileView from './ProfileView.jsx'
import AttendanceView from './AttendanceView.jsx'
import LeaveApprovals from './LeaveApprovals.jsx'
import PayrollAdmin from './PayrollAdmin.jsx'
import HRCalendar from './HRCalendar.jsx'

export default function AdminPortal() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    selectedEmployeeId,
    setSelectedEmployeeId,
    employees,
    activeEmployee,
    toastMessage,
    liveDateFormatted,
    liveTime,
    handleLogout,
  } = useHRMS()

  const [previewAsEmployee, setPreviewAsEmployee] = useState(false)
  const isViewingOther = selectedEmployeeId && selectedEmployeeId !== currentUser.id

  const tabs = [
    {
      id: 'dashboard',
      label: 'Admin Overview',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: isViewingOther ? `Staff: ${activeEmployee.name.split(' ')[0]}` : 'Employee Directory',
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar & Trends',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'attendance',
      label: 'Attendance Records',
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'leave',
      label: 'Leave Approvals',
      icon: (
        <svg viewBox="0 0 24 24">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      id: 'payroll',
      label: 'Payroll Management',
      icon: (
        <svg viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ]

  const renderActiveModule = () => {
    if (previewAsEmployee) {
      return <EmployeeDashboard />
    }

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'profile':
        return <ProfileView />
      case 'calendar':
        return <HRCalendar />
      case 'attendance':
        return <AttendanceView />
      case 'leave':
        return <LeaveApprovals />
      case 'payroll':
        return <PayrollAdmin />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="hrms-dashboard-layout">
      {/* Toast Confirmation Notification */}
      {toastMessage && (
        <div className="hrms-toast-notification">
          <div className="hrms-toast-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ===== ADMIN SIDEBAR ===== */}
      <aside className="hrms-side-nav">
        {/* Header Brand */}
        <div className="hrms-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.svg"
              alt="HRMS Logo"
              className="navbar-logo-transparent"
              style={{
                width: 40,
                height: 40,
                objectFit: 'contain',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
              }}
            />
            <div>
              <span className="navbar-brand hrms-brand-animated" style={{ fontSize: 20, fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
                HRMS
              </span>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                Admin / HR Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hrms-sidebar-menu">
          <div className="hrms-sidebar-section-title">
            <span>Management Modules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id && !previewAsEmployee
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`hrms-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setPreviewAsEmployee(false)
                    setActiveTab(tab.id)
                  }}
                >
                  <span className="hrms-sidebar-item-icon">{tab.icon}</span>
                  <span className="hrms-sidebar-item-label">{tab.label}</span>
                  {isActive && <span className="hrms-sidebar-active-dot" />}
                </button>
              )
            })}
          </div>

          {/* Admin "View as Employee" Preview Tool */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="hrms-sidebar-section-title" style={{ padding: '0 12px 8px' }}>
              <span>Preview Mode</span>
            </div>
            <button
              type="button"
              className={`hrms-sidebar-item ${previewAsEmployee ? 'active' : ''}`}
              onClick={() => setPreviewAsEmployee(!previewAsEmployee)}
              style={{
                background: previewAsEmployee
                  ? 'linear-gradient(135deg, rgba(253,135,61,0.14) 0%, rgba(122,50,227,0.08) 100%)'
                  : 'rgba(0,0,0,0.02)',
                border: previewAsEmployee ? '1px solid rgba(253,135,61,0.3)' : '1px solid rgba(0,0,0,0.04)',
              }}
            >
              <span className="hrms-sidebar-item-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span className="hrms-sidebar-item-label">
                {previewAsEmployee ? 'Viewing as Employee' : 'View as Employee'}
              </span>
              {previewAsEmployee && <span className="hrms-sidebar-active-dot" style={{ background: 'rgb(253,135,61)' }} />}
            </button>
          </div>
        </nav>

        {/* User Badge & Logout in Sidebar Footer */}
        <div className="hrms-sidebar-footer">
          <div className="hrms-sidebar-user">
            <div
              className="hrms-user-avatar"
              style={{
                background: 'linear-gradient(135deg, rgb(253,135,61) 0%, rgb(236,72,153) 100%)',
              }}
            >
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 13, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </strong>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>
                {currentUser.id} · <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'rgb(253,135,61)' }}>Admin / HR</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="hrms-sidebar-logout-btn"
            onClick={handleLogout}
            title="Log out and return to Sign In"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN DASHBOARD CONTENT AREA ===== */}
      <div className="hrms-main-wrapper">
        {/* Sticky Header (No Exit to Home) */}
        <header className="hrms-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', color: '#000', margin: 0 }}>
              {previewAsEmployee ? 'Employee Experience Preview' : tabs.find((t) => t.id === activeTab)?.label || 'Overview'}
            </h2>
            <span
              className="hero-eyebrow"
              style={{
                padding: '4px 12px',
                fontSize: 11,
                background: previewAsEmployee ? 'rgba(253,135,61,0.1)' : 'rgba(122,50,227,0.08)',
                color: previewAsEmployee ? 'rgb(253,135,61)' : 'rgb(122,50,227)',
                borderColor: previewAsEmployee ? 'rgba(253,135,61,0.2)' : 'rgba(122,50,227,0.15)',
              }}
            >
              {previewAsEmployee ? 'Admin: Employee Preview' : 'Admin Authority Mode'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="hrms-header-date-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{liveDateFormatted} · {liveTime}</span>
            </div>

            {previewAsEmployee && (
              <button
                type="button"
                className="cta-secondary"
                style={{ height: 36, padding: '0 14px', fontSize: 12, borderRadius: 10, background: '#fff' }}
                onClick={() => setPreviewAsEmployee(false)}
              >
                Exit Preview
              </button>
            )}
          </div>
        </header>

        {/* Container for the Active Module */}
        <main className="hrms-dashboard-body">
          {/* Admin Viewing As Banner */}
          {!previewAsEmployee && isViewingOther && (
            <div className="hrms-viewing-as-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div>
                  <strong style={{ color: '#000', fontSize: 15 }}>
                    Admin Mode: Viewing Profile & Timesheets for {activeEmployee.name} ({activeEmployee.id})
                  </strong>
                  <span style={{ display: 'block', fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>
                    You have full privileges to edit profile parameters, inspect timesheets, and configure compensation.
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="cta-secondary"
                style={{ height: 38, padding: '0 16px', fontSize: 12, borderRadius: 12, background: '#fff' }}
                onClick={() => {
                  setSelectedEmployeeId(null)
                  setActiveTab('dashboard')
                }}
              >
                Reset to Admin Overview
              </button>
            </div>
          )}

          {renderActiveModule()}
        </main>
      </div>
    </div>
  )
}
