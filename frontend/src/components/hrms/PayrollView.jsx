import React from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import PayrollAdmin from './PayrollAdmin.jsx'

export default function PayrollView() {
  const { currentUser, activeEmployee, showToast } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

  if (isAdmin) {
    return <PayrollAdmin />
  }

  const salary = activeEmployee.salary || {
    basic: 5800,
    hra: 2400,
    allowances: 1200,
    deductions: 600,
    net: 8800,
    annualCTC: '$115,200',
  }

  const payslips = [
    { month: 'August 2026', payDate: 'Aug 31, 2026', gross: `$${(salary.basic + salary.hra + salary.allowances).toLocaleString()}`, deductions: `$${salary.deductions.toLocaleString()}`, net: `$${salary.net.toLocaleString()}`, status: 'Processing' },
    { month: 'July 2026', payDate: 'Jul 31, 2026', gross: `$${(salary.basic + salary.hra + salary.allowances).toLocaleString()}`, deductions: `$${salary.deductions.toLocaleString()}`, net: `$${salary.net.toLocaleString()}`, status: 'Paid' },
    { month: 'June 2026', payDate: 'Jun 30, 2026', gross: `$${(salary.basic + salary.hra + salary.allowances).toLocaleString()}`, deductions: `$${salary.deductions.toLocaleString()}`, net: `$${salary.net.toLocaleString()}`, status: 'Paid' },
    { month: 'May 2026', payDate: 'May 31, 2026', gross: `$${(salary.basic + salary.hra + salary.allowances).toLocaleString()}`, deductions: `$${salary.deductions.toLocaleString()}`, net: `$${salary.net.toLocaleString()}`, status: 'Paid' },
  ]

  const handleDownload = (month) => {
    showToast(`Downloading signed payslip PDF for ${month}`)
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Salary Overview Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Net In-Hand Salary</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'rgb(115,34,237)' }}>
            ${salary.net?.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Direct deposit to registered bank account</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Gross Monthly Earnings</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            ${(salary.basic + salary.hra + salary.allowances)?.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Basic + HRA + Special allowances</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Annual CTC Package</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'rgb(253,135,61)' }}>
            {salary.annualCTC || '$115,200'}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Includes retirement & tax deductions</span>
        </div>
      </div>

      {/* Salary Structure Breakdown Details */}
      <div className="hrms-card">
        <div className="hrms-card-header" style={{ paddingBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="hrms-card-title-group">
            <h2 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Salary & Earnings Structure
            </h2>
            <p className="hrms-card-subtitle">Official breakdown of monthly earnings and standard statutory deductions</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Earnings Column */}
          <div style={{ background: '#fafafa', borderRadius: 18, padding: 20, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(5,150,105)' }}>
              Monthly Earnings (+)
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Basic Salary</span>
              <strong style={{ color: '#000' }}>${salary.basic?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>House Rent Allowance (HRA)</span>
              <strong style={{ color: '#000' }}>${salary.hra?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Special & Transport Allowance</span>
              <strong style={{ color: '#000' }}>${salary.allowances?.toLocaleString()}</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#000' }}>Total Gross Earnings</strong>
              <strong style={{ color: 'rgb(5,150,105)', fontSize: 16 }}>
                ${(salary.basic + salary.hra + salary.allowances)?.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Deductions Column */}
          <div style={{ background: '#fafafa', borderRadius: 18, padding: 20, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgb(220,38,38)' }}>
              Monthly Deductions (-)
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Provident Fund / 401(k)</span>
              <strong style={{ color: '#000' }}>${(salary.deductions * 0.6)?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Professional Tax / State Tax</span>
              <strong style={{ color: '#000' }}>${(salary.deductions * 0.4)?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Medical Insurance Premium</span>
              <strong style={{ color: '#000' }}>Covered by Employer ($0)</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#000' }}>Total Monthly Deductions</strong>
              <strong style={{ color: 'rgb(220,38,38)', fontSize: 16 }}>
                -${salary.deductions?.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="hrms-card">
        <div className="hrms-card-header">
          <div className="hrms-card-title-group">
            <h3 className="hrms-card-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgb(122,50,227)" strokeWidth="2.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Recent Payslips Archive
            </h3>
            <p className="hrms-card-subtitle">Download official payslip statements and tax certificates</p>
          </div>
        </div>

        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Salary Month</th>
                <th>Disbursement Date</th>
                <th>Gross Earnings</th>
                <th>Deductions</th>
                <th>Net In-Hand</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p, i) => (
                <tr key={i}>
                  <td>
                    <strong style={{ color: '#000' }}>{p.month}</strong>
                  </td>
                  <td>{p.payDate}</td>
                  <td>{p.gross}</td>
                  <td style={{ color: 'rgb(220,38,38)' }}>-{p.deductions}</td>
                  <td>
                    <strong style={{ color: 'rgb(115,34,237)', fontSize: 15 }}>{p.net}</strong>
                  </td>
                  <td>
                    <span className={`hrms-pill ${p.status.toLowerCase()}`}>
                      <span className="hrms-pill-dot" />
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="cta-secondary"
                      style={{ height: 34, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                      onClick={() => handleDownload(p.month)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
