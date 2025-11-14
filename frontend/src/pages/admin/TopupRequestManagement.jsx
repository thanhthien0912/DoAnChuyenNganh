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
  Avatar,
  Grid,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AttachMoney,
  Notifications,
  FilterList,
  Security,
  CreditCard,
  Payment,
  Contactless,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'

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
              Quản lý yêu cầu nạp tiền
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Xử lý và duyệt các yêu cầu nạp tiền từ người dùng
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
            <Tooltip title="Làm mới">
              <IconButton 
                onClick={fetchTopupRequests} 
                disabled={loading}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton sx={{ color: 'white' }}>
              <Notifications />
            </IconButton>
            <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 40, height: 40 }}>
              A
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
                Tổng yêu cầu
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {totalRequests}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Chờ duyệt
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {requests.filter(r => r.status === 'PENDING').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Đã duyệt
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {requests.filter(r => r.status === 'APPROVED').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Từ chối
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {requests.filter(r => r.status === 'REJECTED').length}
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
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="PENDING">Chờ duyệt</MenuItem>
                  <MenuItem value="APPROVED">Đã duyệt</MenuItem>
                  <MenuItem value="REJECTED">Từ chối</MenuItem>
                  <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" justifyContent="flex-end">
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {requests.length} / {totalRequests} yêu cầu
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Requests Table */}
        <Card sx={{ borderRadius: '20px', p: 3 }}>
          <CardContent>
            {loading ? (
              <Box display="flex" justifyContent="center" p={6}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sinh viên</TableCell>
                        <TableCell>Mã tham chiếu</TableCell>
                        <TableCell align="right">Số tiền</TableCell>
                        <TableCell>Phương thức</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Thời gian tạo</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary" py={3}>
                              Không có yêu cầu nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        requests.map((request) => (
                          <TableRow key={request.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)' } }}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#8B5CF6', width: 40, height: 40 }}>
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {request.user?.fullName || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {request.user?.studentId || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace',
                                  bgcolor: 'rgba(139, 92, 246, 0.1)', 
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: 1,
                                  display: 'inline-block'
                                }}
                              >
                                {request.referenceNumber}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="#10B981">
                                {formatCurrency(request.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                icon={<Payment />}
                                label={request.method} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderRadius: '12px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={STATUS_LABELS[request.status] || request.status}
                                color={STATUS_COLORS[request.status] || 'default'}
                                size="small"
                                sx={{ borderRadius: '12px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDateTime(request.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {request.status === 'PENDING' ? (
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  <Tooltip title="Xác nhận">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleApproveClick(request)}
                                      sx={{
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10B981',
                                        borderRadius: '8px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                                        }
                                      }}
                                    >
                                      <ApproveIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Từ chối">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRejectClick(request)}
                                      sx={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        color: '#EF4444',
                                        borderRadius: '8px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                        }
                                      }}
                                    >
                                      <RejectIcon fontSize="small" />
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
                </TableContainer>

                <TablePagination
                  component="div"
                  count={totalRequests}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  labelRowsPerPage="Số dòng mỗi trang:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong tổng số ${count}`}
                  sx={{
                    '.MuiTablePagination-select': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Approve Dialog */}
      <Dialog 
        open={approveDialogOpen} 
        onClose={() => !actionLoading && setApproveDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setApproveDialogOpen(false)} 
            disabled={actionLoading}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleApproveConfirm} 
            variant="contained" 
            color="success" 
            disabled={actionLoading}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => !actionLoading && setRejectDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
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
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)} 
            disabled={actionLoading}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            variant="contained" 
            color="error" 
            disabled={actionLoading}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            }}
          >
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
