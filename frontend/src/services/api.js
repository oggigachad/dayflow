// Centralized Realtime API Client for Dayflow FastAPI Backend

const API_BASE_URL = 'http://localhost:8000'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hrms_jwt_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const config = {
    ...options,
    headers,
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!res.ok) {
      let errorDetail = 'An unexpected error occurred'
      try {
        const errorJson = await res.json()
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson)
      } catch {
        errorDetail = `Request failed with status ${res.status} (${res.statusText})`
      }
      const err = new Error(errorDetail)
      err.status = res.status
      throw err
    }

    // Return json if available, else empty object
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await res.json()
    }
    return {}
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, error.message)
    throw error
  }
}

export const api = {
  auth: {
    signup: async ({ employee_id, email, password, role = 'employee', full_name }) => {
      const payload = {
        employee_id,
        email: email.trim().toLowerCase(),
        password,
        role: role === 'hr' ? 'admin' : role,
        full_name,
      }
      return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    login: async ({ email, password }) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })
    },

    me: async () => {
      return request('/auth/me')
    },
  },

  profile: {
    getMyProfile: async () => {
      return request('/profile/me')
    },

    updateMyProfile: async ({ phone, address, profile_picture_url }) => {
      return request('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ phone, address, profile_picture_url }),
      })
    },

    getProfile: async (userId) => {
      return request(`/profile/${userId}`)
    },

    updateProfile: async (userId, payload) => {
      return request(`/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },
  },

  employees: {
    list: async () => {
      return request('/employees')
    },

    get: async (userId) => {
      return request(`/employees/${userId}`)
    },
  },

  attendance: {
    getToday: async () => {
      return request('/attendance/today')
    },

    checkIn: async () => {
      return request('/attendance/check-in', {
        method: 'POST',
      })
    },

    checkOut: async () => {
      return request('/attendance/check-out', {
        method: 'POST',
      })
    },

    getMyAttendance: async (range = 'month') => {
      return request(`/attendance/me?range=${range}`)
    },

    getAllAttendance: async (on = null, userId = null, range = null) => {
      const params = new URLSearchParams()
      if (on) params.append('on', on)
      // The server ignores range when `on` is present — it stays a single day.
      if (range) params.append('range', range)
      if (userId) params.append('user_id', userId)
      const queryString = params.toString() ? `?${params.toString()}` : ''
      return request(`/attendance${queryString}`)
    },
  },

  leave: {
    apply: async ({ leave_type, start_date, end_date, remarks }) => {
      return request('/leave', {
        method: 'POST',
        body: JSON.stringify({
          leave_type: leave_type.toLowerCase(),
          start_date,
          end_date,
          remarks,
        }),
      })
    },

    applyOnBehalf: async ({ user_id, leave_type, start_date, end_date, remarks }) => {
      return request(`/leave/apply-on-behalf?user_id=${user_id}`, {
        method: 'POST',
        body: JSON.stringify({
          leave_type: leave_type.toLowerCase(),
          start_date,
          end_date,
          remarks,
        }),
      })
    },

    getMyLeaves: async () => {
      return request('/leave/me')
    },

    getAllLeaves: async (status = null) => {
      const query = status && status !== 'All' ? `?status=${status.toLowerCase()}` : ''
      return request(`/leave${query}`)
    },

    decide: async (leaveId, status, adminComment = '') => {
      return request(`/leave/${leaveId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: status.toLowerCase(),
          admin_comment: adminComment,
        }),
      })
    },
  },

  payroll: {
    getMyPayroll: async () => {
      return request('/payroll/me')
    },

    getPayroll: async (userId) => {
      return request(`/payroll/${userId}`)
    },

    updatePayroll: async (userId, payload) => {
      return request(`/payroll/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    },

    batchProcess: async () => {
      return request('/payroll/batch-process', {
        method: 'POST',
      })
    },

    getPayslipDownloadUrl: (userId) => {
      return `${API_BASE_URL}/payroll/${userId}/payslip-download`
    },
  },

  documents: {
    getMyDocs: async () => {
      return request('/documents/me')
    },

    getUserDocs: async (userId) => {
      return request(`/documents/${userId}`)
    },

    uploadDoc: async ({ document_type, file_name, file_size, user_id = null }) => {
      const query = user_id ? `?user_id=${user_id}` : ''
      return request(`/documents/upload${query}`, {
        method: 'POST',
        body: JSON.stringify({ document_type, file_name, file_size }),
      })
    },

    deleteDoc: async (docId) => {
      return request(`/documents/${docId}`, {
        method: 'DELETE',
      })
    },
  },

  notifications: {
    list: async () => {
      return request('/notifications')
    },

    send: async ({ title, message, type = 'info', user_id = null }) => {
      return request('/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, message, type, user_id }),
      })
    },

    delete: async (id) => {
      return request(`/notifications/${id}`, {
        method: 'DELETE',
      })
    },
  },

  analytics: {
    getSummary: async () => {
      return request('/analytics/summary')
    },
  },
}

export default api
