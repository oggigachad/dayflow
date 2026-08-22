import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Scenarios from './components/Scenarios.jsx'
import Features from './components/Features.jsx'
import RoleComparison from './components/RoleComparison.jsx'
import ComingSoon from './components/ComingSoon.jsx'
import FinalCTA from './components/FinalCTA.jsx'
import Footer from './components/Footer.jsx'
import AuthFlow from './components/AuthFlow.jsx'
import { HRMSProvider } from './context/HRMSContext.jsx'
import EmployeePortal from './components/hrms/EmployeePortal.jsx'
import AdminPortal from './components/hrms/AdminPortal.jsx'

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('hrms_session_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname
    const hash = window.location.hash
    let user = null
    try {
      const stored = localStorage.getItem('hrms_session_user')
      user = stored ? JSON.parse(stored) : null
    } catch {
      user = null
    }

    if (path === '/admin' || hash === '#admin' || path === '/dashboard/admin') {
      return user ? (user.role === 'hr' ? 'admin' : 'employee') : 'admin'
    }
    if (path === '/employee' || hash === '#employee' || path === '/dashboard/employee') {
      return user ? (user.role === 'hr' ? 'admin' : 'employee') : 'employee'
    }
    if (path === '/dashboard' || hash === '#dashboard') {
      return user ? (user.role === 'hr' ? 'admin' : 'employee') : (user?.role === 'hr' ? 'admin' : 'employee')
    }
    if (path === '/signin' || hash === '#signin') {
      return user ? (user.role === 'hr' ? 'admin' : 'employee') : 'signin'
    }
    if (path === '/signup' || hash === '#signup') {
      return user ? (user.role === 'hr' ? 'admin' : 'employee') : 'signup'
    }
    
    // If user is already authenticated in localStorage, keep them inside their workspace
    if (user) {
      return user.role === 'hr' ? 'admin' : 'employee'
    }
    return 'landing'
  })

  // Synchronize browser history and popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const hash = window.location.hash

      if (path === '/admin' || hash === '#admin' || path === '/dashboard/admin') {
        setCurrentRoute('admin')
      } else if (path === '/employee' || hash === '#employee' || path === '/dashboard/employee') {
        setCurrentRoute('employee')
      } else if (path === '/dashboard' || hash === '#dashboard') {
        const user = currentUser || JSON.parse(localStorage.getItem('hrms_session_user') || 'null')
        setCurrentRoute(user?.role === 'hr' ? 'admin' : 'employee')
      } else if (path === '/signin' || hash === '#signin') {
        setCurrentRoute('signin')
      } else if (path === '/signup' || hash === '#signup') {
        setCurrentRoute('signup')
      } else {
        setCurrentRoute('landing')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentUser])

  const navigateTo = (route, userState = null) => {
    if (userState) {
      setCurrentUser(userState)
      localStorage.setItem('hrms_session_user', JSON.stringify(userState))
    }

    setCurrentRoute(route)
    const targetPath = route === 'landing' ? '/' : `/${route}`
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ route }, '', targetPath)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('hrms_session_user', JSON.stringify(userData))

    // Genuine separation: route according to user role
    if (userData.role === 'hr') {
      navigateTo('admin', userData)
    } else {
      navigateTo('employee', userData)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hrms_session_user')
    localStorage.removeItem('hrms_jwt_token')
    setCurrentUser(null)
    navigateTo('signin')
  }

  // ===== ROUTE: ADMIN / HR PORTAL =====
  if (currentRoute === 'admin') {
    return (
      <HRMSProvider initialUser={currentUser || { role: 'hr', id: 'HR-1001', name: 'Sarah Miller' }} onClosePortal={handleLogout}>
        <AdminPortal />
      </HRMSProvider>
    )
  }

  // ===== ROUTE: EMPLOYEE PORTAL =====
  if (currentRoute === 'employee') {
    return (
      <HRMSProvider initialUser={currentUser || { role: 'employee', id: 'EMP-1042', name: 'Alex Chen' }} onClosePortal={handleLogout}>
        <EmployeePortal />
      </HRMSProvider>
    )
  }

  // ===== ROUTE: SIGN IN / SIGN UP =====
  if (currentRoute === 'signin' || currentRoute === 'signup') {
    return (
      <AuthFlow
        initialView={currentRoute}
        onClose={() => navigateTo('landing')}
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  // ===== ROUTE: LANDING PAGE =====
  return (
    <>
      <Navbar
        currentUser={currentUser}
        onNavigatePortal={(route) => navigateTo(route)}
        onOpenAuth={(mode) => navigateTo(mode || 'signin')}
      />
      <Hero onOpenAuth={(mode) => navigateTo(mode || 'signup')} />
      <Scenarios />
      <Features />
      <RoleComparison />
      <ComingSoon />
      <FinalCTA onOpenAuth={(mode) => navigateTo(mode || 'signup')} />
      <Footer />
    </>
  )
}
