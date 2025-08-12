import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  MedicalServices as MedicalIcon,
  History as HistoryIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: ''
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfileData();
    loadRecentActivity();
  }, []);

  const loadProfileData = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/profile');
      if (response && response.ok) {
        const data = await response.json();
        setProfileData(data.user);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/activity');
      if (response && response.ok) {
        const data = await response.json();
        setRecentActivity(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      
      if (response && response.ok) {
        toast.success('Profile updated successfully');
        setEditing(false);
        loadProfileData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response && response.ok) {
        toast.success('Password changed successfully');
        setPasswordDialogOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profile-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          My Profile
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    fontSize: '2rem',
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
                  }}
                >
                  {getInitials(profileData.full_name || user?.username)}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight="bold">
                    {profileData.full_name || user?.username}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    {profileData.email || user?.email}
                  </Typography>
                  <Chip 
                    label={user?.role === 'admin' ? 'Administrator' : 'Patient'} 
                    color={user?.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </Box>
                <Box>
                  {!editing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box gap={1} display="flex">
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => setEditing(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.full_name || ''}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={profileData.username || ''}
                    disabled
                    InputProps={{
                      startAdornment: <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!editing}
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={profileData.date_of_birth || ''}
                    onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                    disabled={!editing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    value={profileData.gender || ''}
                    onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profileData.address || ''}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!editing}
                    multiline
                    rows={2}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    value={profileData.emergency_contact || ''}
                    onChange={(e) => setProfileData({...profileData, emergency_contact: e.target.value})}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Security & Activity */}
          <Grid item xs={12} md={4}>
            {/* Security Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SecurityIcon />}
                onClick={() => setPasswordDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>
              
              <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                Last login: {formatDate(profileData.last_login)}
              </Alert>
            </Paper>

            {/* Recent Activity */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon>
                        <HistoryIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.description}
                        secondary={formatDate(activity.created_at)}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="text.secondary" textAlign="center">
                    No recent activity
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Profile;
