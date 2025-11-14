import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Avatar,
  Grid,
} from '@mui/material'
import {
  Search,
  Delete,
  LockOpen,
  CreditCard,
  Notifications,
  FilterList,
  School,
  Person,
  Security,
  Contactless,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../utils/formatters'

const CardManagement = () => {
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [lockedFilter, setLockedFilter] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, card: null })
  const [unlockDialog, setUnlockDialog] = useState({ open: false, card: null })
  const { showSnackbar } = useSnackbar()
  const { user } = useAuth()

  useEffect(() => {
    loadCards()
  }, [pagination.page, pagination.limit, search, statusFilter, lockedFilter])

  const loadCards = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
      }
      
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (lockedFilter !== '') params.isLocked = lockedFilter

      const response = await adminAPI.getCards(params)
      setCards(response.data.data.cards)
      setPagination({
        ...pagination,
        total: response.data.data.pagination.total,
        totalPages: response.data.data.pagination.totalPages,
      })
    } catch (error) {
      showSnackbar(error.response?.data?.error?.message || 'Không thể tải danh sách thẻ', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPagination({ ...pagination, page: 0 })
  }

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value)
    setPagination({ ...pagination, page: 0 })
  }

  const handleLockedFilterChange = (e) => {
    setLockedFilter(e.target.value)
    setPagination({ ...pagination, page: 0 })
  }

  const handleDeleteCard = async () => {
    try {
      await adminAPI.deleteCard(deleteDialog.card.id)
      showSnackbar('Đã xóa thẻ thành công', 'success')
      setDeleteDialog({ open: false, card: null })
      loadCards()
    } catch (error) {
      showSnackbar(error.response?.data?.error?.message || 'Không thể xóa thẻ', 'error')
    }
  }

  const handleUnlockCard = async () => {
    try {
      await adminAPI.unlockCard(unlockDialog.card.id)
      showSnackbar('Đã mở khóa thẻ thành công', 'success')
      setUnlockDialog({ open: false, card: null })
      loadCards()
    } catch (error) {
      showSnackbar(error.response?.data?.error?.message || 'Không thể mở khóa thẻ', 'error')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
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
              Quản lý thẻ NFC
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Quản lý và giám sát tất cả thẻ NFC trong hệ thống
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
                Tổng thẻ
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {cards.length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Thẻ đang hoạt động
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {cards.filter(c => c.status === 'ACTIVE').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Thẻ bị khóa
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {cards.filter(c => c.status === 'LOCKED').length}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Thẻ chính
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EF4444' }}>
                {cards.filter(c => c.isPrimary).length}
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm theo MSSV, UID, tên thẻ..."
                value={search}
                onChange={handleSearchChange}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={handleStatusFilterChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="LOCKED">Đã khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Bảo mật</InputLabel>
                <Select
                  value={lockedFilter}
                  label="Bảo mật"
                  onChange={handleLockedFilterChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="true">Đang khóa</MenuItem>
                  <MenuItem value="false">Chưa khóa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Cards Table */}
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
                        <TableCell>Thẻ</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Bảo mật</TableCell>
                        <TableCell>Ngày liên kết</TableCell>
                        <TableCell>Sử dụng cuối</TableCell>
                        <TableCell align="right">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary" py={3}>
                              Không có thẻ nào
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        cards.map((card) => (
                          <TableRow key={card.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.04)' } }}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#8B5CF6', width: 40, height: 40 }}>
                                  <School />
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {card.user?.fullName || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {card.user?.studentId || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {card.alias || 'Thẻ ' + card.uid.slice(-8)}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontFamily: 'monospace',
                                    bgcolor: 'rgba(139, 92, 246, 0.1)', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1,
                                    display: 'inline-block'
                                  }}
                                >
                                  {card.uid}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" gap={1}>
                                <Chip
                                  label={card.status}
                                  color={card.status === 'ACTIVE' ? 'success' : 'default'}
                                  size="small"
                                  sx={{ borderRadius: '12px' }}
                                />
                                {card.isPrimary && (
                                  <Chip
                                    label="Chính"
                                    color="primary"
                                    size="small"
                                    sx={{ borderRadius: '12px' }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={card.isLocked ? <Security /> : <Contactless />}
                                label={card.isLocked ? 'Đang khóa' : 'Chưa khóa'}
                                color={card.isLocked ? 'warning' : 'success'}
                                size="small"
                                sx={{ borderRadius: '12px' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(card.linkedAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(card.lastUsedAt)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Box display="flex" gap={1} justifyContent="flex-end">
                                {card.isLocked && (
                                  <Tooltip title="Mở khóa thẻ">
                                    <IconButton
                                      size="small"
                                      onClick={() => setUnlockDialog({ open: true, card })}
                                      sx={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: '#F59E0B',
                                        borderRadius: '8px',
                                        '&:hover': {
                                          backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                        }
                                      }}
                                    >
                                      <LockOpen fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Xóa thẻ">
                                  <IconButton
                                    size="small"
                                    onClick={() => setDeleteDialog({ open: true, card })}
                                    sx={{
                                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                      color: '#EF4444',
                                      borderRadius: '8px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                      }
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={pagination.total}
                  page={pagination.page}
                  onPageChange={(e, newPage) => setPagination({ ...pagination, page: newPage })}
                  rowsPerPage={pagination.limit}
                  onRowsPerPageChange={(e) =>
                    setPagination({ ...pagination, limit: parseInt(e.target.value), page: 0 })
                  }
                  rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, card: null })}
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle>Xác nhận xóa thẻ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thẻ <strong>{deleteDialog.card?.uid}</strong> của sinh viên{' '}
            <strong>{deleteDialog.card?.user?.fullName}</strong> (MSSV: {deleteDialog.card?.user?.studentId})?
            <br />
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, card: null })}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteCard} 
            color="error" 
            variant="contained"
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock Confirmation Dialog */}
      <Dialog 
        open={unlockDialog.open} 
        onClose={() => setUnlockDialog({ open: false, card: null })}
        PaperProps={{
          sx: {
            borderRadius: '20px',
          },
        }}
      >
        <DialogTitle>Xác nhận mở khóa thẻ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn mở khóa thẻ <strong>{unlockDialog.card?.uid}</strong> của sinh viên{' '}
            <strong>{unlockDialog.card?.user?.fullName}</strong> (MSSV: {unlockDialog.card?.user?.studentId})?
            <br />
            <br />
            Sau khi mở khóa, thẻ có thể được ghi đè hoặc cập nhật.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setUnlockDialog({ open: false, card: null })}
            sx={{
              borderRadius: '12px',
              borderColor: '#8B5CF6',
              color: '#8B5CF6',
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleUnlockCard} 
            color="warning" 
            variant="contained"
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            }}
          >
            Mở khóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CardManagement
