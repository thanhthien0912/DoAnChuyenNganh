import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import {
  AccountBalanceWallet,
  TrendingUp,
  Payment,
  AttachMoney,
  ArrowUpward,
  ArrowDownward,
  Fastfood,
  ShoppingBag,
  LocalHospital,
  Home,
  Notifications,
  Settings,
  QrCode,
  CreditCard,
  PhoneAndroid,
} from '@mui/icons-material'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatVND, formatCurrency, formatDate } from '../../utils/formatters'

const Wallet = () => {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [topupDialogOpen, setTopupDialogOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState('')
  const { showSnackbar } = useSnackbar()
  const { wallet, refreshProfile, user } = useAuth()

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true)
        await refreshProfile()
        await loadRecentTransactions()
      } catch (error) {
        showSnackbar('Không thể tải dữ liệu ví', 'error')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const loadRecentTransactions = async () => {
    try {
      const response = await transactionAPI.getTransactionHistory({ limit: 10 })
      setTransactions(response.data.data.transactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleTopup = async () => {
    if (!topupAmount || isNaN(topupAmount) || parseFloat(topupAmount) <= 0) {
      showSnackbar('Vui lòng nhập số tiền hợp lệ', 'error')
      return
    }

    try {
      await transactionAPI.createTopupRequest({
        amount: parseFloat(topupAmount),
        description: `Nạp tiền vào ví - ${formatVND(parseFloat(topupAmount))}`
      })
      showSnackbar('Yêu cầu nạp tiền đã được gửi thành công', 'success')
      setTopupDialogOpen(false)
      setTopupAmount('')
      loadRecentTransactions()
      refreshProfile()
    } catch (error) {
      showSnackbar('Không thể tạo yêu cầu nạp tiền', 'error')
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
              Ví của tôi
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Quản lý tài chính và giao dịch
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
        {/* Wallet Balance Card */}
        <Card sx={{ 
          borderRadius: '20px', 
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 4
        }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.8 }}>
                Tổng số dư
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                {formatVND(wallet?.balance || 0)}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<AttachMoney />}
                  onClick={() => setTopupDialogOpen(true)}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '20px',
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Nạp tiền
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Payment />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    borderRadius: '20px',
                    px: 3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Chuyển tiền
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCode />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    borderRadius: '20px',
                    px: 3,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  QR Code
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <AccountBalanceWallet sx={{ fontSize: 120, opacity: 0.3 }} />
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Quick Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Đã chi hôm nay
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
                {formatVND(wallet?.dailySpent || 0)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Đã chi tháng này
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#EC4899' }}>
                {formatVND(wallet?.monthlySpent || 0)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: '20px', p: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Tổng giao dịch
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#10B981' }}>
                {transactions.length}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Transaction History */}
        <Card sx={{ borderRadius: '20px', p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Lịch sử giao dịch
            </Typography>
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#8B5CF6',
                color: '#8B5CF6',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                }
              }}
            >
              Xem tất cả
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell align="right">Số tiền</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#8B5CF6', width: 32, height: 32 }}>
                            <Fastfood />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(transaction.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={transaction.type === 'TOPUP' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'TOPUP' ? '+' : '-'}
                          {formatVND(transaction.amount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary">Chưa có giao dịch nào</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* Topup Dialog */}
      <Dialog open={topupDialogOpen} onClose={() => setTopupDialogOpen(false)}>
        <DialogTitle>Nạp tiền vào ví</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Số tiền (VND)"
            type="number"
            fullWidth
            variant="outlined"
            value={topupAmount}
            onChange={(e) => setTopupAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopupDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleTopup} variant="contained" color="primary">
            Nạp tiền
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Wallet