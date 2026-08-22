import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../services/api.js'

const HRMSContext = createContext(null)

// Local calendar date as YYYY-MM-DD. toISOString() returns the *UTC* day, which
// is a different date from local for part of every day (all of 00:00–05:30 in
// IST, for example) and never matches the server's local date. That mismatch
// made the dashboard show "Not Checked In Yet" while check-in returned 409.
function toLocalDateString(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const EMPTY_SALARY = { basic: 0, hra: 0, allowances: 0, deductions: 0, gross: 0, net: 0, annualCTC: '$0' }

// The backend keeps allowances as a JSONB map that *includes* hra, while the UI
// shows HRA and "other allowances" as separate lines. Summing the whole map into
// `allowances` therefore counted HRA twice in every gross and net figure.
function mapSalary(s) {
  if (!s) return { ...EMPTY_SALARY }
  const hra = Number(s.allowances?.hra) || 0
  const allowanceTotal = Object.values(s.allowances || {}).reduce((sum, v) => sum + Number(v), 0)
  const gross = Number(s.gross) || 0
  return {
    basic: Number(s.base_salary) || 0,
    hra,
    allowances: allowanceTotal - hra,
    deductions: Object.values(s.deductions || {}).reduce((sum, v) => sum + Number(v), 0),
    gross,
    net: Number(s.net) || 0,
    annualCTC: `$${(gross * 12).toLocaleString()}`,
  }
}

export function HRMSProvider({ children, initialUser, onClosePortal }) {
  const [currentUser, setCurrentUser] = useState(() => {
    return initialUser || {
      id: 'EMP-1',
      backendId: 1,
      employeeId: 'EMP-1',
      name: 'User',
      email: 'user@company.com',
      role: 'employee',
      title: 'Employee',
      department: 'General',
    }
  })

  // Live Realtime Clock (ticks every 1 second)
  const [realtimeDate, setRealtimeDate] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setRealtimeDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const liveDate = toLocalDateString(realtimeDate)
  const liveTime = realtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const liveTimeWithSeconds = realtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const liveDateFormatted = realtimeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

  const [employees, setEmployees] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [attendance, setAttendance] = useState([])
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch real-time data from FastAPI PostgreSQL backend
  const fetchAllRealtimeData = useCallback(async () => {
    const token = localStorage.getItem('hrms_jwt_token')
    if (!token) return

    try {
      // 1. Fetch current user profile & user data
      const meData = await api.auth.me().catch(() => null)
      if (meData) {
        const mappedRole = meData.role === 'admin' ? 'hr' : 'employee'
        const p = meData.profile || {}
        const updatedUser = {
          id: meData.employee_id || `EMP-${meData.id}`,
          backendId: meData.id,
          employeeId: meData.employee_id,
          email: meData.email,
          name: p.full_name || meData.email.split('@')[0],
          role: mappedRole,
          title: p.job_title || (mappedRole === 'hr' ? 'HR Administrator' : 'Staff Member'),
          department: p.department || 'Operations',
          phone: p.phone || '',
          address: p.address || '',
          joiningDate: p.date_joined || '',
          dob: p.date_of_birth || '',
          gender: p.gender || '',
          emergencyContact: p.emergency_contact || '',
          workLocation: p.work_location || '',
          manager: p.manager || '',
          employmentType: p.employment_type || '',
          profilePictureUrl: p.profile_picture_url || '',
          avatar: (p.full_name || meData.email).charAt(0).toUpperCase(),
          status: p.employment_status || 'Active',
          salary: { ...EMPTY_SALARY },
        }

        // Fetch salary for user
        try {
          const salaryData = await api.payroll.getMyPayroll().catch(() => null)
          if (salaryData) {
            updatedUser.salary = mapSalary(salaryData)
          }
        } catch {
          // ignore salary error
        }

        setCurrentUser((prev) => ({ ...prev, ...updatedUser }))
      }

      const isAdmin = currentUser.role === 'hr' || meData?.role === 'admin'

      // 2. Fetch Employees (if admin)
      if (isAdmin) {
        try {
          const empList = await api.employees.list()
          if (Array.isArray(empList)) {
            const formatted = await Promise.all(
              empList.map(async (e) => {
                let sal = { ...EMPTY_SALARY }
                try {
                  const s = await api.payroll.getPayroll(e.id).catch(() => null)
                  if (s) sal = mapSalary(s)
                } catch {
                  // ignore
                }

                return {
                  id: e.employee_id || `EMP-${e.id}`,
                  backendId: e.id,
                  employeeId: e.employee_id,
                  name: e.full_name || e.email.split('@')[0],
                  email: e.email,
                  role: e.role === 'admin' ? 'hr' : 'employee',
                  title: e.job_title || (e.role === 'admin' ? 'HR Administrator' : 'Software Engineer'),
                  department: e.department || 'Operations',
                  // Contact and personal detail come straight from the row so the
                  // admin profile editor opens pre-filled instead of blank —
                  // saving a blank form used to wipe the stored values.
                  phone: e.phone || '',
                  address: e.address || '',
                  joiningDate: e.date_joined || '',
                  dob: e.date_of_birth || '',
                  gender: e.gender || '',
                  emergencyContact: e.emergency_contact || '',
                  workLocation: e.work_location || '',
                  manager: e.manager || '',
                  employmentType: e.employment_type || '',
                  profilePictureUrl: e.profile_picture_url || '',
                  avatar: (e.full_name || e.email).charAt(0).toUpperCase(),
                  status: e.employment_status || 'Active',
                  salary: sal,
                }
              })
            )
            setEmployees(formatted)
          }
        } catch (e) {
          console.error('Error fetching employees list:', e)
        }
      }

      // 3. Fetch Attendance
      try {
        if (isAdmin) {
          // A month of rows, not just today: the calendar grid, the weekly
          // summary and the trend cards all read from this one list.
          const allAtt = await api.attendance.getAllAttendance(null, null, 'month')
          if (Array.isArray(allAtt)) {
            const mapped = allAtt.map((a) => {
              const checkInTime = a.check_in ? new Date(a.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
              const checkOutTime = a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
              
              let hours = 'Live'
              if (a.check_in && a.check_out) {
                const diffHours = (new Date(a.check_out) - new Date(a.check_in)) / (1000 * 60 * 60)
                hours = `${diffHours.toFixed(1)} hrs`
              } else if (!a.check_in) {
                hours = '0 hrs'
              }

              return {
                id: `ATT-${a.id}`,
                backendId: a.id,
                employeeId: a.employee_id || `EMP-${a.user_id}`,
                employeeName: a.full_name || `Employee ${a.user_id}`,
                date: a.date,
                checkIn: checkInTime,
                checkOut: checkOutTime,
                status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1).replace('_', '-') : 'Present',
                hours,
              }
            })
            setAttendance(mapped)
          }
        } else {
          const myAtt = await api.attendance.getMyAttendance('month')
          if (Array.isArray(myAtt)) {
            const mapped = myAtt.map((a) => {
              const checkInTime = a.check_in ? new Date(a.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
              const checkOutTime = a.check_out ? new Date(a.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
              
              let hours = 'Live'
              if (a.check_in && a.check_out) {
                const diffHours = (new Date(a.check_out) - new Date(a.check_in)) / (1000 * 60 * 60)
                hours = `${diffHours.toFixed(1)} hrs`
              } else if (!a.check_in) {
                hours = '0 hrs'
              }

              return {
                id: `ATT-${a.id}`,
                backendId: a.id,
                employeeId: currentUser.employeeId || currentUser.id,
                employeeName: currentUser.name,
                date: a.date,
                checkIn: checkInTime,
                checkOut: checkOutTime,
                status: a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1).replace('_', '-') : 'Present',
                hours,
              }
            })
            setAttendance(mapped)
          }
        }
      } catch (e) {
        console.error('Error fetching attendance:', e)
      }

      // 4. Fetch Leaves
      try {
        if (isAdmin) {
          const allLeaves = await api.leave.getAllLeaves()
          if (Array.isArray(allLeaves)) {
            const mapped = allLeaves.map((l) => ({
              id: l.id,
              backendId: l.id,
              employeeId: l.employee_id || `EMP-${l.user_id}`,
              employeeName: l.full_name || 'Staff Member',
              type: l.leave_type ? l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1) : 'Paid',
              startDate: l.start_date,
              endDate: l.end_date,
              days: l.days || 1,
              remarks: l.remarks || 'Personal time-off',
              status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : 'Pending',
              appliedDate: l.created_at ? l.created_at.split('T')[0] : liveDate,
              adminComment: l.admin_comment || '',
            }))
            setLeaveRequests(mapped)
          }
        } else {
          const myLeaves = await api.leave.getMyLeaves()
          if (Array.isArray(myLeaves)) {
            const mapped = myLeaves.map((l) => ({
              id: l.id,
              backendId: l.id,
              employeeId: currentUser.employeeId || currentUser.id,
              employeeName: currentUser.name,
              type: l.leave_type ? l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1) : 'Paid',
              startDate: l.start_date,
              endDate: l.end_date,
              days: l.days || 1,
              remarks: l.remarks || 'Personal time-off',
              status: l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : 'Pending',
              appliedDate: l.created_at ? l.created_at.split('T')[0] : liveDate,
              adminComment: l.admin_comment || '',
            }))
            setLeaveRequests(mapped)
          }
        }
      // 5. Fetch Notifications
      try {
        const notifList = await api.notifications.list()
        if (Array.isArray(notifList) && notifList.length > 0) {
          const mapped = notifList.map((n) => ({
            id: n.id,
            title: n.title,
            desc: n.message,
            time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: n.type || 'info',
          }))
          setNotifications(mapped)
        }
      } catch (e) {
        // Fallback to active state
      }
    } catch (err) {
      console.error('Data fetch error:', err)
    }
  }, [currentUser.role, currentUser.employeeId, currentUser.id, currentUser.name, liveDate])

  // Real-time live synchronization (every 2.5 seconds)
  useEffect(() => {
    fetchAllRealtimeData()
    const syncInterval = setInterval(fetchAllRealtimeData, 2500)
    return () => clearInterval(syncInterval)
  }, [fetchAllRealtimeData])

  // Active viewing employee (if admin clicked an employee, or current user)
  const activeEmployee = selectedEmployeeId
    ? employees.find((e) => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId) || currentUser
    : currentUser

  // Recent activity / alerts feed for the dashboard (spec §3.2.1). Derived from
  // the same attendance and leave lists the rest of the portal renders, so it
  // refreshes with every poll and can never drift out of sync with them.
  const notifications = useMemo(() => {
    const items = []

    leaveRequests.forEach((l) => {
      const status = String(l.status || 'Pending')
      const label = `${l.type || 'Paid'} leave`
      const span = l.startDate === l.endDate ? l.startDate : `${l.startDate} → ${l.endDate}`
      items.push({
        id: `NOTIF-LV-${l.id}`,
        type: status.toLowerCase(),
        sortKey: l.appliedDate || l.startDate || '',
        title: status === 'Pending' ? `${label} awaiting approval` : `${label} ${status.toLowerCase()}`,
        desc: l.adminComment
          ? `${span} · ${l.adminComment}`
          : `${span} · ${l.days} day${l.days === 1 ? '' : 's'}`,
        time: l.appliedDate === liveDate ? 'Today' : l.appliedDate || span,
      })
    })

    attendance.forEach((a) => {
      if (!a.checkIn || a.checkIn === '--:--') return
      const closed = a.checkOut && a.checkOut !== '--:--'
      items.push({
        id: `NOTIF-ATT-${a.backendId}`,
        type: String(a.status || 'Present').toLowerCase(),
        sortKey: a.date || '',
        title: closed ? `Shift complete · ${a.hours}` : 'Checked in — shift running',
        desc: `${a.employeeName} · in ${a.checkIn}${closed ? ` · out ${a.checkOut}` : ''}`,
        time: a.date === liveDate ? 'Today' : a.date,
      })
    })

    return items
      .sort((x, y) => String(y.sortKey).localeCompare(String(x.sortKey)))
      .slice(0, 6)
  }, [attendance, leaveRequests, liveDate])

  // Check-In Action
  const handleCheckIn = async () => {
    try {
      const res = await api.attendance.checkIn()
      showToast(`Checked in successfully at ${liveTime}!`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Check-in failed. Please try again.')
    }
  }

  // Check-Out Action
  const handleCheckOut = async () => {
    try {
      const res = await api.attendance.checkOut()
      showToast(`Clocked out successfully at ${liveTime}!`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Check-out failed. Please try again.')
    }
  }

  // Apply Leave Action
  const handleApplyLeave = async ({ type, startDate, endDate, remarks, days }) => {
    try {
      await api.leave.apply({
        leave_type: type.toLowerCase(),
        start_date: startDate,
        end_date: endDate,
        remarks: remarks || 'Standard leave request',
      })
      showToast(`Leave request for ${days || 1} days submitted to Admin!`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Failed to submit leave request.')
    }
  }

  // Approve Leave Action
  const handleApproveLeave = async (requestId, comment = 'Approved') => {
    try {
      const numericId = typeof requestId === 'string' && requestId.startsWith('LV-') ? requestId.replace('LV-', '') : requestId
      await api.leave.decide(numericId, 'approved', comment)
      showToast(`Leave request #${requestId} Approved`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Approval failed.')
    }
  }

  // Reject Leave Action
  const handleRejectLeave = async (requestId, comment = 'Declined per business schedule') => {
    try {
      const numericId = typeof requestId === 'string' && requestId.startsWith('LV-') ? requestId.replace('LV-', '') : requestId
      await api.leave.decide(numericId, 'rejected', comment)
      showToast(`Leave request #${requestId} Rejected`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Action failed.')
    }
  }

  // Profile Update Action
  //
  // Two endpoints, deliberately: /profile/me only accepts phone, address and
  // picture (spec §3.3.2 — what an employee may change about themselves) and
  // 422s on anything else, while /profile/{id} is admin-only and takes the full
  // record. An admin editing their own profile therefore has to go through the
  // admin route to save job/employment fields at all.
  const handleUpdateProfile = async (employeeId, updatedFields) => {
    const isSelf = currentUser.id === employeeId || currentUser.employeeId === employeeId
    const target = isSelf
      ? currentUser
      : employees.find((e) => e.id === employeeId || e.employeeId === employeeId)
    const isAdmin = currentUser.role === 'hr'

    // Only send a key when the form actually supplied it — undefined would blank
    // the column on the server, and these forms render different field sets.
    const pick = (obj) =>
      Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))

    try {
      if (isSelf && !isAdmin) {
        await api.profile.updateMyProfile(
          pick({
            phone: updatedFields.phone,
            address: updatedFields.address,
            profile_picture_url: updatedFields.profilePictureUrl,
          })
        )
      } else if (target?.backendId) {
        await api.profile.updateProfile(
          target.backendId,
          pick({
            full_name: updatedFields.name,
            phone: updatedFields.phone,
            address: updatedFields.address,
            profile_picture_url: updatedFields.profilePictureUrl,
            job_title: updatedFields.title,
            department: updatedFields.department,
            date_joined: updatedFields.joiningDate || null,
            date_of_birth: updatedFields.dob || null,
            gender: updatedFields.gender,
            emergency_contact: updatedFields.emergencyContact,
            work_location: updatedFields.workLocation,
            manager: updatedFields.manager,
            employment_type: updatedFields.employmentType,
            employment_status: updatedFields.status,
          })
        )
      } else {
        showToast('Could not resolve that employee record. Please refresh.')
        return
      }
      setIsEditingProfile(false)
      showToast('Profile information saved in database!')
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Failed to update profile.')
    }
  }

  // Payroll Update Action
  const handleUpdatePayroll = async (employeeId, updatedSalary) => {
    try {
      const emp = employees.find((e) => e.id === employeeId || e.employeeId === employeeId)
      if (emp?.backendId) {
        // Mirror of mapSalary(): hra and "other" go back as separate keys of the
        // allowances map, so a re-read reconstructs exactly what was entered.
        await api.payroll.updatePayroll(emp.backendId, {
          base_salary: Number(updatedSalary.basic) || 0,
          allowances: {
            hra: Number(updatedSalary.hra) || 0,
            other: Number(updatedSalary.allowances) || 0,
          },
          deductions: {
            tax: Number(updatedSalary.deductions) || 0,
          },
        })
      }
      showToast(`Salary structure saved for ${employeeId}`)
      await fetchAllRealtimeData()
    } catch (err) {
      showToast(err.message || 'Failed to update payroll.')
    }
  }

  // Role Toggle
  const handleSwitchRole = (newRole) => {
    if (newRole === 'hr') {
      setCurrentUser((prev) => ({ ...prev, role: 'hr' }))
      setSelectedEmployeeId(null)
      showToast('Switched to HR / Admin workspace view')
    } else {
      setCurrentUser((prev) => ({ ...prev, role: 'employee' }))
      setSelectedEmployeeId(null)
      showToast('Switched to Employee self-service view')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('hrms_jwt_token')
    localStorage.removeItem('hrms_refresh_token')
    localStorage.removeItem('hrms_session_user')
    if (onClosePortal) onClosePortal()
  }

  return (
    <HRMSContext.Provider
      value={{
        jwtToken: localStorage.getItem('hrms_jwt_token'),
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
        realtimeDate,
        liveDate,
        liveTime,
        liveTimeWithSeconds,
        liveDateFormatted,
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
        refreshData: fetchAllRealtimeData,
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
