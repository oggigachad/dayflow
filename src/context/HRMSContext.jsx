import React, { createContext, useContext, useState } from 'react'

const INITIAL_EMPLOYEES = [
  {
    id: 'EMP-1042',
    name: 'Alex Chen',
    email: 'alex.chen@acme.inc',
    role: 'employee',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, San Francisco, CA 94107',
    joiningDate: '15 Jan 2022',
    avatar: 'A',
    status: 'Active',
    manager: 'Sarah Miller (HR Lead)',
    emergencyContact: 'Elena Chen (+1 555-987-6543)',
    salary: {
      basic: 5800,
      hra: 2400,
      allowances: 1200,
      deductions: 600,
      net: 8800,
      annualCTC: '$115,200',
    },
    documents: [
      { name: 'Employment_Contract_Signed.pdf', size: '2.4 MB', date: 'Jan 15, 2022' },
      { name: 'Identity_Verification_Passport.pdf', size: '1.8 MB', date: 'Jan 12, 2022' },
      { name: 'Tax_Exemption_Form_W4.pdf', size: '850 KB', date: 'Feb 01, 2024' },
    ],
  },
  {
    id: 'HR-1001',
    name: 'Sarah Miller',
    email: 'sarah.miller@acme.inc',
    role: 'hr',
    title: 'Lead People Operations & HR',
    department: 'Human Resources',
    phone: '+1 (555) 345-6789',
    address: '120 Market Street, Suite 400, San Francisco, CA 94105',
    joiningDate: '01 Mar 2021',
    avatar: 'S',
    status: 'Active',
    manager: 'Executive Team',
    emergencyContact: 'David Miller (+1 555-876-5432)',
    salary: {
      basic: 6500,
      hra: 2800,
      allowances: 1500,
      deductions: 750,
      net: 10050,
      annualCTC: '$132,000',
    },
    documents: [
      { name: 'HR_Executive_Agreement.pdf', size: '3.1 MB', date: 'Mar 01, 2021' },
      { name: 'SHRM_Certification_Proof.pdf', size: '1.2 MB', date: 'Apr 10, 2021' },
    ],
  },
  {
    id: 'EMP-1088',
    name: 'Marcus Vance',
    email: 'marcus.vance@acme.inc',
    role: 'employee',
    title: 'Product Design Lead',
    department: 'Design',
    phone: '+1 (555) 456-7890',
    address: '88 Design District Blvd, Oakland, CA 94607',
    joiningDate: '10 Jun 2022',
    avatar: 'M',
    status: 'Active',
    manager: 'Sarah Miller',
    emergencyContact: 'Clara Vance (+1 555-765-4321)',
    salary: {
      basic: 5400,
      hra: 2200,
      allowances: 1100,
      deductions: 550,
      net: 8150,
      annualCTC: '$106,800',
    },
    documents: [
      { name: 'Design_Lead_Contract.pdf', size: '2.1 MB', date: 'Jun 10, 2022' },
    ],
  },
  {
    id: 'EMP-2041',
    name: 'Priya Patel',
    email: 'priya.patel@acme.inc',
    role: 'employee',
    title: 'Frontend UI/UX Specialist',
    department: 'Engineering',
    phone: '+1 (555) 567-8901',
    address: '320 Sunset Ave, San Jose, CA 95112',
    joiningDate: '01 Nov 2023',
    avatar: 'P',
    status: 'Active',
    manager: 'Alex Chen',
    emergencyContact: 'Raj Patel (+1 555-654-3210)',
    salary: {
      basic: 4800,
      hra: 1900,
      allowances: 950,
      deductions: 480,
      net: 7170,
      annualCTC: '$94,000',
    },
    documents: [
      { name: 'Priya_Contract_Offer.pdf', size: '1.9 MB', date: 'Nov 01, 2023' },
    ],
  },
  {
    id: 'EMP-3012',
    name: 'David Kim',
    email: 'david.kim@acme.inc',
    role: 'employee',
    title: 'Cloud Infrastructure Engineer',
    department: 'DevOps',
    phone: '+1 (555) 678-9012',
    address: '900 Mission St, San Francisco, CA 94103',
    joiningDate: '15 Aug 2023',
    avatar: 'D',
    status: 'Active',
    manager: 'Alex Chen',
    emergencyContact: 'Min-Jun Kim (+1 555-543-2109)',
    salary: {
      basic: 5200,
      hra: 2100,
      allowances: 1050,
      deductions: 520,
      net: 7830,
      annualCTC: '$102,600',
    },
    documents: [
      { name: 'DevOps_Agreement_2023.pdf', size: '2.5 MB', date: 'Aug 15, 2023' },
    ],
  },
]

const INITIAL_LEAVE_REQUESTS = [
  {
    id: 'LV-904',
    employeeId: 'EMP-1042',
    employeeName: 'Alex Chen',
    type: 'Paid',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    days: 4,
    remarks: 'Attending React & Cloud Architecture Summit in Seattle.',
    status: 'Pending',
    appliedDate: '2026-08-20',
    adminComment: '',
  },
  {
    id: 'LV-902',
    employeeId: 'EMP-1088',
    employeeName: 'Marcus Vance',
    type: 'Sick',
    startDate: '2026-08-18',
    endDate: '2026-08-19',
    days: 2,
    remarks: 'Medical leave for dental surgery & recovery.',
    status: 'Approved',
    appliedDate: '2026-08-17',
    adminComment: 'Approved. Get well soon!',
  },
  {
    id: 'LV-901',
    employeeId: 'EMP-2041',
    employeeName: 'Priya Patel',
    type: 'Paid',
    startDate: '2026-08-25',
    endDate: '2026-08-28',
    days: 3,
    remarks: 'Annual family holiday trip.',
    status: 'Pending',
    appliedDate: '2026-08-21',
    adminComment: '',
  },
  {
    id: 'LV-899',
    employeeId: 'EMP-3012',
    employeeName: 'David Kim',
    type: 'Unpaid',
    startDate: '2026-07-10',
    endDate: '2026-07-15',
    days: 5,
    remarks: 'Extended personal leave.',
    status: 'Approved',
    appliedDate: '2026-07-02',
    adminComment: 'Approved per manager signoff.',
  },
]

const INITIAL_ATTENDANCE = [
  { id: 'ATT-1', employeeId: 'EMP-1042', employeeName: 'Alex Chen', date: '2026-08-22', checkIn: '09:02 AM', checkOut: '--:--', status: 'Present', hours: 'Live' },
  { id: 'ATT-2', employeeId: 'HR-1001', employeeName: 'Sarah Miller', date: '2026-08-22', checkIn: '08:45 AM', checkOut: '--:--', status: 'Present', hours: 'Live' },
  { id: 'ATT-3', employeeId: 'EMP-1088', employeeName: 'Marcus Vance', date: '2026-08-22', checkIn: '09:30 AM', checkOut: '--:--', status: 'Present', hours: 'Live' },
  { id: 'ATT-4', employeeId: 'EMP-2041', employeeName: 'Priya Patel', date: '2026-08-22', checkIn: '09:15 AM', checkOut: '--:--', status: 'Present', hours: 'Live' },
  { id: 'ATT-5', employeeId: 'EMP-3012', employeeName: 'David Kim', date: '2026-08-22', checkIn: '--:--', checkOut: '--:--', status: 'Leave', hours: '0 hrs' },
  { id: 'ATT-6', employeeId: 'EMP-1042', employeeName: 'Alex Chen', date: '2026-08-21', checkIn: '08:58 AM', checkOut: '05:45 PM', status: 'Present', hours: '8.8 hrs' },
  { id: 'ATT-7', employeeId: 'EMP-1042', employeeName: 'Alex Chen', date: '2026-08-20', checkIn: '09:10 AM', checkOut: '05:30 PM', status: 'Present', hours: '8.3 hrs' },
  { id: 'ATT-8', employeeId: 'EMP-1042', employeeName: 'Alex Chen', date: '2026-08-19', checkIn: '09:05 AM', checkOut: '01:15 PM', status: 'Half-Day', hours: '4.2 hrs' },
  { id: 'ATT-9', employeeId: 'EMP-1042', employeeName: 'Alex Chen', date: '2026-08-18', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', hours: '9.0 hrs' },
]

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Leave Request Received', desc: 'Priya Patel applied for 3 days Paid Leave', time: '10 mins ago', type: 'pending' },
  { id: 2, title: 'Check-In Logged', desc: 'Alex Chen checked in at 09:02 AM today', time: '1 hour ago', type: 'present' },
  { id: 3, title: 'Sick Leave Approved', desc: 'Marcus Vance leave approved for Aug 18-19', time: 'Yesterday', type: 'approved' },
  { id: 4, title: 'Monthly Payroll Processed', desc: 'August batch payslips generated for all staff', time: '2 days ago', type: 'paid' },
]

const HRMSContext = createContext(null)

// Helper to generate a realistic Base64-encoded JWT format (Header.Payload.Signature)
function generateJWTToken(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresAt = issuedAt + 86400 // 24 hours validity
  const payload = btoa(
    JSON.stringify({
      sub: user.id || 'EMP-2048',
      name: user.name || 'Team Member',
      email: user.email || 'user@acme.inc',
      role: user.role || 'employee',
      iat: issuedAt,
      exp: expiresAt,
      iss: 'hrms-auth-authority',
    })
  )
  const signature = btoa(`sig_${user.id}_${issuedAt}_hrms_secure_token`)
  return `${header}.${payload}.${signature}`
}

export function HRMSProvider({ children, initialUser, onClosePortal }) {
  // Normalize initialUser
  const resolvedInitialUser = (() => {
    if (!initialUser) return INITIAL_EMPLOYEES[0]
    
    // Check if user already exists in INITIAL_EMPLOYEES
    const existing = INITIAL_EMPLOYEES.find(
      (e) => (initialUser.id && e.id.toLowerCase() === initialUser.id.toLowerCase()) ||
             (initialUser.employeeId && e.id.toLowerCase() === initialUser.employeeId.toLowerCase()) ||
             (initialUser.email && e.email.toLowerCase() === initialUser.email.toLowerCase())
    )
    if (existing) {
      return {
        ...existing,
        id: initialUser.employeeId || initialUser.id || existing.id,
        role: initialUser.role || existing.role,
        name: initialUser.name || existing.name,
      }
    }

    const userId = initialUser.employeeId || initialUser.id || 'EMP-2048'
    const userRole = initialUser.role || 'employee'
    const userName = initialUser.name || (initialUser.email ? initialUser.email.split('@')[0].replace('.', ' ') : (userRole === 'hr' ? 'Admin Manager' : 'Team Member'))
    
    return {
      id: userId,
      name: userName,
      email: initialUser.email || `${userId.toLowerCase()}@acme.inc`,
      role: userRole,
      title: userRole === 'hr' ? 'HR Operations Director' : 'Software Engineer',
      department: userRole === 'hr' ? 'Human Resources' : 'Engineering',
      phone: '+1 (555) 342-8891',
      address: '100 Innovation Way, San Francisco, CA 94107',
      joiningDate: '12 Jan 2024',
      avatar: userName.charAt(0).toUpperCase(),
      status: 'Active',
      manager: userRole === 'hr' ? 'Executive Leadership' : 'Sarah Miller',
      emergencyContact: 'Family Contact (+1 555-019-2834)',
      salary: {
        basic: userRole === 'hr' ? 6200 : 5800,
        hra: userRole === 'hr' ? 2600 : 2400,
        allowances: userRole === 'hr' ? 1400 : 1200,
        deductions: 600,
        net: userRole === 'hr' ? 9600 : 8800,
        annualCTC: userRole === 'hr' ? '$124,800' : '$115,200',
      },
      documents: [
        { name: 'Offer_Letter_Signed.pdf', size: '2.4 MB', date: 'Jan 12, 2024' },
      ],
    }
  })()

  // JWT Token Management
  const [jwtToken, setJwtToken] = useState(() => {
    const existingToken = localStorage.getItem('hrms_jwt_token')
    if (existingToken) return existingToken
    const newToken = generateJWTToken(resolvedInitialUser)
    localStorage.setItem('hrms_jwt_token', newToken)
    return newToken
  })

  const [currentUser, setCurrentUser] = useState(resolvedInitialUser)
  const [employees, setEmployees] = useState(() => {
    const exists = INITIAL_EMPLOYEES.some((e) => e.id === resolvedInitialUser.id)
    return exists ? INITIAL_EMPLOYEES : [resolvedInitialUser, ...INITIAL_EMPLOYEES]
  })
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'profile' | 'attendance' | 'leave' | 'payroll' | 'employees'
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS)
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active viewing employee (if admin clicked an employee, or current user)
  const activeEmployee = selectedEmployeeId
    ? employees.find((e) => e.id === selectedEmployeeId) || currentUser
    : employees.find((e) => e.id === currentUser.id) || currentUser

  // Check-In Action
  const handleCheckIn = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const existingIdx = attendance.findIndex(
      (a) => a.employeeId === activeEmployee.id && a.date === todayStr
    )

    if (existingIdx >= 0) {
      const updated = [...attendance]
      updated[existingIdx] = {
        ...updated[existingIdx],
        checkIn: timeStr,
        status: 'Present',
        hours: 'Live',
      }
      setAttendance(updated)
    } else {
      setAttendance([
        {
          id: `ATT-${Date.now()}`,
          employeeId: activeEmployee.id,
          employeeName: activeEmployee.name,
          date: todayStr,
          checkIn: timeStr,
          checkOut: '--:--',
          status: 'Present',
          hours: 'Live',
        },
        ...attendance,
      ])
    }

    setNotifications([
      {
        id: Date.now(),
        title: 'Check-In Recorded',
        desc: `${activeEmployee.name} checked in at ${timeStr}`,
        time: 'Just now',
        type: 'present',
      },
      ...notifications,
    ])

    showToast(`Checked in successfully at ${timeStr}`)
  }

  // Check-Out Action
  const handleCheckOut = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const updated = attendance.map((a) => {
      if (a.employeeId === activeEmployee.id && a.date === todayStr) {
        return {
          ...a,
          checkOut: timeStr,
          hours: '8.5 hrs',
        }
      }
      return a
    })

    setAttendance(updated)
    showToast(`Checked out successfully at ${timeStr}`)
  }

  // Apply Leave Action
  const handleApplyLeave = ({ type, startDate, endDate, remarks, days }) => {
    const newRequest = {
      id: `LV-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      type,
      startDate,
      endDate,
      days: Number(days) || 1,
      remarks,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      adminComment: '',
    }

    setLeaveRequests([newRequest, ...leaveRequests])

    setNotifications([
      {
        id: Date.now(),
        title: 'New Leave Request',
        desc: `${activeEmployee.name} submitted a ${type} leave request (${days} days)`,
        time: 'Just now',
        type: 'pending',
      },
      ...notifications,
    ])

    showToast(`Leave request for ${days} days submitted with Pending status`)
  }

  // Approve Leave Action
  const handleApproveLeave = (requestId, comment = 'Approved') => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === requestId ? { ...l, status: 'Approved', adminComment: comment } : l
      )
    )
    showToast(`Leave request ${requestId} marked as Approved`)
  }

  // Reject Leave Action
  const handleRejectLeave = (requestId, comment = 'Declined per business schedule') => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === requestId ? { ...l, status: 'Rejected', adminComment: comment } : l
      )
    )
    showToast(`Leave request ${requestId} marked as Rejected`)
  }

  // Profile Update
  const handleUpdateProfile = (employeeId, updatedFields) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, ...updatedFields } : emp))
    )
    if (currentUser.id === employeeId) {
      setCurrentUser((prev) => ({ ...prev, ...updatedFields }))
    }
    setIsEditingProfile(false)
    showToast('Profile information saved successfully')
  }

  // Payroll Update
  const handleUpdatePayroll = (employeeId, updatedSalary) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              salary: {
                ...emp.salary,
                ...updatedSalary,
                net: (Number(updatedSalary.basic) || 0) + (Number(updatedSalary.hra) || 0) + (Number(updatedSalary.allowances) || 0) - (Number(updatedSalary.deductions) || 0),
              },
            }
          : emp
      )
    )
    showToast(`Salary structure updated for employee ${employeeId}`)
  }

  // Role Toggle
  const handleSwitchRole = (newRole) => {
    if (newRole === 'hr') {
      const hrUser = employees.find((e) => e.role === 'hr') || INITIAL_EMPLOYEES[1]
      setCurrentUser(hrUser)
      setSelectedEmployeeId(null)
      showToast('Switched to HR / Admin workspace view')
    } else {
      const empUser = employees.find((e) => e.role === 'employee') || INITIAL_EMPLOYEES[0]
      setCurrentUser(empUser)
      setSelectedEmployeeId(null)
      showToast('Switched to Employee self-service view')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hrms_jwt_token')
    if (onClosePortal) onClosePortal()
  }

  return (
    <HRMSContext.Provider
      value={{
        jwtToken,
        currentUser,
        setCurrentUser,
        employees,
        activeTab,
        setActiveTab,
        selectedEmployeeId,
        setSelectedEmployeeId,
        activeEmployee,
        isEditingProfile,
        setIsEditingProfile,
        leaveRequests,
        attendance,
        notifications,
        toastMessage,
        showToast,
        handleCheckIn,
        handleCheckOut,
        handleApplyLeave,
        handleApproveLeave,
        handleRejectLeave,
        handleUpdateProfile,
        handleUpdatePayroll,
        handleSwitchRole,
        handleLogout,
        onClosePortal,
      }}
    >
      {children}
    </HRMSContext.Provider>
  )
}

export function useHRMS() {
  const context = useContext(HRMSContext)
  if (!context) {
    throw new Error('useHRMS must be used within an HRMSProvider')
  }
  return context
}
