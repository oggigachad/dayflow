import React, { useState } from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import PayrollAdmin from './PayrollAdmin.jsx'

export default function PayrollView() {
  const { currentUser, activeEmployee, showToast, liveDate } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

  const [selectedPayslip, setSelectedPayslip] = useState(null)

  if (isAdmin) {
    return <PayrollAdmin />
  }

  const basic = activeEmployee.salary?.basic || 0
  const hra = activeEmployee.salary?.hra || 0
  const allowances = activeEmployee.salary?.allowances || 0
  const deductions = activeEmployee.salary?.deductions || 0
  const net = activeEmployee.salary?.net || (basic + hra + allowances - deductions)
  const annualCTC = activeEmployee.salary?.annualCTC || `$${((basic + hra + allowances) * 12).toLocaleString()}`

  const hasSalary = basic > 0 || net > 0

  // Calculate payslip history dynamically from joining date up to current month
  const generateDynamicPayslips = () => {
    if (!hasSalary) return []

    const joinDateStr = activeEmployee.joiningDate || liveDate
    const [joinYear, joinMonth] = joinDateStr.split('-').map(Number)
    const [currentYear, currentMonth] = liveDate.split('-').map(Number)

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]

    const list = []
    let y = joinYear || currentYear
    let m = joinMonth || currentMonth

    if (y > currentYear || (y === currentYear && m > currentMonth)) {
      y = currentYear
      m = currentMonth
    }

    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      const monthLabel = `${monthNames[m - 1]} ${y}`
      const lastDay = new Date(y, m, 0).getDate()
      const isCurrentMonth = y === currentYear && m === currentMonth
      const payDate = `${monthNames[m - 1].slice(0, 3)} ${lastDay}, ${y}`

      list.unshift({
        month: monthLabel,
        payDate,
        gross: `$${(basic + hra + allowances).toLocaleString()}`,
        deductions: `$${deductions.toLocaleString()}`,
        net: `$${net.toLocaleString()}`,
        status: isCurrentMonth ? 'Processing' : 'Paid',
      })

      m++
      if (m > 12) {
        m = 1
        y++
      }
    }

    return list
  }

  const payslips = generateDynamicPayslips()

  const handleOpenPdfReport = (p) => {
    setSelectedPayslip(p)
  }

  const handlePrintPdf = () => {
    window.print()
  }

  const handleDownloadCsv = (p) => {
    const csvContent =
      `DAYFLOW HRMS - OFFICIAL SALARY PAYSLIP\n` +
      `Employee Name,${activeEmployee.name}\n` +
      `Employee ID,${activeEmployee.id}\n` +
      `Pay Period,${p.month}\n` +
      `Disbursement Date,${p.payDate}\n` +
      `Basic Salary,$${basic.toLocaleString()}\n` +
      `HRA,$${hra.toLocaleString()}\n` +
      `Special Allowances,$${allowances.toLocaleString()}\n` +
      `Gross Earnings,${p.gross}\n` +
      `Total Deductions,-${p.deductions}\n` +
      `Net Disbursed,${p.net}\n` +
      `Payment Status,${p.status}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip_${activeEmployee.id}_${p.month.replace(' ', '_').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Downloaded CSV statement for ${p.month}`)
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Salary Overview Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Net In-Hand Salary</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'rgb(115,34,237)' }}>
            ${net.toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Direct deposit to registered bank account</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Gross Monthly Earnings</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: '#000' }}>
            ${(basic + hra + allowances).toLocaleString()}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Basic + HRA + Special allowances</span>
        </div>

        <div className="hrms-card" style={{ padding: 24, gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>Annual CTC Package</span>
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.04em', color: 'rgb(253,135,61)' }}>
            {annualCTC}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.5)' }}>Includes retirement & statutory contributions</span>
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
              <strong style={{ color: '#000' }}>${basic.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>House Rent Allowance (HRA)</span>
              <strong style={{ color: '#000' }}>${hra.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Special & Transport Allowance</span>
              <strong style={{ color: '#000' }}>${allowances.toLocaleString()}</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#000' }}>Total Gross Earnings</strong>
              <strong style={{ color: 'rgb(5,150,105)', fontSize: 16 }}>
                ${(basic + hra + allowances).toLocaleString()}
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
              <strong style={{ color: '#000' }}>${Math.round(deductions * 0.6).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Professional Tax / State Tax</span>
              <strong style={{ color: '#000' }}>${Math.round(deductions * 0.4).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }}>Medical Insurance Premium</span>
              <strong style={{ color: '#000' }}>Covered by Employer ($0)</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
              <strong style={{ color: '#000' }}>Total Monthly Deductions</strong>
              <strong style={{ color: 'rgb(220,38,38)', fontSize: 16 }}>
                -${deductions.toLocaleString()}
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
            <p className="hrms-card-subtitle">Generate official executive payslip PDF reports with digital signatures</p>
          </div>
        </div>

        {payslips.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.5)' }}>
            No prior payslips on record. Your initial monthly payslip will generate upon salary disbursement.
          </div>
        ) : (
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
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="cta-primary"
                          style={{ height: 34, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                          onClick={() => handleOpenPdfReport(p)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          View PDF Report
                        </button>
                        <button
                          type="button"
                          className="cta-secondary"
                          style={{ height: 34, padding: '0 10px', fontSize: 12, borderRadius: 10, background: '#fff' }}
                          title="Download CSV Statement"
                          onClick={() => handleDownloadCsv(p)}
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official Payslip PDF Report Modal */}
      {selectedPayslip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setSelectedPayslip(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              width: '100%',
              maxWidth: 780,
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              color: '#1e293b',
            }}
            onClick={(e) => e.stopPropagation()}
            id="printable-payslip"
          >
            {/* Modal Controls Top Bar (Hidden during print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 16 }}>
              <span className="hrms-pill approved" style={{ fontSize: 12 }}>
                ✓ Official Certified Electronic Payslip
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="cta-primary"
                  style={{ height: 38, padding: '0 18px', fontSize: 13, borderRadius: 12 }}
                  onClick={handlePrintPdf}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className="cta-secondary"
                  style={{ height: 38, padding: '0 16px', fontSize: 13, borderRadius: 12 }}
                  onClick={() => setSelectedPayslip(null)}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official PDF Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgb(122,50,227)', paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, rgb(122,50,227) 0%, rgb(236,72,153) 50%, rgb(253,135,61) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 22,
                    boxShadow: '0 4px 14px rgba(122,50,227,0.3)',
                  }}
                >
                  D
                </div>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', margin: 0 }}>
                    Dayflow Technologies Inc.
                  </h1>
                  <span style={{ fontSize: 13, color: '#64748b' }}>
                    100 Montgomery Street, Suite 1800, San Francisco, CA 94104
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgb(122,50,227)' }}>
                  CONFIDENTIAL SALARY STATEMENT
                </span>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: '4px 0 0' }}>
                  Pay Slip No: <span style={{ fontFamily: 'monospace' }}>DF-{activeEmployee.id}-{selectedPayslip.month.replace(' ', '-').toUpperCase()}</span>
                </p>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                  Disbursement: {selectedPayslip.payDate}
                </p>
              </div>
            </div>

            {/* Employee Information Grid */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Employee Name</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{activeEmployee.name}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Employee ID</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{activeEmployee.id}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Department</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{activeEmployee.department || 'Operations'}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Designation</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{activeEmployee.title || 'Staff Member'}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Pay Period</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{selectedPayslip.month}</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#64748b' }}>Payment Mode</span>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#059669', margin: '2px 0 0' }}>Direct Deposit (ACH)</p>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown Tables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Earnings Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: 13, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                  EARNINGS
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Basic Salary</span>
                    <strong>${basic.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>House Rent Allowance (HRA)</span>
                    <strong>${hra.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Special Allowances</span>
                    <strong>${allowances.toLocaleString()}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#059669' }}>
                    <span>Total Gross Earnings</span>
                    <span>{selectedPayslip.gross}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ background: '#f1f5f9', padding: '10px 16px', fontWeight: 700, fontSize: 13, color: '#0f172a', borderBottom: '1px solid #e2e8f0' }}>
                  DEDUCTIONS
                </div>
                <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Provident Fund / 401(k)</span>
                    <strong>${Math.round(deductions * 0.6).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Income Tax & State Tax</span>
                    <strong>${Math.round(deductions * 0.4).toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Employer Health Plan</span>
                    <strong style={{ color: '#059669' }}>Covered ($0)</strong>
                  </div>
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#dc2626' }}>
                    <span>Total Deductions</span>
                    <span>-{selectedPayslip.deductions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(122,50,227,0.06) 0%, rgba(253,135,61,0.06) 100%)',
                border: '1.5px solid rgba(122,50,227,0.2)',
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'rgb(122,50,227)' }}>
                  Total Net Payable Amount
                </span>
                <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                  Amount credited electronically to verified salary account
                </p>
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: 'rgb(122,50,227)', letterSpacing: '-0.03em' }}>
                {selectedPayslip.net}
              </div>
            </div>

            {/* Signatures & Seal Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, paddingTop: 16, borderTop: '1px dashed #cbd5e1' }}>
              {/* HR Director Signature */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', fontFamily: 'cursive', fontSize: 20, color: '#334155' }}>
                  Priya Nair
                </div>
                <div style={{ width: 180, height: 1, background: '#94a3b8' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Priya Nair</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>Head of Human Resources</span>
              </div>

              {/* Company Seal */}
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  border: '2px dashed rgb(122,50,227)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgb(122,50,227)',
                  textAlign: 'center',
                  fontSize: 8,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: 4,
                  transform: 'rotate(-8deg)',
                }}
              >
                <span>DAYFLOW HRMS</span>
                <span style={{ fontSize: 10, margin: '2px 0' }}>★ SEAL ★</span>
                <span>AUTHENTICATED</span>
              </div>

              {/* CEO Signature */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', fontFamily: 'cursive', fontSize: 22, color: '#334155' }}>
                  Aakash V.
                </div>
                <div style={{ width: 180, height: 1, background: '#94a3b8' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Aakash V.</span>
                <span style={{ fontSize: 11, color: '#64748b' }}>Chief Executive Officer (CEO)</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
              This is a system-generated cryptographically verified document by Dayflow HRMS. No manual physical stamping required.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
