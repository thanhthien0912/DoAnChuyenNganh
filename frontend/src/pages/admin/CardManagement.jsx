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
} from '@mui/material'
import {
  Search,
  Delete,
  LockOpen,
  CreditCard,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Quản lý thẻ NFC
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Tìm theo MSSV, UID, tên thẻ..."
              value={search}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1, minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="LOCKED">Đã khóa</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Bảo mật</InputLabel>
              <Select
                value={lockedFilter}
                label="Bảo mật"
                onChange={handleLockedFilterChange}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="true">Đang khóa</MenuItem>
                <MenuItem value="false">Chưa khóa</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>MSSV</TableCell>
                      <TableCell>Tên sinh viên</TableCell>
                      <TableCell>UID</TableCell>
                      <TableCell>Tên thẻ</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Bảo mật</TableCell>
                      <TableCell>Ngày liên kết</TableCell>
                      <TableCell>Sử dụng cuối</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cards.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography color="textSecondary" py={3}>
                            Không có thẻ nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cards.map((card) => (
                        <TableRow key={card.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {card.user?.studentId || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {card.user?.fullName || 'N/A'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {card.user?.email || ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontFamily="monospace"
                              sx={{ 
                                bgcolor: 'grey.100', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1,
                                display: 'inline-block'
                              }}
                            >
                              {card.uid}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {card.alias || '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={card.status}
                              color={card.status === 'ACTIVE' ? 'success' : 'default'}
                              size="small"
                            />
                            {card.isPrimary && (
                              <Chip
                                label="Chính"
                                color="primary"
                                size="small"
                                sx={{ ml: 0.5 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={card.isLocked ? <CreditCard /> : <LockOpen />}
                              label={card.isLocked ? 'Đang khóa' : 'Chưa khóa'}
                              color={card.isLocked ? 'success' : 'warning'}
                              size="small"
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
                          <TableCell align="center">
                            <Box display="flex" gap={0.5} justifyContent="center">
                              {card.isLocked && (
                                <Tooltip title="Mở khóa thẻ">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => setUnlockDialog({ open: true, card })}
                                  >
                                    <LockOpen fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Xóa thẻ">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteDialog({ open: true, card })}
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
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, card: null })}>
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
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, card: null })}>Hủy</Button>
          <Button onClick={handleDeleteCard} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock Confirmation Dialog */}
      <Dialog open={unlockDialog.open} onClose={() => setUnlockDialog({ open: false, card: null })}>
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
        <DialogActions>
          <Button onClick={() => setUnlockDialog({ open: false, card: null })}>Hủy</Button>
          <Button onClick={handleUnlockCard} color="warning" variant="contained">
            Mở khóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CardManagement
