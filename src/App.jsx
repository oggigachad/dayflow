import { useState, useEffect } from 'react'
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
import HRMSPortal from './components/hrms/HRMSPortal.jsx'

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const path = window.location.pathname
    const hash = window.location.hash
    if (path === '/dashboard' || hash === '#dashboard') return 'dashboard'
    if (path === '/signin' || hash === '#signin') return 'signin'
    if (path === '/signup' || hash === '#signup') return 'signup'
    return 'landing'
  })

  // Listen to popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const hash = window.location.hash
      if (path === '/dashboard' || hash === '#dashboard') {
        setCurrentRoute('dashboard')
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
  }, [])

  const navigateTo = (route) => {
    setCurrentRoute(route)
    const targetPath = route === 'landing' ? '/' : `/${route}`
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ route }, '', targetPath)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (currentRoute === 'dashboard') {
    return (
      <HRMSProvider onClosePortal={() => navigateTo('landing')}>
        <HRMSPortal />
      </HRMSProvider>
    )
  }

  if (currentRoute === 'signin' || currentRoute === 'signup') {
    return (
      <AuthFlow
        initialView={currentRoute}
        onClose={() => navigateTo('landing')}
        onNavigateToDashboard={() => navigateTo('dashboard')}
      />
    )
  }

  return (
    <>
      <Navbar onOpenAuth={(mode) => navigateTo(mode || 'signin')} />
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
