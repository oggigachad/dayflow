import { useState } from 'react'

export default function SignIn({ onSwitchToSignUp, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Demo user credentials check
  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your corporate email and password.')
      return
    }

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      const cleanEmail = email.trim().toLowerCase()

      // Allow demo logins or valid format logins
      if (cleanEmail === 'alex.chen@acme.inc' || cleanEmail.includes('employee') || cleanEmail.startsWith('emp')) {
        onSuccess({
          email: cleanEmail,
          employeeId: 'EMP-2048',
          name: 'Alex Chen',
          role: 'employee',
        })
      } else if (
        cleanEmail === 'sarah.miller@acme.inc' ||
        cleanEmail.includes('hr') ||
        cleanEmail.includes('admin')
      ) {
        onSuccess({
          email: cleanEmail,
          employeeId: 'HR-1001',
          name: 'Sarah Miller',
          role: 'hr',
        })
      } else if (password.length < 6) {
        // Subtle inline error in theme color
        setErrorMessage('Invalid credentials. Please verify your email and password, or use the demo buttons below.')
      } else {
        // Default login according to email prefix or standard employee role
        const isHr = cleanEmail.includes('hr')
        onSuccess({
          email: cleanEmail,
          employeeId: isHr ? 'HR-1001' : 'EMP-3042',
          name: cleanEmail.split('@')[0].replace('.', ' '),
          role: isHr ? 'hr' : 'employee',
        })
      }
    }, 450)
  }

  // Pre-fill demo helper
  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'employee') {
      setEmail('alex.chen@acme.inc')
      setPassword('P@ssword2026!')
    } else {
      setEmail('sarah.miller@acme.inc')
      setPassword('AdminSecure#2026')
    }
    setErrorMessage('')
  }

  return (
    <div className="auth-card animate-fade-in-up">
      <div className="auth-header">
        <h1 className="auth-header-heading">
          <span className="auth-heading-grad">Welcome back</span>
          <span className="auth-heading-sub">Sign in to HRMS</span>
        </h1>
        <p className="auth-header-desc">
          Enter your credentials to access your personalized role-based dashboard.
        </p>
      </div>

      {errorMessage && (
        <div className="auth-error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signin-email">
            <span>Corporate Email</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signin-email"
              type="email"
              className={`auth-input ${errorMessage ? 'error' : ''}`}
              placeholder="name@company.com"
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
            <button
              type="button"
              style={{ fontSize: 13, color: 'rgb(122,50,227)', fontWeight: 500, cursor: 'pointer' }}
              onClick={() => alert('Password reset link sent to demo email.')}
            >
              Forgot password?
            </button>
          </div>
          <div className="auth-input-wrapper">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
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
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
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
