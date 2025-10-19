import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './neumorphism.css'

const NeumorphismLogin = () => {
  const navigate = useNavigate()
  const { login, user } = useAuth()
  const cardRef = useRef(null)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === 'admin' || user.role === 'manager' 
        ? '/admin/dashboard' 
        : '/student/dashboard'
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate])

  // Ambient light effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      
      const card = cardRef.current
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      const angleX = (x - centerX) / centerX
      const angleY = (y - centerY) / centerY
      
      const shadowX = angleX * 30
      const shadowY = angleY * 30
      
      card.style.boxShadow = `
        ${shadowX}px ${shadowY}px 60px #bec3cf,
        ${-shadowX}px ${-shadowY}px 60px #ffffff
      `
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error on input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateEmail = () => {
    const email = formData.email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }))
      return false
    }
    
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
      return false
    }
    
    return true
  }

  const validatePassword = () => {
    const password = formData.password
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }))
      return false
    }
    
    if (password.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    
    if (!isEmailValid || !isPasswordValid) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await login({
        login: formData.email,
        password: formData.password
      })
      
      // Show success animation
      setShowSuccess(true)
      
      // Redirect after success animation
      setTimeout(() => {
        const redirectPath = user?.role === 'admin' || user?.role === 'manager'
          ? '/admin/dashboard'
          : '/student/dashboard'
        navigate(redirectPath)
      }, 2500)
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        password: error.response?.data?.error?.message || 'Login failed. Please try again.' 
      }))
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    console.log(`${provider} login coming soon...`)
  }

  return (
    <div className="neu-login-container">
      <div className="neu-login-card" ref={cardRef}>
        <div className={`neu-login-content ${showSuccess ? 'hide' : ''}`}>
          <div className="neu-login-header">
            <div className="neu-icon">
              <div className="icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            </div>
            <h2>Welcome back</h2>
            <p>Please sign in to continue</p>
          </div>
          
          <form className="neu-login-form" onSubmit={handleSubmit} noValidate>
            <div className={`neu-form-group ${errors.email ? 'error' : ''}`}>
              <div className="input-group neu-input">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={validateEmail}
                  required
                  autoComplete="email"
                  placeholder=" "
                />
                <label htmlFor="email">Email address</label>
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
              </div>
              {errors.email && <span className="error-message show">{errors.email}</span>}
            </div>

            <div className={`neu-form-group ${errors.password ? 'error' : ''}`}>
              <div className="input-group neu-input password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={validatePassword}
                  required
                  autoComplete="current-password"
                  placeholder=" "
                />
                <label htmlFor="password">Password</label>
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <button
                  type="button"
                  className={`password-toggle neu-toggle ${showPassword ? 'show-password' : ''}`}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <svg className="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg className="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              {errors.password && <span className="error-message show">{errors.password}</span>}
            </div>

            <div className="neu-form-options">
              <div className="remember-wrapper">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <label htmlFor="remember" className="checkbox-label">
                  <div className="neu-checkbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className={`neu-button login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              <span className="btn-text">Sign In</span>
              <div className="btn-loader">
                <div className="neu-spinner"></div>
              </div>
            </button>
          </form>

          <div className="neu-signup-link">
            <p>Don't have an account? <a href="/register">Sign up</a></p>
          </div>
        </div>

        <div className={`neu-success-message ${showSuccess ? 'show' : ''}`}>
          <div className="success-icon neu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>Success!</h3>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    </div>
  )
}

export default NeumorphismLogin
