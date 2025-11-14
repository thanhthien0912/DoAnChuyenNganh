import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Avatar,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Person,
  Email,
  Phone,
  Notifications,
  Search,
  FilterList,
  School,
  Badge,
  Security,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const userSchema = yup.object().shape({
  studentId: yup.string().required('MSSV là bắt buộc'),
  email: yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
  role: yup.string().required('Vai trò là bắt buộc'),
  'profile.firstName': yup.string().required('Họ là bắt buộc'),
  'profile.lastName': yup.string().required('Tên là bắt buộc'),
  'profile.phone': yup
    .string()
    .required('Số điện thoại là bắt buộc')
    .matches(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
})

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const { showSnackbar } = useSnackbar()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(userSchema),
  })

  useEffect(() => {
    loadUsers()
  }, [page, rowsPerPage])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      }
      const response = await adminAPI.getUsers(params)
      setUsers(response.data.data.users || [])
    } catch (error) {
      showSnackbar('Không thể tải danh sách người dùng', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (data) => {
    try {
      const result = await adminAPI.createUser(data)
      if (result.status === 201) {
        showSnackbar('Tạo người dùng thành công!', 'success')
        setDialogOpen(false)
        reset()
        loadUsers()
      }
    } catch (error) {
      showSnackbar('Tạo người dùng thất bại', 'error')
    }
  }

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này? Dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục!')) {
      try {
        await adminAPI.deactivateUser(userId)
        showSnackbar('Xóa người dùng thành công!', 'success')
        loadUsers()
      } catch (error) {
        console.error('Delete user error:', error)
        showSnackbar(error.response?.data?.error?.message || 'Xóa người dùng thất bại', 'error')
      }
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingUser(null)
    reset()
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === '' || user.role === filterRole
    
    return matchesSearch && matchesRole
  })

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

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'manager':
        return 'Quản lý'
      case 'student':
        return 'Sinh viên'
      default:
        return 'Người dùng'
    }
  }

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
              Quản lý người dùng
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Quản lý và giám sát tất cả người dùng trong hệ thống
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label="Admin" 
              color="error" 
              size="small"
              sx={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                color: 'white',
                borderRadius: '20px'
              }} 
            />
            <IconButton sx={{ color: 'white' }}>
              <Notifications />
            </IconButton>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              {user?.name?.charAt(0) || 'A'}
            </Avatar>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Tổng người dùng
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {users.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Đang hoạt động
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {users.filter(u => u.isActive).length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Quản trị viên
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {users.filter(u => u.role === 'admin').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Sinh viên
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {users.filter(u => u.role === 'student').length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Card sx={{ borderRadius: '20px', p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FilterList sx={{ mr: 1, color: '#8B5CF6' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Bộ lọc và tìm kiếm
            </Typography>
          </Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo MSSV, tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#8B5CF6' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Lọc theo vai trò"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Tất cả vai trò</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="manager">Quản lý</MenuItem>
                <MenuItem value="student">Sinh viên</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              Thêm người dùng
            </Button>
          </Box>
        </Card>

        {/* Users Table */}
        <Card sx={{ borderRadius: '20px', p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>MSSV</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#8B5CF6', width: 40, height: 40 }}>
                            {user.profile.firstName?.[0] || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.profile.firstName} {user.profile.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user._id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <School sx={{ fontSize: 16, color: '#8B5CF6' }} />
                          <Typography variant="body2">
                            {user.studentId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email sx={{ fontSize: 16, color: '#8B5CF6' }} />
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Phone sx={{ fontSize: 16, color: '#8B5CF6' }} />
                          <Typography variant="body2">
                            {user.profile.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ borderRadius: '12px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                          color={user.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ borderRadius: '12px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleDeactivateUser(user._id)}
                          disabled={!user.isActive}
                          color="error"
                          sx={{ borderRadius: '8px' }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Không có người dùng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            sx={{
              '.MuiTablePagination-select': {
                borderRadius: '12px',
              },
            }}
          />
        </Card>
      </Box>

      {/* Create/Edit User Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle>
          {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(handleCreateUser)} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã số sinh viên"
                  {...register('studentId')}
                  error={!!errors.studentId}
                  helperText={errors.studentId?.message}
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
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
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
                  {...register('profile.firstName')}
                  error={!!errors.profile?.firstName}
                  helperText={errors.profile?.firstName?.message}
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
                  {...register('profile.lastName')}
                  error={!!errors.profile?.lastName}
                  helperText={errors.profile?.lastName?.message}
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
                  {...register('profile.phone')}
                  error={!!errors.profile?.phone}
                  helperText={errors.profile?.phone?.message}
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
                  select
                  label="Vai trò"
                  {...register('role')}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="student">Sinh viên</MenuItem>
                  <MenuItem value="admin">Quản trị viên</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type="password"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleDialogClose}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit(handleCreateUser)}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement