import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Slider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Download as ExportIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeIcon,
  Brightness6 as BrightnessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, makeAuthenticatedRequest, token, getAuthHeaders } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      reportReady: true,
      systemUpdates: true,
      securityAlerts: true
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      profileVisibility: 'private'
    },
    system: {
      autoLogout: 30,
      sessionTimeout: 60,
      enableLogging: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    total: 100,
    files: 0
  });

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/settings');
      if (response && response.ok) {
        const data = await response.json();
        setSettings(prevSettings => ({ ...prevSettings, ...data.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/storage-info');
      if (response && response.ok) {
        const data = await response.json();
        setStorageUsage(data);
      }
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({ settings })
      });
      
      if (response && response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/auth/export-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
        setExportDialogOpen(false);
      } else {
        toast.error('Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('/auth/delete-account', {
        method: 'DELETE'
      });
      
      if (response && response.ok) {
        toast.success('Account deletion initiated');
        setDeleteDialogOpen(false);
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <div className="settings-container">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Settings
          </Typography>
          <Button
            variant="contained"
            onClick={saveSettings}
            disabled={loading}
            startIcon={<SettingsIcon />}
          >
            Save Settings
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                title="Notifications"
                avatar={<NotificationsIcon color="primary" />}
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Push Notifications" secondary="Browser push notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => updateSetting('notifications', 'push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="SMS Notifications" secondary="Text message notifications" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => updateSetting('notifications', 'sms', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Report Ready" secondary="Notify when analysis is complete" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.reportReady}
                        onChange={(e) => updateSetting('notifications', 'reportReady', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Privacy & Security */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                title="Privacy & Security"
                avatar={<SecurityIcon color="primary" />}
              />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Data Sharing" 
                      secondary="Share anonymized data for research" 
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => updateSetting('privacy', 'dataSharing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Analytics Tracking" 
                      secondary="Help improve the service" 
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.analyticsTracking}
                        onChange={(e) => updateSetting('privacy', 'analyticsTracking', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>Session Management</Typography>
                  <Box mb={2}>
                    <Typography gutterBottom>Auto Logout (minutes)</Typography>
                    <Slider
                      value={settings.system.autoLogout}
                      onChange={(e, value) => updateSetting('system', 'autoLogout', value)}
                      min={5}
                      max={120}
                      step={5}
                      marks={[
                        { value: 5, label: '5m' },
                        { value: 30, label: '30m' },
                        { value: 60, label: '1h' },
                        { value: 120, label: '2h' }
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Storage & Data */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardHeader
                title="Storage & Data"
                avatar={<StorageIcon color="primary" />}
              />
              <CardContent>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Storage Usage
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box flex={1}>
                      <Box 
                        sx={{ 
                          height: 8, 
                          backgroundColor: '#e0e0e0', 
                          borderRadius: 4,
                          overflow: 'hidden'
                        }}
                      >
                        <Box 
                          sx={{ 
                            height: '100%', 
                            backgroundColor: '#2196f3',
                            width: `${(storageUsage.used / storageUsage.total) * 100}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2">
                      {storageUsage.used}MB / {storageUsage.total}MB
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {storageUsage.files} files stored
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" flex="column" gap={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={() => setExportDialogOpen(true)}
                  >
                    Export My Data
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* System Information */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardHeader
                title="System Information"
                avatar={<InfoIcon color="primary" />}
              />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        {user?.role === 'admin' ? 'Administrator' : 'Patient'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account Type
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        Active
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Account Status
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        v2.1.0
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        App Version
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="primary">
                        99.9%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uptime
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Export Data Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will download all your data including:
          </Typography>
          <ul>
            <li>Profile information</li>
            <li>Medical history</li>
            <li>Analysis reports</li>
            <li>Activity logs</li>
          </ul>
          <Alert severity="info" sx={{ mt: 2 }}>
            The data will be downloaded as a JSON file.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleExportData} variant="contained">
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography paragraph>
            Type <strong>DELETE</strong> to confirm:
          </Typography>
          <TextField
            fullWidth
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            disabled={confirmText !== 'DELETE'}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Settings;
