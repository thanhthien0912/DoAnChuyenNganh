import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
}

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

export default function TopupRequestManagement() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [totalRequests, setTotalRequests] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  
  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    fetchTopupRequests()
  }, [page, rowsPerPage, statusFilter])

  const fetchTopupRequests = async () => {
    try {
      setLoading(true)
      const params = {
        page: page + 1,
        limit: rowsPerPage,
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await adminAPI.getTopupRequests(params)
      const { requests: data, pagination } = response.data.data
      
      setRequests(data)
      setTotalRequests(pagination.total)
    } catch (error) {
      console.error('Fetch topup requests error:', error)
      showSnackbar('Không thể tải danh sách yêu cầu nạp tiền', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (request) => {
    setSelectedRequest(request)
    setApproveDialogOpen(true)
  }

  const handleRejectClick = (request) => {
    setSelectedRequest(request)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    if (!selectedRequest) return

    try {
      setActionLoading(true)
      await adminAPI.approveTopupRequest(selectedRequest.id)
      
      showSnackbar(`Đã xác nhận nạp ${formatCurrency(selectedRequest.amount)} cho ${selectedRequest.user?.studentId}`, 'success')
      setApproveDialogOpen(false)
      setSelectedRequest(null)
      fetchTopupRequests()
    } catch (error) {
      console.error('Approve request error:', error)
      const message = error.response?.data?.error?.message || 'Không thể xác nhận yêu cầu'
      showSnackbar(message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showSnackbar('Vui lòng nhập lý do từ chối', 'warning')
      return
    }

    try {
      setActionLoading(true)
      await adminAPI.rejectTopupRequest(selectedRequest.id, rejectionReason.trim())
      
      showSnackbar(`Đã từ chối yêu cầu của ${selectedRequest.user?.studentId}`, 'success')
      setRejectDialogOpen(false)
      setSelectedRequest(null)
      setRejectionReason('')
      fetchTopupRequests()
    } catch (error) {
      console.error('Reject request error:', error)
      const message = error.response?.data?.error?.message || 'Không thể từ chối yêu cầu'
      showSnackbar(message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý yêu cầu nạp tiền
        </Typography>
        <Tooltip title="Làm mới">
          <IconButton onClick={fetchTopupRequests} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(0)
                }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                <MenuItem value="REJECTED">Từ chối</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Tổng: {totalRequests} yêu cầu
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã tham chiếu</TableCell>
              <TableCell>Sinh viên</TableCell>
              <TableCell align="right">Số tiền</TableCell>
              <TableCell>Phương thức</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thời gian tạo</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">Không có yêu cầu nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {request.referenceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {request.user?.studentId || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {request.user?.fullName || request.user?.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(request.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={request.method} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABELS[request.status] || request.status}
                      color={STATUS_COLORS[request.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDateTime(request.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                      {request.note || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {request.status === 'PENDING' ? (
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Xác nhận">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveClick(request)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectClick(request)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {request.processedBy?.fullName || 'Đã xử lý'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalRequests}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </TableContainer>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onClose={() => !actionLoading && setApproveDialogOpen(false)}>
        <DialogTitle>Xác nhận nạp tiền</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xác nhận nạp <strong>{formatCurrency(selectedRequest?.amount || 0)}</strong> cho sinh viên{' '}
            <strong>{selectedRequest?.user?.studentId}</strong>?
          </DialogContentText>
          {selectedRequest?.note && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Ghi chú:</strong> {selectedRequest.note}
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button onClick={handleApproveConfirm} variant="contained" color="success" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => !actionLoading && setRejectDialogOpen(false)}>
        <DialogTitle>Từ chối yêu cầu nạp tiền</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Từ chối yêu cầu nạp <strong>{formatCurrency(selectedRequest?.amount || 0)}</strong> của sinh viên{' '}
            <strong>{selectedRequest?.user?.studentId}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do từ chối *"
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu này..."
            disabled={actionLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={actionLoading}>
            Hủy
          </Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
