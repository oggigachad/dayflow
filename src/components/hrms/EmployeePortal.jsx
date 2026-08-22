import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import EmployeeDashboard from './EmployeeDashboard.jsx'
import ProfileView from './ProfileView.jsx'
import AttendanceView from './AttendanceView.jsx'
import LeaveApprovals from './LeaveApprovals.jsx'
import PayrollView from './PayrollView.jsx'

export default function EmployeePortal() {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    toastMessage,
    liveDateFormatted,
    liveTime,
    handleLogout,
  } = useHRMS()

  const tabs = [
    {
      id: 'dashboard',
      label: 'My Workspace',
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
      label: 'My Profile',
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'attendance',
      label: 'My Attendance',
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'leave',
      label: 'Leave & Time-Off',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: 'payroll',
      label: 'Salary & Payslips',
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="6" y1="8" x2="12" y2="8" />
          <line x1="6" y1="16" x2="10" y2="16" />
        </svg>
      ),
    },
  ]

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EmployeeDashboard />
      case 'profile':
        return <ProfileView />
      case 'attendance':
        return <AttendanceView />
      case 'leave':
        return <LeaveApprovals />
      case 'payroll':
        return <PayrollView />
      default:
        return <EmployeeDashboard />
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

      {/* ===== EMPLOYEE SIDEBAR ===== */}
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
                Employee Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hrms-sidebar-menu">
          <div className="hrms-sidebar-section-title">
            <span>Workspace Navigation</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`hrms-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="hrms-sidebar-item-icon">{tab.icon}</span>
                  <span className="hrms-sidebar-item-label">{tab.label}</span>
                  {isActive && <span className="hrms-sidebar-active-dot" />}
                </button>
              )
            })}
          </div>
        </nav>

        {/* User Badge & Logout in Sidebar Footer */}
        <div className="hrms-sidebar-footer">
          <div className="hrms-sidebar-user">
            <div
              className="hrms-user-avatar"
              style={{
                background: 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(99,30,200) 100%)',
              }}
            >
              {currentUser.avatar || currentUser.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 13, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.name}
              </strong>
              <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.5)' }}>
                {currentUser.id} · <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'rgb(122,50,227)' }}>Employee</span>
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
              {tabs.find((t) => t.id === activeTab)?.label || 'Workspace'}
            </h2>
            <span className="hero-eyebrow" style={{ padding: '4px 12px', fontSize: 11 }}>
              Employee Self-Service
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
          </div>
        </header>

        {/* Container for the Active Module */}
        <main className="hrms-dashboard-body">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  )
}
