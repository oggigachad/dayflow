import React, { useState } from 'react'
import api from '../services/api.js'
import PinInput from './PinInput.jsx'

export default function SignIn({ onSwitchToSignUp, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOtpStep, setIsOtpStep] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', ''])
  const [pendingTokens, setPendingTokens] = useState(null)

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your corporate email and password.')
      return
    }

    setLoading(true)

    try {
      // 1. Validate credentials against FastAPI backend
      const tokens = await api.auth.login({
        email: email.trim(),
        password: password.trim(),
      })

      if (tokens.access_token) {
        setPendingTokens(tokens)
        // Transition to OTP verification step
        setIsOtpStep(true)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Incorrect email or password. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (codeString = null) => {
    const code = codeString || otpCode.join('')
    if (code.length < 4) {
      setErrorMessage('Please enter the complete 4-digit OTP / PIN')
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      if (pendingTokens?.access_token) {
        localStorage.setItem('hrms_jwt_token', pendingTokens.access_token)
        if (pendingTokens.refresh_token) {
          localStorage.setItem('hrms_refresh_token', pendingTokens.refresh_token)
        }

        // Fetch authenticated user details from real backend
        const userDetails = await api.auth.me()
        const mappedRole = userDetails.role === 'admin' ? 'hr' : 'employee'
        const fullName = userDetails.profile?.full_name || email.split('@')[0]

        const userData = {
          id: userDetails.employee_id || `EMP-${userDetails.id}`,
          backendId: userDetails.id,
          employeeId: userDetails.employee_id,
          email: userDetails.email,
          name: fullName,
          role: mappedRole,
          title: userDetails.profile?.job_title || (mappedRole === 'hr' ? 'HR Administrator' : 'Staff Member'),
          department: userDetails.profile?.department || 'Operations',
          phone: userDetails.profile?.phone || '',
          address: userDetails.profile?.address || '',
        }

        onSuccess(userData)
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Render OTP Verification screen for Sign In
  if (isOtpStep) {
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
              <span className="auth-heading-grad">Two-Factor Security</span>
              <span className="auth-heading-sub">Enter OTP Code</span>
            </h2>
            <p className="auth-header-desc">
              We sent a 4-digit verification PIN to <strong style={{ color: '#000' }}>{email}</strong>.
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
              value={otpCode}
              onValueChange={setOtpCode}
              onValueComplete={({ valueAsString }) => handleVerifyOtp(valueAsString)}
            >
              <PinInput.Label>Enter 4-Digit PIN</PinInput.Label>
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
                  onClick={() => handleVerifyOtp()}
                >
                  <span>{loading ? 'Verifying OTP...' : 'Verify & Open Workspace'}</span>
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
                  setIsOtpStep(false)
                  setErrorMessage('')
                }}
                style={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                Back to Sign In
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
          <span className="auth-heading-grad">Welcome back</span>
          <span className="auth-heading-sub">Sign in to HRMS</span>
        </h1>
        <p className="auth-header-desc">
          Enter your corporate credentials to access your personalized role-based dashboard.
        </p>
      </div>

      {errorMessage && (
        <div className="auth-error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleCredentialsSubmit}>
        {/* Email */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signin-email">
            <span>Corporate Email</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signin-email"
              type="email"
              required
              className={`auth-input ${errorMessage ? 'error' : ''}`}
              placeholder="e.g. aakash.hr@odoo.com or manish.employee@odoo.com"
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="auth-label" htmlFor="signin-password">
              <span>Password</span>
            </label>
          </div>
          <div className="auth-input-wrapper">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              required
              className={`auth-input ${errorMessage ? 'error' : ''}`}
              placeholder="••••••••••••"
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
        </div>

        {/* Primary CTA button */}
        <div className="auth-submit-wrapper">
          <div className="cta-primary-wrapper">
            <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
            <div className="cta-primary-bg"></div>
            <button type="submit" className="cta-primary auth-submit-btn" disabled={loading}>
              <span>{loading ? 'Verifying...' : 'Sign In & Get OTP'}</span>
              <span className="cta-primary-circle">
                <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Switch to Sign Up */}
      <div className="auth-switch-prompt">
        <span>Don't have an account?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitchToSignUp}>
          Sign up
        </button>
      </div>
    </div>
  )
}
