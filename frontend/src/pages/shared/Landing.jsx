import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
} from '@mui/material'
import {
  AccountBalanceWallet,
  Smartphone,
  Security,
  Speed,
  School,
} from '@mui/icons-material'

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
      title: 'Ví điện tử thông minh',
      description: 'Quản lý tài chính cá nhân một cách tiện lợi và an toàn',
    },
    {
      icon: <Smartphone sx={{ fontSize: 40 }} />,
      title: 'Thanh toán NFC',
      description: 'Thanh toán không tiếp xúc nhanh chóng tại các điểm chấp nhận',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Bảo mật cao',
      description: 'Mã hóa đa lớp và xác thực sinh trắc học',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Giao dịch nhanh',
      description: 'Xử lý giao dịch tức thì 24/7',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #dc004e 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Student Wallet
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Ví điện tử dành riêng cho sinh viên - Nền tảng thanh toán hiện đại, tiện lợi và an toàn
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ backgroundColor: 'white', color: 'primary' }}
            >
              Đăng nhập
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white' } }}
            >
              Đăng ký
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Tính năng nổi bật
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Trải nghiệm ví điện tử thông minh với đầy đủ tính năng dành cho sinh viên
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', py: 3 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Demo Section */}
      <Box sx={{ backgroundColor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Thử nghiệm ngay
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Sử dụng tài khoản demo để trải nghiệm toàn bộ tính năng
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 64, height: 64, margin: '0 auto 16px', backgroundColor: 'secondary.main' }}>
                    <School />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Tài khoản Admin
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quản lý hệ thống và người dùng
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                    admin@hutech.edu.vn / admin123
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button variant="contained" onClick={() => navigate('/login')}>
                    Đăng nhập Admin
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center' }}>
                <CardContent>
                  <Avatar sx={{ width: 64, height: 64, margin: '0 auto 16px', backgroundColor: 'primary.main' }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    Tài khoản Student
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Trải nghiệm ví và thanh toán
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                    student1@hutech.edu.vn / student123
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button variant="contained" onClick={() => navigate('/login')}>
                    Đăng nhập Student
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default Landing