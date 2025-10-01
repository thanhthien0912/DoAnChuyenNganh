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
} from '@mui/material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'

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
  const { showSnackbar } = useSnackbar()

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý giao dịch
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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
                label="User ID"
                value={filters.userId}
                onChange={handleFilterChange('userId')}
                placeholder="Tìm theo user ID"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange('startDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
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
                <TableCell>User</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{transaction.referenceNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {transaction.userId?.studentId || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.userId?.profile?.firstName} {transaction.userId?.profile?.lastName}
                        </Typography>
                      </Box>
                    </TableCell>
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
                      {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleStatusDialogOpen(transaction)}
                      >
                        Cập nhật trạng thái
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
        />
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cập nhật trạng thái giao dịch</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
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
              >
                <MenuItem value="PENDING">Đang xử lý</MenuItem>
                <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                <MenuItem value="FAILED">Thất bại</MenuItem>
                <MenuItem value="CANCELLED">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TransactionManagement