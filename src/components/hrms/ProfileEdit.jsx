import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function ProfileEdit({ onCancel, isHrSelf = false }) {
  const { activeEmployee, currentUser, handleUpdateProfile } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

  // Form State
  const [name, setName] = useState(activeEmployee.name || '')
  const [email, setEmail] = useState(activeEmployee.email || '')
  const [phone, setPhone] = useState(activeEmployee.phone || '')
  const [address, setAddress] = useState(activeEmployee.address || '')
  const [dob, setDob] = useState(activeEmployee.dob || '1995-05-14')
  const [gender, setGender] = useState(activeEmployee.gender || 'Male')
  const [emergencyContact, setEmergencyContact] = useState(activeEmployee.emergencyContact || '')
  const [workLocation, setWorkLocation] = useState(activeEmployee.workLocation || 'Headquarters')
  const [title, setTitle] = useState(activeEmployee.title || '')
  const [department, setDepartment] = useState(activeEmployee.department || 'Operations')
  const [manager, setManager] = useState(activeEmployee.manager || 'HR Lead')
  const [joiningDate, setJoiningDate] = useState(activeEmployee.joiningDate || '2026-08-01')
  const [employmentType, setEmploymentType] = useState(activeEmployee.employmentType || 'Full-time')
  const [status, setStatus] = useState(activeEmployee.status || 'Active')
  const [avatar, setAvatar] = useState(activeEmployee.avatar || (activeEmployee.name || 'U').charAt(0))
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!phone.trim() || phone.length < 5) {
      newErrors.phone = 'Please enter a valid phone number.'
    }
    if (!address.trim() || address.length < 3) {
      newErrors.address = 'Please enter a valid address.'
    }
    if (isAdmin && !isHrSelf) {
      if (!name.trim()) newErrors.name = 'Full legal name is required.'
      if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid corporate email is required.'
      if (!title.trim()) newErrors.title = 'Job title is required.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const updatedData = {
      phone,
      address,
      avatar,
      ...(isHrSelf
        ? { workLocation, joiningDate }
        : isAdmin
        ? {
            name,
            email,
            title,
            department,
            manager,
            dob,
            gender,
            emergencyContact,
            workLocation,
            joiningDate,
            employmentType,
            status,
          }
        : {}),
    }

    handleUpdateProfile(activeEmployee.id, updatedData)
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 960, margin: '0 auto' }}>
      <div className="hrms-card">
        <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="hrms-card-title-group">
            <h2 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile — {activeEmployee.name}
            </h2>
            <p className="hrms-card-subtitle">
              {isAdmin && !isHrSelf
                ? 'Admin Mode: Full editing authority across all employee personal and employment fields'
                : isHrSelf
                ? 'Admin Profile Settings: Update contact, work location, and badge initials'
                : 'Employee Self-Service: You can update your phone, address, and profile photo badge'}
            </p>
          </div>

          <span className="hrms-pill pending" style={{ fontSize: 12 }}>
            {isAdmin ? 'Admin Edit Mode' : 'Self-Service Edit'}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Avatar / Initials Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'rgb(254, 241, 238)', borderRadius: 18 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 18,
                background: 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(236,72,153) 50%, rgb(253,135,61) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 22,
              }}
            >
              {avatar}
            </div>
            <div style={{ flex: 1 }}>
              <label className="auth-label" style={{ marginBottom: 6 }}>Avatar Badge Initial / Photo</label>
              <input
                type="text"
                maxLength={2}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                className="auth-input"
                style={{ width: 100, textAlign: 'center', fontSize: 18, fontWeight: 700 }}
              />
            </div>
          </div>

          {/* Card 1: Personal Details */}
          <div className="hrms-card" style={{ gap: 18 }}>
            <h3 className="hrms-card-title" style={{ fontSize: 18 }}>Personal Details</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Employee ID (Read-only) */}
              <div>
                <label className="auth-label">Employee ID (Read-only)</label>
                <input
                  type="text"
                  disabled
                  value={activeEmployee.id}
                  className="auth-input"
                  style={{ background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.6)', cursor: 'not-allowed' }}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="auth-label">Full Legal Name</label>
                <input
                  type="text"
                  disabled={!isAdmin || isHrSelf}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`auth-input ${errors.name ? 'error' : ''}`}
                  style={!isAdmin || isHrSelf ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                />
                {errors.name && <span className="auth-field-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div>
                <label className="auth-label">Corporate Email</label>
                <input
                  type="email"
                  disabled={!isAdmin || isHrSelf}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`auth-input ${errors.email ? 'error' : ''}`}
                  style={!isAdmin || isHrSelf ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                />
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {/* Phone (Self-editable) */}
              <div>
                <label className="auth-label">Direct Phone Number (Editable)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`auth-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
              </div>

              {!isHrSelf && (
                <>
                  {/* DOB */}
                  <div>
                    <label className="auth-label">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!isAdmin}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="auth-input"
                      style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="auth-label">Gender</label>
                    <select
                      disabled={!isAdmin}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="auth-input"
                      style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="auth-label">Emergency Contact</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="auth-input"
                      placeholder="Jane Doe (+1 555-987-6543)"
                      style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </>
              )}

              {/* Work Location */}
              <div>
                <label className="auth-label">Work Location</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="auth-input"
                  placeholder="Headquarters / Remote"
                  style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                />
              </div>

              {/* Address (Self-editable) */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="auth-label">Residential Address (Editable)</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`auth-input ${errors.address ? 'error' : ''}`}
                  style={{ height: 'auto', padding: '12px 16px' }}
                  placeholder="123 Innovation Street, San Francisco, CA"
                />
                {errors.address && <span className="auth-field-error">{errors.address}</span>}
              </div>
            </div>
          </div>

          {/* Card 2: Employment Details (Admin Only, omitted for HR Self Profile) */}
          {!isHrSelf && (
            <div className="hrms-card" style={{ gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="hrms-card-title" style={{ fontSize: 18 }}>Employment Details</h3>
                {!isAdmin && (
                  <span className="hrms-pill pending" style={{ fontSize: 11 }}>Read-only (Admin Managed)</span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {/* Joining Date */}
                <div>
                  <label className="auth-label">Date of Joining</label>
                  <input
                    type="date"
                    disabled={!isAdmin}
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  />
                </div>

                {/* Employment Type */}
                <div>
                  <label className="auth-label">Employment Type</label>
                  <select
                    disabled={!isAdmin}
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="auth-label">Department</label>
                  <select
                    disabled={!isAdmin}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design">Design</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="auth-label">Designation / Title</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  />
                </div>

                {/* Reporting Manager */}
                <div>
                  <label className="auth-label">Reporting Manager</label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="auth-label">Employee Status</label>
                  <select
                    disabled={!isAdmin}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="auth-input"
                    style={!isAdmin ? { background: 'rgba(0,0,0,0.04)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 46, padding: '0 24px', fontSize: 14, borderRadius: 14 }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cta-primary"
              style={{ height: 46, padding: '0 28px', fontSize: 14, borderRadius: 14 }}
            >
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
