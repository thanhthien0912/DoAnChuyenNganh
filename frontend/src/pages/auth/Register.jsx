import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Link,
  CircularProgress,
  Paper,
  Container,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '@mui/material/styles'

const schema = yup.object().shape({
  studentId: yup
    .string()
    .required('MSSV là bắt buộc'),
  email: yup
    .string()
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(3, 'Mật khẩu phải có ít nhất 3 ký tự'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
  'profile.firstName': yup
    .string(),
  'profile.lastName': yup
    .string(),
  'profile.phone': yup
    .string(),
})

const Register = () => {
  const [loading, setLoading] = useState(false)
  const { register: registerUser } = useAuth()
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
    const result = await registerUser(data)

    if (result.success) {
      // Wait a bit for localStorage to be updated
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'))
        if (user.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/student/dashboard')
        }
      }, 100)
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
            Đăng ký
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="studentId"
                  label="Mã số sinh viên"
                  {...register('studentId')}
                  error={!!errors.studentId}
                  helperText={errors.studentId?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="profile.firstName"
                  label="Họ"
                  {...register('profile.firstName')}
                  error={!!errors.profile?.firstName}
                  helperText={errors.profile?.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="profile.lastName"
                  label="Tên"
                  {...register('profile.lastName')}
                  error={!!errors.profile?.lastName}
                  helperText={errors.profile?.lastName?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="profile.phone"
                  label="Số điện thoại"
                  {...register('profile.phone')}
                  error={!!errors.profile?.phone}
                  helperText={errors.profile?.phone?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Box textAlign="center">
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
      </Paper>
      </Container>
    </Box>
  )
}

export default Register