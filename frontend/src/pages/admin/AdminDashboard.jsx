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
  People,
  AccountBalanceWallet,
  TrendingUp,
  Payment,
} from '@mui/icons-material'
import { adminAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats()
      setStats(response.data.data)
    } catch (error) {
      showSnackbar('Không thể tải dữ liệu dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  const { showSnackbar } = useSnackbar()

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
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h5">
                    {stats?.systemStats?.totalUsers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Wallets */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceWallet color="secondary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Tổng ví
                  </Typography>
                  <Typography variant="h5">
                    {stats?.systemStats?.totalWallets || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Transactions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Payment color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Giao dịch hôm nay
                  </Typography>
                  <Typography variant="h5">
                    {stats?.todayStats?.totalTransactions || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Volume */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Doanh thu hôm nay
                  </Typography>
                  <Typography variant="h5">
                    {stats?.todayStats?.totalVolume?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê giao dịch hôm nay
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography color="textSecondary">Thanh toán</Typography>
                  <Typography variant="h6">
                    {stats?.todayStats?.totalPayments || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Nạp tiền</Typography>
                  <Typography variant="h6">
                    {stats?.todayStats?.totalTopups || 0}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary">Doanh thu thanh toán</Typography>
                  <Typography variant="h6">
                    {stats?.todayStats?.paymentVolume?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Tiền nạp vào</Typography>
                  <Typography variant="h6">
                    {stats?.todayStats?.topupVolume?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin hệ thống
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography color="textSecondary">Tổng số dư ví</Typography>
                  <Typography variant="h6">
                    {stats?.systemStats?.totalBalance?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
                <Box>
                  <Typography color="textSecondary">Số dư trung bình</Typography>
                  <Typography variant="h6">
                    {stats?.systemStats?.averageBalance?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard