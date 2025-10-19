import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalanceWallet,
  History,
  Person,
  People,
  Receipt,
  Logout,
  RequestPage,
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

const drawerWidth = 240

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isStudent = user && ['student', 'user'].includes(user.role)
  const isAdmin = user?.role === 'admin'
  const isManager = user?.role === 'manager'
  const hasAdminAccess = isAdmin || isManager

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = React.useMemo(() => {
    if (isStudent) {
      return [
        {
          text: 'Trang tổng quan',
          icon: <Dashboard />,
          path: '/student/dashboard',
        },
        {
          text: 'Ví của tôi',
          icon: <AccountBalanceWallet />,
          path: '/student/wallet',
        },
        {
          text: 'Lịch sử giao dịch',
          icon: <History />,
          path: '/student/transactions',
        },
        {
          text: 'Thông tin cá nhân',
          icon: <Person />,
          path: '/student/profile',
        },
      ]
    }

    if (hasAdminAccess) {
      return [
        {
          text: 'Dashboard',
          icon: <Dashboard />,
          path: '/admin/dashboard',
        },
        {
          text: 'Quản lý người dùng',
          icon: <People />,
          path: '/admin/users',
        },
        {
          text: 'Quản lý giao dịch',
          icon: <Receipt />,
          path: '/admin/transactions',
        },
        {
          text: 'Yêu cầu nạp tiền',
          icon: <RequestPage />,
          path: '/admin/topup-requests',
        },
      ]
    }

    return []
  }, [hasAdminAccess, isStudent])

  const headerTitle = isStudent
    ? 'Khu vực sinh viên'
    : hasAdminAccess
    ? 'Bảng điều khiển quản trị'
    : 'Student Wallet'

  const profilePath = isStudent
    ? '/student/profile'
    : hasAdminAccess
    ? '/admin/dashboard'
    : '/login'

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Student Wallet
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {headerTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Xin chào, {user?.profile?.firstName} {user?.profile?.lastName}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.profile?.firstName?.[0]}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem
                onClick={() => {
                  navigate(profilePath)
                  handleProfileMenuClose()
                }}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Thông tin cá nhân
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

export default MainLayout