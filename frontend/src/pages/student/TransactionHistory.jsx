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
} from '@mui/material'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lịch sử giao dịch
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Loại giao dịch"
                value={filters.type}
                onChange={handleFilterChange('type')}
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
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã giao dịch</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thời gian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.referenceNumber}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={getTypeColor(transaction.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={transaction.type === 'TOPUP' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatAmount(transaction.amount, transaction.type)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">
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
        />
      </Paper>
    </Box>
  )
}

export default TransactionHistory