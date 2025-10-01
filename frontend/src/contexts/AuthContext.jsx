import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import { useSnackbar } from './SnackContext'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showSnackbar } = useSnackbar()

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const userStr = localStorage.getItem('user')
      const walletStr = localStorage.getItem('wallet')

      if (token && userStr) {
        try {
          setUser(JSON.parse(userStr))
          if (walletStr) {
            setWallet(JSON.parse(walletStr))
          }
        } catch (error) {
          console.error('Failed to parse user data:', error)
          localStorage.clear()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { user, tokens, wallet } = response.data.data

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // Store user data
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      setWallet(wallet)
      localStorage.setItem('wallet', JSON.stringify(wallet))

      showSnackbar('Đăng nhập thành công!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Đăng nhập thất bại'
      showSnackbar(message, 'error')
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { user, tokens, wallet } = response.data.data

      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)

      // Store user data
      setUser(user)
      localStorage.setItem('user', JSON.stringify(user))
      setWallet(wallet)
      localStorage.setItem('wallet', JSON.stringify(wallet))

      showSnackbar('Đăng ký thành công!', 'success')
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Đăng ký thất bại'
      showSnackbar(message, 'error')
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all stored data
      localStorage.clear()
      setUser(null)
      setWallet(null)
      showSnackbar('Đã đăng xuất', 'info')
    }
  }

  const refreshProfile = async () => {
    try {
      const response = await authAPI.getProfile()
      const { user: userData, wallet: walletData } = response.data.data

      setUser(userData)
      setWallet(walletData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('wallet', JSON.stringify(walletData))

      return { success: true, user: userData, wallet: walletData }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Không thể tải thông tin tài khoản'
      showSnackbar(message, 'error')
      return { success: false, message }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      const updatedUser = response.data.data.user

      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))

      showSnackbar('Cập nhật thông tin thành công!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Cập nhật thông tin thất bại'
      showSnackbar(message, 'error')
      return { success: false, message }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData)
      showSnackbar('Đổi mật khẩu thành công!', 'success')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Đổi mật khẩu thất bại'
      showSnackbar(message, 'error')
      return { success: false, message }
    }
  }

  const value = {
    user,
    wallet,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}