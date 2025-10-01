import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Paper,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@mui/material/styles'

const schema = yup.object().shape({
  login: yup
    .string()
    .required('Email hoặc MSSV là bắt buộc'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    const result = await login(data)

    if (result.success) {
      // Redirect based on user role
      const user = JSON.parse(localStorage.getItem('user'))
      if (user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}
          >
            Student Wallet
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
            Ví điện tử dành cho sinh viên
          </Typography>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Đăng nhập
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="login"
              label="Email hoặc MSSV"
              autoComplete="email"
              autoFocus
              {...register('login')}
              error={!!errors.login}
              helperText={errors.login?.message}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/register')
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
            <Box textAlign="center" sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Demo Accounts:
                <br />
                Admin: admin@hutech.edu.vn / admin123
                <br />
                Student: student1@hutech.edu.vn / student123
              </Typography>
            </Box>
          </Box>
      </Paper>
      </Container>
    </Box>
  )
}

export default Login