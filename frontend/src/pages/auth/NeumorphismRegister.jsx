import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './neumorphism.css'

const NeumorphismRegister = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const cardRef = useRef(null)
  
  const [formData, setFormData] = useState({
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  })
  
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error on input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateField = (fieldName) => {
    const value = formData[fieldName]?.trim()
    
    switch (fieldName) {
      case 'studentId':
        if (!value) {
          setErrors(prev => ({ ...prev, studentId: 'Student ID is required' }))
          return false
        }
        if (value.length < 3) {
          setErrors(prev => ({ ...prev, studentId: 'Student ID must be at least 3 characters' }))
          return false
        }
        break
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value) {
          setErrors(prev => ({ ...prev, email: 'Email is required' }))
          return false
        }
        if (!emailRegex.test(value)) {
          setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
          return false
        }
        break
        
      case 'password':
        if (!value) {
          setErrors(prev => ({ ...prev, password: 'Password is required' }))
          return false
        }
        if (value.length < 6) {
          setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
          return false
        }
        break
        
      case 'confirmPassword':
        if (!value) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }))
          return false
        }
        if (value !== formData.password) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
          return false
        }
        break
        
      case 'firstName':
        if (!value) {
          setErrors(prev => ({ ...prev, firstName: 'First name is required' }))
          return false
        }
        break
        
      case 'lastName':
        if (!value) {
          setErrors(prev => ({ ...prev, lastName: 'Last name is required' }))
          return false
        }
        break
    }
    
    return true
  }

  const validateForm = () => {
    const fields = ['studentId', 'email', 'password', 'confirmPassword', 'firstName', 'lastName']
    let isValid = true
    
    fields.forEach(field => {
      if (!validateField(field)) {
        isValid = false
      }
    })
    
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Call register API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId,
          email: formData.email,
          password: formData.password,
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone || undefined
          }
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed')
      }
      
      // Show success animation
      setShowSuccess(true)
      
      // Redirect to login after success animation
      setTimeout(() => {
        navigate('/login')
      }, 2500)
      
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Registration failed. Please try again.' 
      }))
      setIsLoading(false)
    }
  }

  return (
    <div className="neu-login-container">
      <div className="neu-login-card neu-register-card" ref={cardRef}>
        <div className={`neu-login-content ${showSuccess ? 'hide' : ''}`}>
          <div className="neu-login-header">
            <div className="neu-icon">
              <div className="icon-inner">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
              </div>
            </div>
            <h2>Create Account</h2>
            <p>Sign up to get started</p>
          </div>
          
          <form className="neu-login-form" onSubmit={handleSubmit} noValidate>
            {/* Student ID */}
            <div className={`neu-form-group ${errors.studentId ? 'error' : ''}`}>
              <div className="input-group neu-input">
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={() => validateField('studentId')}
                  required
                  placeholder=" "
                />
                <label htmlFor="studentId">Student ID (MSSV)</label>
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              {errors.studentId && <span className="error-message show">{errors.studentId}</span>}
            </div>

            {/* Email */}
            <div className={`neu-form-group ${errors.email ? 'error' : ''}`}>
              <div className="input-group neu-input">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => validateField('email')}
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

            {/* First Name & Last Name */}
            <div className="neu-form-row">
              <div className={`neu-form-group ${errors.firstName ? 'error' : ''}`}>
                <div className="input-group neu-input">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => validateField('firstName')}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
                {errors.firstName && <span className="error-message show">{errors.firstName}</span>}
              </div>

              <div className={`neu-form-group ${errors.lastName ? 'error' : ''}`}>
                <div className="input-group neu-input">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => validateField('lastName')}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
                {errors.lastName && <span className="error-message show">{errors.lastName}</span>}
              </div>
            </div>

            {/* Phone (Optional) */}
            <div className="neu-form-group">
              <div className="input-group neu-input">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label htmlFor="phone">Phone (Optional)</label>
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className={`neu-form-group ${errors.password ? 'error' : ''}`}>
              <div className="input-group neu-input password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => validateField('password')}
                  required
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className={`neu-form-group ${errors.confirmPassword ? 'error' : ''}`}>
              <div className="input-group neu-input password-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => validateField('confirmPassword')}
                  required
                  autoComplete="new-password"
                  placeholder=" "
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <button
                  type="button"
                  className={`password-toggle neu-toggle ${showConfirmPassword ? 'show-password' : ''}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
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
              {errors.confirmPassword && <span className="error-message show">{errors.confirmPassword}</span>}
            </div>

            {errors.submit && (
              <div className="neu-form-group">
                <span className="error-message show">{errors.submit}</span>
              </div>
            )}

            <button type="submit" className={`neu-button login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
              <span className="btn-text">Sign Up</span>
              <div className="btn-loader">
                <div className="neu-spinner"></div>
              </div>
            </button>
          </form>

          <div className="neu-signup-link">
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </div>

        <div className={`neu-success-message ${showSuccess ? 'show' : ''}`}>
          <div className="success-icon neu-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>Success!</h3>
          <p>Account created. Redirecting to login...</p>
        </div>
      </div>
    </div>
  )
}

export default NeumorphismRegister
