import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Person,
  Email,
  Phone,
  Edit,
  Lock,
  Save,
  Notifications,
  Security,
  LocationOn,
  School,
  Badge,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../contexts/AuthContext'

const profileSchema = yup.object().shape({
  'profile.firstName': yup.string().required('Họ là bắt buộc'),
  'profile.lastName': yup.string().required('Tên là bắt buộc'),
  'profile.phone': yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  'profile.address': yup.string(),
})

const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
    ),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu mới là bắt buộc'),
})

const Profile = () => {
  const [editMode, setEditMode] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const { user, updateProfile, changePassword } = useAuth()
  const roleLabels = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    student: 'Sinh viên',
    user: 'Người dùng',
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'manager':
        return 'warning'
      case 'student':
        return 'primary'
      default:
        return 'default'
    }
  }

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      'profile.firstName': user?.profile?.firstName || '',
      'profile.lastName': user?.profile?.lastName || '',
      'profile.phone': user?.profile?.phone || '',
      'profile.address': user?.profile?.address || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  })

  const handleUpdateProfile = async (data) => {
    const result = await updateProfile(data)
    if (result.success) {
      setEditMode(false)
    }
  }

  const handleChangePassword = async (data) => {
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })

    if (result.success) {
      setPasswordDialogOpen(false)
      resetPassword()
    }
  }

  const handleCancelEdit = () => {
    reset({
      'profile.firstName': user?.profile?.firstName || '',
      'profile.lastName': user?.profile?.lastName || '',
      'profile.phone': user?.profile?.phone || '',
      'profile.address': user?.profile?.address || '',
    })
    setEditMode(false)
  }

  useEffect(() => {
    reset({
      'profile.firstName': user?.profile?.firstName || '',
      'profile.lastName': user?.profile?.lastName || '',
      'profile.phone': user?.profile?.phone || '',
      'profile.address': user?.profile?.address || '',
    })
  }, [user, reset])

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3,
          borderRadius: { xs: 0, md: '0 0 30px 30px' }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              Thông tin cá nhân
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Quản lý thông tin và cài đặt tài khoản
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton sx={{ color: 'white' }}>
              <Notifications />
            </IconButton>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              {user?.profile?.firstName?.[0] || user?.name?.[0] || 'U'}
            </Avatar>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '20px', overflow: 'hidden' }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '2rem',
                  }}
                >
                  {user?.profile?.firstName?.[0] || user?.name?.[0] || 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </Typography>
                <Chip
                  label={roleLabels[user?.role] || 'Người dùng'}
                  color={getRoleColor(user?.role)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <School sx={{ fontSize: 16, color: '#8B5CF6' }} />
                    <Typography variant="body2" color="text.secondary">
                      MSSV: {user?.studentId || 'N/A'}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                    <Email sx={{ fontSize: 16, color: '#8B5CF6' }} />
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    disabled={editMode}
                    sx={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: '20px', p: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Person sx={{ mr: 1, color: '#8B5CF6' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Thông tin chi tiết
                </Typography>
              </Box>

              <form onSubmit={handleSubmitProfile(handleUpdateProfile)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mã số sinh viên"
                      value={user?.studentId || ''}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ"
                      {...registerProfile('profile.firstName')}
                      error={!!profileErrors.profile?.firstName}
                      helperText={profileErrors.profile?.firstName?.message}
                      disabled={!editMode}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tên"
                      {...registerProfile('profile.lastName')}
                      error={!!profileErrors.profile?.lastName}
                      helperText={profileErrors.profile?.lastName?.message}
                      disabled={!editMode}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      {...registerProfile('profile.phone')}
                      error={!!profileErrors.profile?.phone}
                      helperText={profileErrors.profile?.phone?.message}
                      disabled={!editMode}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Địa chỉ"
                      {...registerProfile('profile.address')}
                      error={!!profileErrors.profile?.address}
                      helperText={profileErrors.profile?.address?.message}
                      disabled={!editMode}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                        },
                      }}
                    />
                  </Grid>

                  {editMode && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          type="button"
                          variant="outlined"
                          onClick={handleCancelEdit}
                          disabled={profileSubmitting}
                          sx={{
                            borderRadius: '12px',
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={profileSubmitting}
                          sx={{
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          {profileSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </Card>

            {/* Additional Settings Card */}
            <Card sx={{ borderRadius: '20px', p: 3, mt: 3 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <Security sx={{ mr: 1, color: '#8B5CF6' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Cài đặt bảo mật
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Lock />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                      p: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Đổi mật khẩu
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Badge />}
                    sx={{
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                      p: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Quản lý vai trò
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false)
          resetPassword()
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPassword(handleChangePassword)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu hiện tại"
              type="password"
              {...registerPassword('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type="password"
              {...registerPassword('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu mới"
              type="password"
              {...registerPassword('confirmNewPassword')}
              error={!!passwordErrors.confirmNewPassword}
              helperText={passwordErrors.confirmNewPassword?.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false)
              resetPassword()
            }}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitPassword(handleChangePassword)}
            variant="contained"
            disabled={passwordSubmitting}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {passwordSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Profile