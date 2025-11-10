import React, { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  LinearProgress,
} from '@mui/material'
import {
  People,
  TrendingUp,
  Payment,
  ArrowUpward,
  ArrowDownward,
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

  const calculateMonthlyRevenue = () => {
    // Tính toán doanh thu tháng dựa trên dữ liệu hôm nay x 30 (ước tính)
    const todayRevenue = stats?.todayStats?.totalVolume || 0;
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const currentDay = currentDate.getDate();
    
    // Tính doanh thu trung bình mỗi ngày và nhân với số ngày trong tháng
    const averageDailyRevenue = currentDay > 0 ? todayRevenue / currentDay : 0;
    return Math.round(averageDailyRevenue * daysInMonth);
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
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
          Tổng quan về hệ thống
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Tổng người dùng
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.systemStats?.totalUsers || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Hoạt động</Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <People sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Transactions */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Giao dịch hôm nay
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.todayStats?.totalTransactions || 0}
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Thống kê</Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <Payment sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Volume */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Doanh thu hôm nay
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {(stats?.todayStats?.totalVolume || 0).toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    VNĐ
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <TrendingUp sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
            }}
          >
            <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Doanh thu tháng này
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {calculateMonthlyRevenue().toLocaleString('vi-VN')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    VNĐ
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 56, height: 56 }}>
                  <TrendingUp sx={{ fontSize: 30 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Thống kê giao dịch hôm nay
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Thanh toán
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {stats?.todayStats?.totalPayments || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Doanh thu thanh toán
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {(stats?.todayStats?.paymentVolume || 0).toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats?.todayStats?.paymentVolume ? (stats.todayStats.paymentVolume / (stats.todayStats.totalVolume || 1)) * 100 : 0}
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200'
                }}
                color="error"
              />
            </Box>
            
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Nạp tiền
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {stats?.todayStats?.totalTopups || 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="textSecondary">
                  Tiền nạp vào
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {(stats?.todayStats?.topupVolume || 0).toLocaleString('vi-VN')} VNĐ
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats?.todayStats?.topupVolume ? (stats.todayStats.topupVolume / (stats.todayStats.totalVolume || 1)) * 100 : 0}
                sx={{ 
                  mt: 2, 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'grey.200'
                }}
                color="success"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Phân loại giao dịch
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                  Tổng giao dịch
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {stats?.todayStats?.totalTransactions || 0}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={100}
                sx={{ 
                  height: 20, 
                  borderRadius: 10,
                  backgroundColor: 'grey.200'
                }}
                color="primary"
              />
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: 1, mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Thanh toán
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {stats?.todayStats?.totalPayments || 0}
              </Typography>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 1, mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Nạp tiền
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {stats?.todayStats?.totalTopups || 0}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdminDashboard