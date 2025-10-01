import React from 'react'
import { Container, Box, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const AuthLayout = ({ children }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.primary.main }}
          >
            Student Wallet
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
            Ví điện tử dành cho sinh viên
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  )
}

export default AuthLayout