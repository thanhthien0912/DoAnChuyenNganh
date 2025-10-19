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
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  AccountBalanceWallet,
  TrendingUp,
  Payment,
  AccountBalance,
  Add,
  Remove,
} from '@mui/icons-material'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatVND, formatCurrency, formatDate } from '../../utils/formatters'

const Wallet = () => {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [topupDialogOpen, setTopupDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [topupAmount, setTopupAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDescription, setPaymentDescription] = useState('')
  const { showSnackbar } = useSnackbar()
  const { wallet, refreshProfile } = useAuth()

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
    try {
      await transactionAPI.processTopup({
        amount: parseFloat(topupAmount),
        description: 'Nạp tiền vào ví',
      })

      showSnackbar('Nạp tiền thành công!', 'success')
      setTopupDialogOpen(false)
      setTopupAmount('')

      // Reload wallet data
      await refreshProfile()
      await loadRecentTransactions()
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

      // Reload wallet data
      await refreshProfile()
      await loadRecentTransactions()
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
        Ví của tôi
      </Typography>

      <Grid container spacing={3}>
        {/* Wallet Balance */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWallet sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2">Số dư hiện tại</Typography>
                  <Typography variant="h4">
                    {formatVND(wallet?.balance)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Spent */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Đã chi hôm nay
                  </Typography>
                  <Typography variant="h5">
                    {formatVND(wallet?.dailySpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giới hạn: {formatVND(wallet?.dailyLimit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Spent */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Đã chi tháng này
                  </Typography>
                  <Typography variant="h5">
                    {formatVND(wallet?.monthlySpent)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giới hạn: {formatVND(wallet?.monthlyLimit)}
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
          startIcon={<Add />}
          onClick={() => setTopupDialogOpen(true)}
        >
          Nạp tiền
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<Remove />}
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
          <List>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <React.Fragment key={transaction._id}>
                  <ListItem>
                    <ListItemText
                      primary={transaction.description}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              transaction.type === 'TOPUP' ? 'success.main' : 'error.main'
                            }
                          >
                            {transaction.type === 'TOPUP' ? '+' : '-'}
                            {formatVND(transaction.amount)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transactions.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Chưa có giao dịch nào" />
              </ListItem>
            )}
          </List>
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

export default Wallet