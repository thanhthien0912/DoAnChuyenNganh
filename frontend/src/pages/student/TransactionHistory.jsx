import React, { useState, useEffect, useCallback } from 'react'
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
  Avatar,
  IconButton,
  Button,
} from '@mui/material'
import {
  Fastfood,
  ShoppingBag,
  LocalHospital,
  Home,
  AttachMoney,
  Payment,
  ArrowUpward,
  ArrowDownward,
  Notifications,
  Search,
  FilterList,
} from '@mui/icons-material'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatVND, formatDate } from '../../utils/formatters'

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
  })
  const { showSnackbar } = useSnackbar()
  const { user } = useAuth()

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      
      // Loại bỏ các giá trị rỗng khỏi filters
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...cleanFilters,
      }

      console.log('Loading transactions with params:', params)
      const response = await transactionAPI.getTransactionHistory(params)
      console.log('Transaction response:', response.data)
      
      setTransactions(response.data.data.transactions)
      setPagination(response.data.data.pagination || { total: response.data.data.transactions?.length || 0, pages: 1 })
    } catch (error) {
      console.error('Transaction loading error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error
      })
      const errorMessage = error.response?.data?.error?.message || 'Không thể tải lịch sử giao dịch'
      showSnackbar(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, page, rowsPerPage, showSnackbar])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

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
    return `${sign}${formatVND(amount)}`
  }

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'food':
      case 'đồ ăn':
        return <Fastfood />
      case 'shopping':
      case 'mua sắm':
        return <ShoppingBag />
      case 'health':
      case 'y tế':
        return <LocalHospital />
      case 'home':
      case 'nhà ở':
        return <Home />
      default:
        return <Payment />
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
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
              Lịch sử giao dịch
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Xem và quản lý tất cả giao dịch của bạn
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton sx={{ color: 'white' }}>
              <Notifications />
            </IconButton>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Tổng giao dịch
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {pagination.total || 0}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Nạp tiền
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {transactions.filter(t => t.type === 'TOPUP').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Thanh toán
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {transactions.filter(t => t.type === 'PAYMENT').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Hoàn tiền
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {transactions.filter(t => t.type === 'REFUND').length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ borderRadius: '20px', p: 3, mb: 4 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <FilterList sx={{ mr: 1, color: '#8B5CF6' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Bộ lọc
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
                  <TableCell>Loại</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#8B5CF6', width: 40, height: 40 }}>
                            {getCategoryIcon(transaction.category)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.referenceNumber}
                            </Typography>
                          </Box>
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
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
            count={pagination.total || transactions.length}
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
    </Box>
  )
}

export default TransactionHistory