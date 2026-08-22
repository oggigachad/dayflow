import React, { useState } from 'react'
import api from '../services/api.js'
import PinInput from './PinInput.jsx'

export default function SignUp({ onSwitchToSignIn, onSuccess }) {
  const [fullName, setFullName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee') // 'employee' | 'hr'
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', ''])
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Password rules mirror the server's (backend/app/schemas.py::_validate_password):
  // 8+ chars with at least one letter and one digit. A special character is
  // encouraged but not required — requiring it here rejected passwords the API
  // would have accepted.
  const hasMinLength = password.length >= 8
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
  const isPasswordValid = hasMinLength && hasLetter && hasNumber

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isEmpIdValid = employeeId.trim().length >= 2
  const isNameValid = fullName.trim().length >= 2

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setErrorMessage('')

    if (!isNameValid) {
      setErrorMessage('Please enter your full legal name')
      return
    }
    if (!isEmpIdValid) {
      setErrorMessage('Please enter a valid Employee ID (e.g. EMP-1042 or ADM-001)')
      return
    }
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid corporate email (e.g. manish.employee@odoo.com or aakash.hr@odoo.com)')
      return
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must be at least 8 characters and contain both letters and numbers')
      return
    }

    // Trigger email verification step
    setIsVerificationStep(true)
  }

  const handleCompleteVerification = async (codeString = null) => {
    const enteredCode = codeString || verificationCode.join('')
    if (enteredCode.length < 4) {
      setErrorMessage('Please enter the complete 4-digit verification PIN')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      // 1. Create real user in PostgreSQL via FastAPI
      const tokens = await api.auth.signup({
        employee_id: employeeId.trim(),
        email: email.trim(),
        password: password.trim(),
        role: role === 'hr' ? 'admin' : 'employee',
        full_name: fullName.trim(),
      })

      if (tokens.access_token) {
        localStorage.setItem('hrms_jwt_token', tokens.access_token)
        if (tokens.refresh_token) {
          localStorage.setItem('hrms_refresh_token', tokens.refresh_token)
        }

        const userDetails = await api.auth.me()
        const mappedRole = userDetails.role === 'admin' ? 'hr' : 'employee'

        const userData = {
          id: userDetails.employee_id || `EMP-${userDetails.id}`,
          backendId: userDetails.id,
          employeeId: userDetails.employee_id,
          email: userDetails.email,
          name: userDetails.profile?.full_name || fullName.trim(),
          role: mappedRole,
          title: userDetails.profile?.job_title || (mappedRole === 'hr' ? 'HR Administrator' : 'Staff Member'),
          department: userDetails.profile?.department || 'Operations',
          phone: userDetails.profile?.phone || '',
          address: userDetails.profile?.address || '',
        }

        if (onSuccess) {
          onSuccess(userData)
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during registration. Please check if this email/ID is already registered.')
    } finally {
      setLoading(false)
    }
  }

  if (isVerificationStep) {
    return (
      <div className="auth-card animate-fade-in-up">
        <div className="auth-verification-box">
          <div className="auth-verification-icon-circle">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
              <polyline points="22,6 12,13 2,6" />
              <circle cx="18" cy="18" r="3" />
              <polyline points="18,17 18,18 19,18" />
            </svg>
          </div>

          <div className="auth-header">
            <h2 className="auth-header-heading">
              <span className="auth-heading-grad">Check your inbox</span>
              <span className="auth-heading-sub">Verify your email</span>
            </h2>
            <p className="auth-header-desc">
              We sent a 4-digit code to <strong style={{ color: '#000' }}>{email || 'your email'}</strong>. Enter it below to activate your account.
            </p>
          </div>

          {errorMessage && (
            <div className="auth-error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ width: '100%', marginTop: 8 }}>
            <PinInput.Root
              value={verificationCode}
              onValueChange={setVerificationCode}
              onValueComplete={({ valueAsString }) => handleCompleteVerification(valueAsString)}
            >
              <PinInput.Label>Enter PIN</PinInput.Label>
              <PinInput.Control>
                {[0, 1, 2, 3].map((index) => (
                  <PinInput.Input key={index} index={index} autoFocus={index === 0} />
                ))}
              </PinInput.Control>
              <PinInput.HiddenInput />
            </PinInput.Root>

            <div className="auth-submit-wrapper" style={{ marginTop: 24 }}>
              <div className="cta-primary-wrapper">
                <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
                <div className="cta-primary-bg"></div>
                <button
                  type="button"
                  className="cta-primary auth-submit-btn"
                  disabled={loading}
                  onClick={() => handleCompleteVerification()}
                >
                  <span>{loading ? 'Creating Account...' : 'Complete & Launch Workspace'}</span>
                  <span className="cta-primary-circle">
                    <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setIsVerificationStep(false)
                  setErrorMessage('')
                }}
                style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Back to Edit Information
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card animate-fade-in-up">
      <div className="auth-header">
        <h1 className="auth-header-heading">
          <span className="auth-heading-grad">Get started</span>
          <span className="auth-heading-sub">Create your HRMS account</span>
        </h1>
        <p className="auth-header-desc">
          Sign up to access employee self-service tools or admin HR management portal.
        </p>
      </div>

      {errorMessage && (
        <div className="auth-error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Navbar-Style Role Switcher */}
      <div className="auth-role-nav-switch">
        <button
          type="button"
          className={`auth-role-nav-tab ${role === 'employee' ? 'active' : ''}`}
          onClick={() => setRole('employee')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Employee</span>
        </button>

        <button
          type="button"
          className={`auth-role-nav-tab ${role === 'hr' ? 'active' : ''}`}
          onClick={() => setRole('hr')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Admin / HR</span>
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
        {/* Full Name */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signup-name">
            <span>Full Name</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signup-name"
              type="text"
              required
              className="auth-input"
              placeholder={role === 'hr' ? 'Aakash Sharma' : 'Manish Kumar'}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
            />
          </div>
        </div>

        {/* Employee ID */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signup-empid">
            <span>Employee ID</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signup-empid"
              type="text"
              required
              className="auth-input"
              placeholder={role === 'hr' ? 'ADM-001' : 'EMP-1042'}
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
            />
          </div>
        </div>

        {/* Corporate Email */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signup-email">
            <span>Corporate Email</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signup-email"
              type="email"
              required
              className="auth-input"
              placeholder={role === 'hr' ? 'aakash.hr@odoo.com' : 'manish.employee@odoo.com'}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signup-password">
            <span>Password</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              className="auth-input"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errorMessage) setErrorMessage('')
              }}
            />
            <button
              type="button"
              className="auth-input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Password requirement badges */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: hasMinLength ? '#10b981' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {hasMinLength ? '✓' : '○'} 8+ chars
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: hasLetter ? '#10b981' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {hasLetter ? '✓' : '○'} Letters
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: hasNumber ? '#10b981' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {hasNumber ? '✓' : '○'} Numbers
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: hasSpecial ? '#10b981' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {hasSpecial ? '✓' : '○'} Special char (optional)
            </span>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="auth-submit-wrapper">
          <div className="cta-primary-wrapper">
            <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
            <div className="cta-primary-bg"></div>
            <button type="submit" className="cta-primary auth-submit-btn">
              <span>Continue to Verification</span>
              <span className="cta-primary-circle">
                <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Switch to Sign In */}
      <div className="auth-switch-prompt">
        <span>Already registered?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitchToSignIn}>
          Sign in
        </button>
      </div>
    </div>
  )
}
