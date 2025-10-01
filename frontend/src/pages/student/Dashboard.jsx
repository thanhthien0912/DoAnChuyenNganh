import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Button,
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
  AccountBalance,
} from '@mui/icons-material'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [topupDialogOpen, setTopupDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDescription, setPaymentDescription] = useState('')
  const { showSnackbar } = useSnackbar()
  const { wallet, refreshProfile } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      await refreshProfile()

      const [statsResponse, historyResponse] = await Promise.all([
        transactionAPI.getTransactionStats(),
        transactionAPI.getTransactionHistory({ limit: 5 }),
      ])

      setStats(statsResponse.data.data.stats)
      setRecentTransactions(historyResponse.data.data.transactions)
    } catch (error) {
      showSnackbar('Không thể tải dữ liệu dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTopup = async () => {
    try {
      await transactionAPI.processTopup({
        amount: parseFloat(topupAmount),
        description: 'Nạp tiền vào ví',
      })

      showSnackbar('Nạp tiền thành công!', 'success')
      setTopupDialogOpen(false)
      setTopupAmount('')
      await loadDashboardData()
    } catch (error) {
      showSnackbar('Nạp tiền thất bại', 'error')
    }
  }

  const handlePayment = async () => {
    try {
      await transactionAPI.processPayment({
        amount: parseFloat(paymentAmount),
        description: paymentDescription || 'Thanh toán',
      })

      showSnackbar('Thanh toán thành công!', 'success')
      setPaymentDialogOpen(false)
      setPaymentAmount('')
      setPaymentDescription('')
      await loadDashboardData()
    } catch (error) {
      showSnackbar('Thanh toán thất bại', 'error')
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Wallet Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceWallet color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Số dư ví
                  </Typography>
                  <Typography variant="h5">
                    {wallet?.balance?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Spent */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Đã chi hôm nay
                  </Typography>
                  <Typography variant="h5">
                    {wallet?.dailySpent?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spent */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Đã chi tháng này
                  </Typography>
                  <Typography variant="h5">
                    {wallet?.monthlySpent?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalance color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng giao dịch
                  </Typography>
                  <Typography variant="h5">
                    {stats?.totalCount || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setTopupDialogOpen(true)}
        >
          Nạp tiền
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setPaymentDialogOpen(true)}
        >
          Thanh toán
        </Button>
      </Box>

      {/* Recent Transactions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Giao dịch gần đây
          </Typography>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <Box
                key={transaction._id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-of-type': { borderBottom: 'none' },
                }}
              >
                <Box>
                  <Typography variant="subtitle2">
                    {transaction.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={transaction.type === 'TOPUP' ? 'success.main' : 'error.main'}
                >
                  {transaction.type === 'TOPUP' ? '+' : '-'}
                  {transaction.amount?.toLocaleString('vi-VN')} VND
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">Chưa có giao dịch nào</Typography>
          )}
        </CardContent>
      </Card>

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
            inputProps={{ min: 1000, max: 10000000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopupDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleTopup} variant="contained">
            Nạp tiền
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Thanh toán</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Số tiền (VND)"
            type="number"
            fullWidth
            variant="outlined"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            inputProps={{ min: 1000, max: 10000000 }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mô tả"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentDescription}
            onChange={(e) => setPaymentDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Hủy</Button>
          <Button onClick={handlePayment} variant="contained" color="secondary">
            Thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Dashboard