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
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Payment,
  AttachMoney,
  Notifications,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  CreditCard,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    userId: '',
    startDate: '',
    endDate: '',
  })
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { showSnackbar } = useSnackbar()
  const { user } = useAuth()

  useEffect(() => {
    loadTransactions()
  }, [page, rowsPerPage, filters])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      }

      const response = await adminAPI.getAllTransactions(params)
      setTransactions(response.data.data.transactions || [])
    } catch (error) {
      showSnackbar('Không thể tải danh sách giao dịch', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleFilterChange = (field) => (event) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
    setPage(0)
  }

  const handleStatusDialogOpen = (transaction) => {
    setSelectedTransaction(transaction)
    setNewStatus(transaction.status)
    setStatusDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    try {
      await adminAPI.updateTransactionStatus(selectedTransaction._id, {
        status: newStatus,
      })
      showSnackbar('Cập nhật trạng thái thành công!', 'success')
      setStatusDialogOpen(false)
      loadTransactions()
    } catch (error) {
      showSnackbar('Cập nhật trạng thái thất bại', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'topup':
        return 'success'
      case 'payment':
        return 'error'
      case 'refund':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatAmount = (amount, type) => {
    const sign = type?.toLowerCase() === 'topup' ? '+' : '-'
    return `${sign}${amount?.toLocaleString('vi-VN')} VND`
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.userId?.studentId && transaction.userId.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.userId?.profile?.firstName && transaction.userId.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.userId?.profile?.lastName && transaction.userId.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = filters.type === '' || transaction.type === filters.type
    const matchesStatus = filters.status === '' || transaction.status === filters.status
    
    return matchesSearch && matchesType && matchesStatus
  })

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
              Quản lý giao dịch
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Giám sát và quản lý tất cả giao dịch trong hệ thống
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
                Tổng giao dịch
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {transactions.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Giao dịch thành công
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {transactions.filter(t => t.status === 'COMPLETED').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Đang xử lý
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {transactions.filter(t => t.status === 'PENDING').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Giao dịch thất bại
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {transactions.filter(t => t.status === 'FAILED').length}
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo mã giao dịch, mô tả, người dùng..."
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
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Loại giao dịch"
                value={filters.type}
                onChange={handleFilterChange('type')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="topup">Nạp tiền</MenuItem>
                <MenuItem value="payment">Thanh toán</MenuItem>
                <MenuItem value="refund">Hoàn tiền</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Trạng thái"
                value={filters.status}
                onChange={handleFilterChange('status')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="completed">Hoàn thành</MenuItem>
                <MenuItem value="pending">Đang xử lý</MenuItem>
                <MenuItem value="failed">Thất bại</MenuItem>
                <MenuItem value="cancelled">Đã hủy</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange('endDate')}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Transactions Table */}
        <Card sx={{ borderRadius: '20px', p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Giao dịch</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#8B5CF6', width: 40, height: 40 }}>
                            <Payment />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {transaction.referenceNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.userId?.studentId || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {transaction.userId?.profile?.firstName} {transaction.userId?.profile?.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={getTypeColor(transaction.type)}
                          size="small"
                          sx={{ borderRadius: '12px' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={transaction.type === 'TOPUP' ? 'success.main' : 'error.main'}
                        >
                          {formatAmount(transaction.amount, transaction.type)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status)}
                          size="small"
                          sx={{ borderRadius: '12px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleStatusDialogOpen(transaction)}
                          sx={{
                            borderRadius: '12px',
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                          }}
                        >
                          Cập nhật trạng thái
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Không có giao dịch nào
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
            count={filteredTransactions.length}
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

      {/* Status Update Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => setStatusDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle>Cập nhật trạng thái giao dịch</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Giao dịch: {selectedTransaction?.referenceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Số tiền: {selectedTransaction && formatAmount(selectedTransaction.amount, selectedTransaction.type)}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Trạng thái mới</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Trạng thái mới"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                <MenuItem value="PENDING">Đang xử lý</MenuItem>
                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                <MenuItem value="FAILED">Thất bại</MenuItem>
                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setStatusDialogOpen(false)}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TransactionManagement