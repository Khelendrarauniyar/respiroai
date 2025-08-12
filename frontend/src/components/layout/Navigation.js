import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Upload as UploadIcon,
  Analytics as AnalyticsIcon,
  People as PatientsIcon,
  Settings as SettingsIcon,
  MedicalServices as MedicalIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    handleClose();
  };

  const isCurrentPath = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AppBar position="sticky" sx={{ 
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)'
    }}>
      <Toolbar>
        {/* Logo and Title */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            mr: 4
          }}
          onClick={() => navigate(isAuthenticated ? (isAdmin() ? '/admin/dashboard' : '/dashboard') : '/')}
        >
          <HospitalIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" component="div" fontWeight="bold">
            Respiratory AI
          </Typography>
        </Box>

        {/* Navigation Links */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAdmin() ? (
              // Admin Navigation
              <>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/admin/dashboard')}
                  variant={isCurrentPath('/admin/dashboard') ? 'outlined' : 'text'}
                >
                  Dashboard
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<PatientsIcon />}
                  onClick={() => navigate('/admin/users')}
                  variant={isCurrentPath('/admin/users') ? 'outlined' : 'text'}
                >
                  Users
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/admin/analytics')}
                  variant={isCurrentPath('/admin/analytics') ? 'outlined' : 'text'}
                >
                  Analytics
                </Button>
              </>
            ) : (
              // Patient Navigation
              <>
                <Button
                  color="inherit"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate('/dashboard')}
                  variant={isCurrentPath('/dashboard') ? 'outlined' : 'text'}
                >
                  Dashboard
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<MedicalIcon />}
                  onClick={() => navigate('/patient/register')}
                  variant={isCurrentPath('/patient/register') ? 'outlined' : 'text'}
                >
                  Patient Profile
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<UploadIcon />}
                  onClick={() => navigate('/upload')}
                  variant={isCurrentPath('/upload') ? 'outlined' : 'text'}
                >
                  Upload
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/analytics')}
                  variant={isCurrentPath('/analytics') ? 'outlined' : 'text'}
                >
                  Analytics
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<PatientsIcon />}
                  onClick={() => navigate('/patient-management')}
                  variant={isCurrentPath('/patient-management') ? 'outlined' : 'text'}
                >
                  Manage Patients
                </Button>
                
                <Button
                  color="inherit"
                  startIcon={<InfoIcon />}
                  onClick={() => navigate('/about')}
                  variant={isCurrentPath('/about') ? 'outlined' : 'text'}
                >
                  About
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Authentication Section */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Role Chip */}
            <Chip
              label={user?.role?.toUpperCase()}
              size="small"
              color={isAdmin() ? 'secondary' : 'default'}
              variant="outlined"
              sx={{ 
                color: 'white', 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '& .MuiChip-label': { fontWeight: 'bold' }
              }}
            />
            
            {/* User Menu */}
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.875rem'
                  }}
                >
                  {getInitials(user?.full_name)}
                </Avatar>
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: { minWidth: 200 }
                }}
              >
                {/* User Info */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {user?.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.email}
                  </Typography>
                </Box>
                
                <Divider />
                
                {/* Profile */}
                <MenuItem onClick={() => handleMenuClick('/profile')}>
                  <ListItemIcon>
                    <ProfileIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                
                {/* Settings */}
                <MenuItem onClick={() => handleMenuClick('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                
                {/* Admin Panel (for admins) */}
                {isAdmin() && (
                  <MenuItem onClick={() => handleMenuClick('/admin/dashboard')}>
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Admin Panel</ListItemText>
                  </MenuItem>
                )}
                
                <Divider />
                
                {/* Logout */}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          // Not authenticated
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              variant={isCurrentPath('/login') ? 'outlined' : 'text'}
            >
              Login
            </Button>
            
            <Button
              color="inherit"
              startIcon={<RegisterIcon />}
              onClick={() => navigate('/register')}
              variant={isCurrentPath('/register') ? 'outlined' : 'text'}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
