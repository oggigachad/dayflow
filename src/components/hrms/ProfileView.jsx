import React from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import ProfileEdit from './ProfileEdit.jsx'

export default function ProfileView() {
  const {
    activeEmployee,
    currentUser,
    isEditingProfile,
    setIsEditingProfile,
    selectedEmployeeId,
    setSelectedEmployeeId,
  } = useHRMS()

  const isAdmin = currentUser.role === 'hr'
  const isViewingOther = selectedEmployeeId && selectedEmployeeId !== currentUser.id

  if (isEditingProfile) {
    return <ProfileEdit onCancel={() => setIsEditingProfile(false)} />
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
              {activeEmployee.avatar || activeEmployee.name.charAt(0)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em', color: '#000' }}>
                  {activeEmployee.name}
                </h1>
                <span className="hrms-pill present">
                  <span className="hrms-pill-dot" />
                  {activeEmployee.status}
                </span>
                <span className="hrms-pill pending" style={{ textTransform: 'uppercase', fontSize: 11 }}>
                  {activeEmployee.role}
                </span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.6)' }}>
                {activeEmployee.title} · {activeEmployee.department} · ID: <strong>{activeEmployee.id}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
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
      </div>

      {/* Profile Details Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Section 1: Personal Details */}
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
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Full Legal Name</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.name}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Corporate Email</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.email}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Direct Phone</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.phone}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Emergency Contact</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.emergencyContact || '--'}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Residential Address</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.address}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Job Details */}
        <div className="hrms-card" style={{ gap: 18 }}>
          <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              Job & Organization Details
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Job Title</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.title}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Department</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.department}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Reporting Manager</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.manager}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Date of Joining</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>{activeEmployee.joiningDate}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Employment Type</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2 }}>Full-Time Permanent</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Access Role</span>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginTop: 2, textTransform: 'capitalize' }}>
                {activeEmployee.role}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Salary Structure */}
        <div className="hrms-card" style={{ gap: 18 }}>
          <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Salary & Compensation Structure
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Basic Pay (Monthly)</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#000', marginTop: 2 }}>
                ${activeEmployee.salary?.basic?.toLocaleString() || '5,800'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Housing Allowance (HRA)</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#000', marginTop: 2 }}>
                ${activeEmployee.salary?.hra?.toLocaleString() || '2,400'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Special Allowances</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#000', marginTop: 2 }}>
                ${activeEmployee.salary?.allowances?.toLocaleString() || '1,200'}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>Standard Deductions</span>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'rgb(220, 38, 38)', marginTop: 2 }}>
                -${activeEmployee.salary?.deductions?.toLocaleString() || '600'}
              </p>
            </div>
            <div
              style={{
                gridColumn: 'span 2',
                background: 'rgb(254, 241, 238)',
                padding: '14px 18px',
                borderRadius: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Net Monthly In-Hand
                </span>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'rgb(115, 34, 237)' }}>
                  ${activeEmployee.salary?.net?.toLocaleString() || '8,800'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Annual Package (CTC)
                </span>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#000' }}>
                  {activeEmployee.salary?.annualCTC || '$115,200'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Documents */}
        <div className="hrms-card" style={{ gap: 18 }}>
          <div className="hrms-card-header" style={{ paddingBottom: 14, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h3 className="hrms-card-title" style={{ fontSize: 19 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Verified Corporate Documents
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeEmployee.documents?.map((doc, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#fafafa',
                  borderRadius: 14,
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <div>
                    <strong style={{ fontSize: 13, color: '#000' }}>{doc.name}</strong>
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)', display: 'block' }}>
                      {doc.size} · Uploaded {doc.date}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="cta-secondary"
                  style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 8, background: '#fff' }}
                  onClick={() => alert(`Downloading verified document: ${doc.name}`)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
