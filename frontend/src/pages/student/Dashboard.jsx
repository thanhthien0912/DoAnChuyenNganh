import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
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
import { formatVND, formatCurrency, formatDate } from '../../utils/formatters'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
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
                    {formatVND(wallet?.balance)}
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
                    {formatVND(wallet?.dailySpent)}
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
                    {formatVND(wallet?.monthlySpent)}
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
                    {formatDate(transaction.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  color={transaction.type === 'TOPUP' ? 'success.main' : 'error.main'}
                >
                  {transaction.type === 'TOPUP' ? '+' : '-'}
                  {formatVND(transaction.amount)}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary">Chưa có giao dịch nào</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default Dashboard