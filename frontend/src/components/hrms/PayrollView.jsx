import React from 'react'
import { useHRMS } from '../../context/HRMSContext.jsx'
import PayrollAdmin from './PayrollAdmin.jsx'

export default function PayrollView() {
  const { currentUser, activeEmployee, showToast, liveDate } = useHRMS()
  const isAdmin = currentUser.role === 'hr'

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

  // Calculate payslip history dynamically from joining date up to current month (no hardcoded past months)
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

    // If join date is in future, default to current month
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

  const handleDownload = (p) => {
    const csvContent =
      `DAYFLOW HRMS - OFFICIAL SALARY PAYSLIP\n` +
      `Employee Name,${activeEmployee.name}\n` +
      `Employee ID,${activeEmployee.id}\n` +
      `Pay Period,${p.month}\n` +
      `Disbursement Date,${p.payDate}\n` +
      `Basic Salary,$${basic.toLocaleString()}\n` +
      `HRA,$${hra.toLocaleString()}\n` +
      `Allowances,$${allowances.toLocaleString()}\n` +
      `Gross Earnings,${p.gross}\n` +
      `Deductions,-${p.deductions}\n` +
      `Net Disbursed,${p.net}\n` +
      `Payment Status,${p.status}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip_${activeEmployee.id}_${p.month.replace(' ', '_').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Downloaded payslip statement for ${p.month}`)
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
            <p className="hrms-card-subtitle">Download official payslip statements and tax certificates</p>
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
                      <button
                        type="button"
                        className="cta-secondary"
                        style={{ height: 34, padding: '0 14px', fontSize: 12, borderRadius: 10 }}
                        onClick={() => handleDownload(p)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Statement
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
