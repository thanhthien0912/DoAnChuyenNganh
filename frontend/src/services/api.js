import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          })

          const { accessToken } = response.data.data.tokens
          localStorage.setItem('accessToken', accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh token fails, clear storage and redirect to login
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
}

// Transaction API
export const transactionAPI = {
  processPayment: (paymentData) => api.post('/transactions/payment', paymentData),
  processTopup: (topupData) => api.post('/transactions/topup', topupData),
  getTransactionHistory: (params) => api.get('/transactions/history', { params }),
  getTransactionStats: (params) => api.get('/transactions/stats', { params }),
  getTransactionByReference: (referenceNumber) => api.get(`/transactions/reference/${referenceNumber}`),
}

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deactivateUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllTransactions: (params) => api.get('/transactions/admin/all', { params }),
  processRefund: (refundData) => api.post('/transactions/admin/refund', refundData),
  updateTransactionStatus: (transactionId, statusData) => api.put(`/transactions/admin/${transactionId}/status`, statusData),
  getDashboardStats: () => api.get('/transactions/admin/dashboard-stats'),
  // Topup request management
  getTopupRequests: (params) => api.get('/admin/topup-requests', { params }),
  getPendingTopupCount: () => api.get('/admin/topup-requests/pending/count'),
  approveTopupRequest: (requestId) => api.put(`/admin/topup-requests/${requestId}/approve`),
  rejectTopupRequest: (requestId, reason) => api.put(`/admin/topup-requests/${requestId}/reject`, { reason }),
}

export default api