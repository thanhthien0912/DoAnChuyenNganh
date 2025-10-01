import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const SnackContext = createContext()

export const useSnackbar = () => {
  const context = useContext(SnackContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackProvider')
  }
  return context
}

export const SnackProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  })

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const hideSnackbar = () => {
    setSnackbar({
      open: false,
      message: '',
      severity: 'info',
    })
  }

  return (
    <SnackContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackContext.Provider>
  )
}