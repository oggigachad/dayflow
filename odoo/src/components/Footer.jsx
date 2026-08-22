export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">H</div>
            <p className="footer-tagline">
              HRMS — one platform for every HR task, from onboarding to payroll. Built with role-based access for Admins and Employees.
            </p>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Product</span>
            <a href="#features">Features</a>
            <a href="#scenarios">How it works</a>
            <a href="#roles">Roles</a>
            <a href="#pricing">Coming soon</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Company</span>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Resources</span>
            <a href="#">Documentation</a>
            <a href="#">API reference</a>
            <a href="#">Security</a>
            <a href="#">Status</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copyright">© 2024 HRMS. All rights reserved.</span>
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
