import React from 'react'
import { Container, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon } from '@mui/icons-material'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          Go to Home
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound