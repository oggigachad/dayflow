import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import SignUp from './SignUp.jsx'
import SignIn from './SignIn.jsx'
import { HRMSProvider } from '../context/HRMSContext.jsx'
import HRMSPortal from './hrms/HRMSPortal.jsx'

export default function AuthFlow({ initialView = 'signin', onClose, onNavigateToDashboard }) {
  const [view, setView] = useState(initialView) // 'signin' | 'signup' | 'dashboard'
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const videoRef = useRef(null)

  const handleAuthSuccess = (userData) => {
    setAuthenticatedUser(userData)
    if (onNavigateToDashboard) {
      onNavigateToDashboard()
    } else {
      setView('dashboard')
    }
  }

  // GSAP smooth transition whenever switching between signin and signup
  useEffect(() => {
    if (view === 'dashboard') return

    // GSAP entrance / transition animation
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          x: view === 'signup' ? -35 : 35,
          scale: 0.98,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power3.out',
        }
      )

      gsap.fromTo(
        videoRef.current,
        {
          opacity: 0,
          x: view === 'signup' ? 35 : -35,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.65,
          ease: 'power3.out',
        }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [view])

  return (
    <div className="auth-page-overlay" ref={containerRef}>
      {/* Floating Home Back Button */}
      <button
        className="auth-floating-back-btn"
        onClick={onClose}
        title="Return to Home"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Back to Home</span>
      </button>

      {view === 'dashboard' && authenticatedUser ? (
        <HRMSProvider initialUser={authenticatedUser} onClosePortal={onClose}>
          <HRMSPortal />
        </HRMSProvider>
      ) : (
        <div className={`auth-split-wrapper ${view === 'signup' ? 'signup-layout' : 'signin-layout'}`}>
          {/* Form Card (Left on Sign Up, Right on Sign In) */}
          <div className="auth-card-container" ref={cardRef}>
            {view === 'signup' ? (
              <SignUp
                onSwitchToSignIn={() => setView('signin')}
                onSuccess={handleAuthSuccess}
              />
            ) : (
              <SignIn
                onSwitchToSignUp={() => setView('signup')}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>

          {/* Video Showcase (Right on Sign Up, Left on Sign In) */}
          <div className="auth-video-container" ref={videoRef}>
            <video
              className="auth-video-media"
              autoPlay
              loop
              muted
              playsInline
              key={view}
            >
              <source
                src={view === 'signup' ? '/signup.mp4' : '/signin.mp4'}
                type="video/mp4"
              />
            </video>
            <div className="auth-video-overlay" />
            <div className="auth-video-content">
              <div className="auth-video-badge">
                {view === 'signup' ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    <span>Join Workspace</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Enterprise Security</span>
                  </>
                )}
              </div>
              <h3 className="auth-video-title">
                {view === 'signup'
                  ? 'All-in-one HR platform for fast-moving teams'
                  : 'Fast, secure access to your daily HR hub'}
              </h3>
              <p className="auth-video-desc">
                {view === 'signup'
                  ? 'Manage leave, payroll visibility, timesheets, and attendance in one streamlined portal.'
                  : 'Role-based dashboards with automated attendance records and instant approvals.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
