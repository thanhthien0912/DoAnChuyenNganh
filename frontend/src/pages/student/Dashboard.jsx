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
} from '@mui/material'
import {
  AccountBalanceWallet,
  TrendingUp,
  Payment,
  AccountBalance,
  Notifications,
  Settings,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
  ShoppingBag,
  Fastfood,
  LocalHospital,
  Home,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { transactionAPI } from '../../services/api'
import { useSnackbar } from '../../contexts/SnackContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatVND, formatCurrency, formatDate } from '../../utils/formatters'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [timeFilter, setTimeFilter] = useState('7D')
  const { showSnackbar } = useSnackbar()
  const { wallet, refreshProfile, user } = useAuth()

  // Mock data for charts
  const chartData = [
    { name: 'T2', amount: 240000 },
    { name: 'T3', amount: 139800 },
    { name: 'T4', amount: 380000 },
    { name: 'T5', amount: 390800 },
    { name: 'T6', amount: 480000 },
    { name: 'T7', amount: 380000 },
    { name: 'CN', amount: 430000 },
  ]

  const categoryData = [
    { name: 'Xe buýt', value: 40, color: '#8B5CF6' },
    { name: 'Căn tin', value: 35, color: '#EC4899' },
    { name: 'Máy bán nước', value: 25, color: '#10B981' },
  ]

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

  const StatCard = ({ title, value, percentage, icon: Icon, color, bgColor }) => (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            <Box display="flex" alignItems="center">
              <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="body2">
                {percentage}%
              </Typography>
            </Box>
          </Box>
          <Box 
            sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <Icon sx={{ fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const CircularProgressCustom = ({ value, color, size = 80 }) => (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={6}
        sx={{ color: 'rgba(255, 255, 255, 0.1)' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={6}
        sx={{
          position: 'absolute',
          left: 0,
          color: color,
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          {`${value}%`}
        </Typography>
      </Box>
    </Box>
  )

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
              Chào, {user?.name || 'Người dùng'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Đây là tổng quan tài chính của bạn
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
        {/* Charts Row */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: '20px', p: 3, height: '400px' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Hoạt động giao dịch
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: '20px', p: 3, height: '400px' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Chi tiêu theo danh mục
              </Typography>
              <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box display="flex" flexDirection="column" gap={1} width="100%">
                  {categoryData.map((category, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={2}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: category.color 
                        }} 
                      />
                      <Typography variant="body2" flex={1}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {category.value}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions and Wallet Info */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: '20px', p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Hành động nhanh
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AttachMoney />}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Nạp tiền
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Payment />}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                    }}
                  >
                    Chuyển tiền
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountBalanceWallet />}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                    }}
                  >
                    Thanh toán
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrendingUp />}
                    sx={{
                      py: 2,
                      borderRadius: '12px',
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                    }}
                  >
                    Đầu tư
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: '20px', 
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                Ví của tôi
              </Typography>
              <Box textAlign="center" py={3}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                  Tổng số dư
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 3 }}>
                  {formatVND(wallet?.balance || 0)}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    borderRadius: '20px',
                    px: 4,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Quản lý ví
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Transactions */}
        <Card sx={{ borderRadius: '20px', p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Giao dịch gần đây
          </Typography>
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
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
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
    </Box>
  )
}

export default Dashboard