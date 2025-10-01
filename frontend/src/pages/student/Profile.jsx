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
} from '@mui/material'
import {
  Person,
  Email,
  Phone,
  Edit,
  Lock,
  Save,
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px',
                  backgroundColor: 'primary.main',
                  fontSize: '2.5rem',
                }}
              >
                {user?.profile?.firstName?.[0]}
              </Avatar>
              <Typography variant="h6">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {roleLabels[user?.role] || 'Người dùng'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MSSV: {user?.studentId}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  disabled={editMode}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Đổi mật khẩu
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin chi tiết
              </Typography>

              <form onSubmit={handleSubmitProfile(handleUpdateProfile)}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Mã số sinh viên"
                      value={user?.studentId || ''}
                      disabled
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
                      InputProps={{
                        startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
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
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
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
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={profileSubmitting}
                        >
                          {profileSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false)
          resetPassword()
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitPassword(handleChangePassword)} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu hiện tại"
              type="password"
              {...registerPassword('currentPassword')}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Mật khẩu mới"
              type="password"
              {...registerPassword('newPassword')}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Xác nhận mật khẩu mới"
              type="password"
              {...registerPassword('confirmNewPassword')}
              error={!!passwordErrors.confirmNewPassword}
              helperText={passwordErrors.confirmNewPassword?.message}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setPasswordDialogOpen(false)
              resetPassword()
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitPassword(handleChangePassword)}
            variant="contained"
            disabled={passwordSubmitting}
          >
            {passwordSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Profile