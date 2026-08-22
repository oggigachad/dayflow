import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'

export default function ProfileEdit({ onCancel }) {
  const { activeEmployee, currentUser, handleUpdateProfile } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

  // Form State
  const [name, setName] = useState(activeEmployee.name)
  const [email, setEmail] = useState(activeEmployee.email)
  const [phone, setPhone] = useState(activeEmployee.phone)
  const [address, setAddress] = useState(activeEmployee.address)
  const [emergencyContact, setEmergencyContact] = useState(activeEmployee.emergencyContact || '')
  const [title, setTitle] = useState(activeEmployee.title)
  const [department, setDepartment] = useState(activeEmployee.department)
  const [manager, setManager] = useState(activeEmployee.manager)
  const [avatar, setAvatar] = useState(activeEmployee.avatar || activeEmployee.name.charAt(0))
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!phone.trim() || phone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number.'
    }
    if (!address.trim() || address.length < 5) {
      newErrors.address = 'Please enter a complete residential address.'
    }
    if (isAdmin) {
      if (!name.trim()) newErrors.name = 'Name is required.'
      if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required.'
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
      emergencyContact,
      avatar,
      ...(isAdmin ? { name, email, title, department, manager } : {}),
    }

    handleUpdateProfile(activeEmployee.id, updatedData)
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
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
              {isAdmin
                ? 'Admin Mode: Full editing authority across all employee attributes'
                : 'Employee Self-Service: You can update your contact phone, address, and avatar'}
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
              <label className="auth-label" style={{ marginBottom: 6 }}>Avatar Badge Initial</label>
              <input
                type="text"
                maxLength={2}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value.toUpperCase())}
                style={{
                  width: 80,
                  height: 40,
                  borderRadius: 10,
                  border: '1.5px solid rgba(0,0,0,0.14)',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              />
              <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', marginLeft: 12 }}>
                Enter 1-2 letters to represent your profile avatar
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Full Name */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Full Name</span>
                {!isAdmin && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Read-only</span>}
              </label>
              <input
                type="text"
                className={`auth-input ${errors.name ? 'error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                style={{ background: !isAdmin ? '#f5f5f5' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text' }}
              />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Corporate Email</span>
                {!isAdmin && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Read-only</span>}
              </label>
              <input
                type="email"
                className={`auth-input ${errors.email ? 'error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isAdmin}
                style={{ background: !isAdmin ? '#f5f5f5' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text' }}
              />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            {/* Phone Number (Editable by all) */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Direct Phone Number</span>
                <span style={{ fontSize: 11, color: 'rgb(122,50,227)' }}>Editable</span>
              </label>
              <input
                type="text"
                className={`auth-input ${errors.phone ? 'error' : ''}`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && <span className="auth-field-error">{errors.phone}</span>}
            </div>

            {/* Emergency Contact */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Emergency Contact Info</span>
                <span style={{ fontSize: 11, color: 'rgb(122,50,227)' }}>Editable</span>
              </label>
              <input
                type="text"
                className="auth-input"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Name & contact phone"
              />
            </div>

            {/* Address (Editable by all) */}
            <div className="auth-input-group" style={{ gridColumn: 'span 2' }}>
              <label className="auth-label">
                <span>Residential Address</span>
                <span style={{ fontSize: 11, color: 'rgb(122,50,227)' }}>Editable</span>
              </label>
              <input
                type="text"
                className={`auth-input ${errors.address ? 'error' : ''}`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full residential street, city, state & zip"
              />
              {errors.address && <span className="auth-field-error">{errors.address}</span>}
            </div>

            {/* Job Title */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Job Title</span>
                {!isAdmin && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Admin only</span>}
              </label>
              <input
                type="text"
                className={`auth-input ${errors.title ? 'error' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!isAdmin}
                style={{ background: !isAdmin ? '#f5f5f5' : '#fff', cursor: !isAdmin ? 'not-allowed' : 'text' }}
              />
            </div>

            {/* Department */}
            <div className="auth-input-group">
              <label className="auth-label">
                <span>Department</span>
                {!isAdmin && <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>Admin only</span>}
              </label>
              {isAdmin ? (
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="auth-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="DevOps">DevOps</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="auth-input"
                  value={department}
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 12, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <button
              type="button"
              className="cta-secondary"
              style={{ height: 50, padding: '0 24px', fontSize: 15, borderRadius: 16 }}
              onClick={onCancel}
            >
              Cancel
            </button>
            <div className="cta-primary-wrapper">
              <div className="cta-primary-border"><div className="cta-primary-border-inner" /></div>
              <div className="cta-primary-bg" />
              <button
                type="submit"
                className="cta-primary"
                style={{ height: 50, padding: '0 28px', fontSize: 15, borderRadius: 16 }}
              >
                <span>Save Profile Changes</span>
                <span className="cta-primary-circle" style={{ width: 24, height: 24 }}>
                  <svg viewBox="0 0 14 14" fill="none" style={{ width: 11, height: 11 }}>
                    <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
