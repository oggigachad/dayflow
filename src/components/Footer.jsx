import React from 'react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src="/logo.svg"
                alt="HRMS Logo"
                className="footer-logo-img"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: 'contain',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                }}
              />
              <div>
                <span className="hrms-brand-animated" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', display: 'block' }}>
                  HRMS
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Enterprise Suite
                </span>
              </div>
            </div>
            <p className="footer-tagline">
              HRMS — one platform for every HR task, from onboarding to payroll. Built with role-based access for Admins and Employees.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(122,50,227,0.18)', border: '1px solid rgba(122,50,227,0.35)', width: 'fit-content' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(253,135,61)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>2026 Edition · Version 2.4</span>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Product Modules</span>
            <a href="#features">Employee Self-Service</a>
            <a href="#features">Attendance & Timesheets</a>
            <a href="#features">Leave Approvals Hub</a>
            <a href="#features">Payroll & Salary Structure</a>
            <a href="#features">Admin Directory</a>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Platform</span>
            <a href="#scenarios">How It Works</a>
            <a href="#roles">Role Comparisons</a>
            <a href="#pricing">Enterprise Security</a>
            <a href="#faq">System Architecture</a>
          </div>

          <div className="footer-col">
            <span className="footer-col-title">Security & API</span>
            <a href="#">JWT Bearer Authentication</a>
            <a href="#">Audit Trail Logs</a>
            <a href="#">Role-Based Access Control</a>
            <a href="#">256-Bit Data Encryption</a>
          </div>
        </div>

        {/* Footer Bottom with Tech Stackers Credits */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="footer-copyright">
              © 2026 HRMS. All rights reserved.
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Made by <strong style={{ color: '#fff', fontWeight: 600 }}>Tech Stackers</strong> —
              </span>
              <span className="tech-stackers-badge">
                Aakash, Shreya Jaiswal, Manish, Shreya Mahajan
              </span>
            </div>
          </div>

          <div className="footer-socials">
            <a className="footer-social" href="#" aria-label="Twitter">
              <svg viewBox="0 0 24 24"><path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.554.461-1.4.693-2.866.674-4.337-.004-.502 1.504-1.504 2.641-4.616z"/></svg>
            </a>
            <a className="footer-social" href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            </a>
            <a className="footer-social" href="#" aria-label="GitHub">
              <svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
