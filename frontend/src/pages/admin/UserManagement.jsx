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
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Person,
  Email,
  Phone,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
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
  const { showSnackbar } = useSnackbar()

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
    if (window.confirm('Bạn có chắc muốn vô hiệu hóa người dùng này?')) {
      try {
        await adminAPI.deactivateUser(userId)
        showSnackbar('Vô hiệu hóa người dùng thành công!', 'success')
        loadUsers()
      } catch (error) {
        showSnackbar('Vô hiệu hóa người dùng thất bại', 'error')
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Quản lý người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Thêm người dùng
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Avatar</TableCell>
                <TableCell>MSSV</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>SĐT</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.profile.firstName?.[0]}
                      </Avatar>
                    </TableCell>
                    <TableCell>{user.studentId}</TableCell>
                    <TableCell>
                      {user.profile.firstName} {user.profile.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.profile.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? 'Quản trị viên' : 'Sinh viên'}
                        color={user.role === 'admin' ? 'secondary' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                        color={user.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleDeactivateUser(user._id)}
                        disabled={!user.isActive}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">
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
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>

      {/* Create/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(handleCreateUser)} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mã số sinh viên"
                  {...register('studentId')}
                  error={!!errors.studentId}
                  helperText={errors.studentId?.message}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ"
                  {...register('profile.firstName')}
                  error={!!errors.profile?.firstName}
                  helperText={errors.profile?.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên"
                  {...register('profile.lastName')}
                  error={!!errors.profile?.lastName}
                  helperText={errors.profile?.lastName?.message}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  {...register('profile.phone')}
                  error={!!errors.profile?.phone}
                  helperText={errors.profile?.phone?.message}
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
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Hủy</Button>
          <Button
            onClick={handleSubmit(handleCreateUser)}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement