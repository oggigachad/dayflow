import { useState } from 'react'

export default function SignUp({ onSwitchToSignIn, onSuccess }) {
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee') // 'employee' | 'hr'
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  const [verificationCode, setVerificationCode] = useState(['', '', '', ''])
  const [errorMessage, setErrorMessage] = useState('')

  // Password validation rules
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isEmpIdValid = employeeId.trim().length >= 3

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setErrorMessage('')

    if (!isEmpIdValid) {
      setErrorMessage('Please enter a valid Employee ID (e.g. EMP-1042)')
      return
    }
    if (!isEmailValid) {
      setErrorMessage('Please enter a valid corporate email address')
      return
    }
    if (!isPasswordValid) {
      setErrorMessage('Please meet all security requirements for your password')
      return
    }

    // Trigger email verification step
    setIsVerificationStep(true)
  }

  const handleVerifyCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleCompleteVerification = (e) => {
    e.preventDefault()
    const enteredCode = verificationCode.join('')
    if (enteredCode.length < 4) {
      setErrorMessage('Please enter the complete 4-digit verification code')
      return
    }

    // Success -> pass user info
    if (onSuccess) {
      onSuccess({
        employeeId,
        email,
        role,
      })
    }
  }

  // Pre-fill demo helper
  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'employee') {
      setEmployeeId('EMP-2048')
      setEmail('alex.chen@acme.inc')
      setPassword('P@ssword2026!')
      setRole('employee')
    } else {
      setEmployeeId('HR-1001')
      setEmail('sarah.miller@acme.inc')
      setPassword('AdminSecure#2026')
      setRole('hr')
    }
    setSubmitted(false)
    setErrorMessage('')
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

          <form onSubmit={handleCompleteVerification} style={{ width: '100%' }}>
            <div className="auth-verification-code-grid">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`code-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={verificationCode[idx]}
                  onChange={(e) => handleVerifyCodeChange(idx, e.target.value)}
                  className="auth-verification-code-input"
                  autoFocus={idx === 0}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              ))}
            </div>

            <div className="auth-submit-wrapper" style={{ marginTop: 24 }}>
              <div className="cta-primary-wrapper">
                <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
                <div className="cta-primary-bg"></div>
                <button type="submit" className="cta-primary auth-submit-btn">
                  <span>Activate & Access Dashboard</span>
                  <span className="cta-primary-circle">
                    <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
              </div>
            </div>
          </form>

          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>Didn't receive code?</span>
            <button
              type="button"
              onClick={() => {
                setVerificationCode(['9', '4', '2', '1'])
                setErrorMessage('')
              }}
              style={{ color: 'rgb(122,50,227)', fontWeight: 600, textDecoration: 'underline' }}
            >
              Autofill demo code (9421)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsVerificationStep(false)}
            className="cta-secondary"
            style={{ height: 44, padding: '0 20px', fontSize: 14, borderRadius: 12 }}
          >
            ← Back to details
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-card animate-fade-in-up">
      <div className="auth-header">
        <h1 className="auth-header-heading">
          <span className="auth-heading-grad">Create account</span>
          <span className="auth-heading-sub">Join your workspace</span>
        </h1>
        <p className="auth-header-desc">
          Sign up with your organization credentials to access self-service tools and workflows.
        </p>
      </div>

      {errorMessage && (
        <div className="auth-error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{errorMessage}</span>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Role Toggle (Segmented) */}
        <div className="auth-role-toggle-container">
          <label className="auth-label">
            <span>Account Role</span>
            <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)', fontWeight: 400 }}>
              {role === 'employee' ? 'Self-service access' : 'Full organization control'}
            </span>
          </label>
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn ${role === 'employee' ? 'active' : ''}`}
              onClick={() => setRole('employee')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 22c0-4 4-7 8-7s8 3 8 7"/>
              </svg>
              <span>Employee</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${role === 'hr' ? 'active' : ''}`}
              onClick={() => setRole('hr')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/>
              </svg>
              <span>Admin / HR</span>
            </button>
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
              className={`auth-input ${submitted && !isEmpIdValid ? 'error' : ''}`}
              placeholder="e.g. EMP-1042"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          </div>
          {submitted && !isEmpIdValid && (
            <span className="auth-field-error">Employee ID must be at least 3 characters.</span>
          )}
        </div>

        {/* Email Address */}
        <div className="auth-input-group">
          <label className="auth-label" htmlFor="signup-email">
            <span>Corporate Email</span>
          </label>
          <div className="auth-input-wrapper">
            <input
              id="signup-email"
              type="email"
              className={`auth-input ${submitted && !isEmailValid ? 'error' : ''}`}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {submitted && !isEmailValid && (
            <span className="auth-field-error">Please provide a valid corporate email.</span>
          )}
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
              className={`auth-input ${submitted && !isPasswordValid ? 'error' : ''}`}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Real-time Password Rules Feedback */}
          <div className="password-rules-box">
            <div className="password-rules-header">
              <span>Security Requirements</span>
              <span style={{ color: isPasswordValid ? 'rgb(16, 185, 129)' : 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {isPasswordValid ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Strong Password</span>
                  </>
                ) : (
                  'Required'
                )}
              </span>
            </div>
            <div className="password-rules-grid">
              <div className={`password-rule-item ${hasMinLength ? 'valid' : ''}`}>
                <span className="password-rule-bullet">
                  {hasMinLength ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  )}
                </span>
                <span>8+ characters</span>
              </div>
              <div className={`password-rule-item ${hasUppercase ? 'valid' : ''}`}>
                <span className="password-rule-bullet">
                  {hasUppercase ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  )}
                </span>
                <span>Uppercase (A-Z)</span>
              </div>
              <div className={`password-rule-item ${hasLowercase ? 'valid' : ''}`}>
                <span className="password-rule-bullet">
                  {hasLowercase ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  )}
                </span>
                <span>Lowercase (a-z)</span>
              </div>
              <div className={`password-rule-item ${hasNumber ? 'valid' : ''}`}>
                <span className="password-rule-bullet">
                  {hasNumber ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  )}
                </span>
                <span>Number (0-9)</span>
              </div>
              <div className={`password-rule-item ${hasSpecial ? 'valid' : ''}`} style={{ gridColumn: 'span 2' }}>
                <span className="password-rule-bullet">
                  {hasSpecial ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />
                  )}
                </span>
                <span>Special symbol (!@#$%^&*)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="auth-submit-wrapper">
          <div className="cta-primary-wrapper">
            <div className="cta-primary-border"><div className="cta-primary-border-inner"></div></div>
            <div className="cta-primary-bg"></div>
            <button type="submit" className="cta-primary auth-submit-btn">
              <span>Create Account</span>
              <span className="cta-primary-circle">
                <svg viewBox="0 0 14 14" fill="none"><path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Switch to Sign In */}
      <div className="auth-switch-prompt">
        <span>Already have an account?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitchToSignIn}>
          Sign in
        </button>
      </div>
    </div>
  )
}
