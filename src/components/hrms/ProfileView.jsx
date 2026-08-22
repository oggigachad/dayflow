import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import ProfileEdit from './ProfileEdit.jsx'
import ProfileDocuments from './ProfileDocuments.jsx'

export default function ProfileView() {
  const {
    activeEmployee,
    currentUser,
    isEditingProfile,
    setIsEditingProfile,
    selectedEmployeeId,
    setSelectedEmployeeId,
  } = useHRMS()

  const [activeProfileTab, setActiveProfileTab] = useState('overview') // 'overview' | 'documents'
  const isHrAdmin = currentUser.role === 'hr'
  const isViewingOther = selectedEmployeeId && selectedEmployeeId !== currentUser.id
  const isHrSelfProfile = !isViewingOther && activeEmployee.role === 'hr'

  if (isEditingProfile) {
    return <ProfileEdit onCancel={() => setIsEditingProfile(false)} isHrSelf={isHrSelfProfile} />
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Profile Header Card */}
      <div className="hrms-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 24,
                background: activeEmployee.role === 'hr'
                  ? 'linear-gradient(135deg, rgb(253,135,61) 0%, rgb(236,72,153) 100%)'
                  : 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(99,30,200) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(122,50,227,0.25)',
              }}
            >
              {activeEmployee.avatar || (activeEmployee.name || 'U').charAt(0)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color: '#000', margin: 0 }}>
                  {activeEmployee.name}
                </h1>
                <span className={`hrms-pill ${(activeEmployee.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                  <span className="hrms-pill-dot" />
                  {activeEmployee.status || 'Active'}
                </span>
                <span className="hrms-pill pending" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                  {activeEmployee.role === 'hr' ? 'Admin / HR' : 'Employee'}
                </span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.6)', margin: 0 }}>
                {isHrSelfProfile ? (
                  <>HR Administrator · Location: <strong>{activeEmployee.workLocation || 'Headquarters'}</strong> · ID: <strong>{activeEmployee.id}</strong></>
                ) : (
                  <>{activeEmployee.title || 'Staff Member'} · {activeEmployee.department || 'Operations'} · ID: <strong>{activeEmployee.id}</strong></>
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {isViewingOther && (
              <button
                type="button"
                className="cta-secondary"
                style={{ height: 44, padding: '0 18px', fontSize: 13, borderRadius: 14 }}
                onClick={() => setSelectedEmployeeId(null)}
              >
                Back to My Profile
              </button>
            )}
            <button
              type="button"
              className="cta-primary"
              style={{ height: 44, padding: '0 22px', fontSize: 14, borderRadius: 14 }}
              onClick={() => setIsEditingProfile(true)}
            >
              <span className="cta-primary-circle" style={{ width: 22, height: 22 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <span>Edit Profile Details</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation: Overview vs Documents */}
        <div style={{ display: 'flex', gap: 8, marginTop: 24, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 16 }}>
          <button
            type="button"
            className={`auth-role-nav-tab ${activeProfileTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('overview')}
            style={{ width: 'auto', padding: '8px 20px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile Overview</span>
          </button>

          <button
            type="button"
            className={`auth-role-nav-tab ${activeProfileTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('documents')}
            style={{ width: 'auto', padding: '8px 20px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Personnel Documents</span>
          </button>
        </div>
      </div>

      {activeProfileTab === 'documents' ? (
        <ProfileDocuments employee={activeEmployee} isHr={isHrAdmin} />
      ) : isHrSelfProfile ? (
        /* Reduced Field Set for HR/Admin Self Profile */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          <div className="hrms-card" style={{ gap: 18 }}>
            <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Administrator Account Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Full Name</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.name}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Employee ID (Read-only)</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.id}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Email Address</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.email}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Direct Phone</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.phone || '—'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Date of Joining</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.joiningDate || 'Aug 2026'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Work Location</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.workLocation || 'Headquarters'}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Full Expanded Employee Profile Fields */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          {/* Card 1: Personal Details */}
          <div className="hrms-card" style={{ gap: 18 }}>
            <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Employee ID (Read-only)</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.id}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Full Legal Name</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.name}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Corporate Email</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.email}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Phone Number</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.phone || '—'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Date of Birth</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.dob || '14 May 1994'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Gender</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.gender || 'Not Specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Emergency Contact</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.emergencyContact || '—'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Work Location</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.workLocation || 'Headquarters'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Residential Address</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.address || '—'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Employment Details */}
          <div className="hrms-card" style={{ gap: 18 }}>
            <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                Employment Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Date of Joining</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.joiningDate || 'Aug 2026'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Employment Type</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>
                  <span className="hrms-pill present" style={{ padding: '2px 10px', fontSize: 12 }}>
                    {activeEmployee.employmentType || 'Full-time'}
                  </span>
                </p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Department</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.department || 'Operations'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Designation</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.title || 'Staff Member'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Reporting Manager</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.manager || 'HR Operations'}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Employee Status</span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>
                  <span className={`hrms-pill ${(activeEmployee.status || 'Active').toLowerCase().replace(' ', '-')}`}>
                    <span className="hrms-pill-dot" />
                    {activeEmployee.status || 'Active'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
