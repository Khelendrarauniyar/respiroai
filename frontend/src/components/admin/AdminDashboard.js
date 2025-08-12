import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Avatar,
  Button,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Computer as SystemIcon,
  CheckCircle as HealthIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { makeAuthenticatedRequest, user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadSystemHealth();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await makeAuthenticatedRequest('/auth/admin/dashboard');
      if (response && response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    try {
      const response = await ApiService.checkHealth();
      if (response && response.status >= 200 && response.status < 300) {
        setSystemHealth(response.data);
      }
    } catch (error) {
      console.error('System health error:', error);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value || 0}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }} 
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.full_name || user?.username}! Here's your system overview.
        </Typography>
      </Box>

      {/* System Health Alert */}
      {systemHealth && (
        <Alert 
          severity={systemHealth.status === 'healthy' ? 'success' : 'warning'} 
          sx={{ mb: 3 }}
          icon={<HealthIcon />}
        >
          System Status: {systemHealth.status === 'healthy' ? 'All systems operational' : 'Some issues detected'}
          {systemHealth.version && ` - Version ${systemHealth.version}`}
        </Alert>
      )}

      {/* Statistics Cards */}
      {dashboardData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={dashboardData.users?.total || 0}
              subtitle={`${dashboardData.users?.active || 0} active`}
              icon={<PeopleIcon />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Predictions"
              value={dashboardData.system?.total_predictions || 0}
              subtitle="All time"
              icon={<AnalyticsIcon />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Patients"
              value={dashboardData.system?.total_patients || 0}
              subtitle="Registered"
              icon={<PeopleIcon />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Status"
              value={dashboardData.system?.status || 'Operational'}
              subtitle="Health check"
              icon={<SystemIcon />}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="Manage Users"
            description="View, edit, and manage system users"
            icon={<PeopleIcon />}
            color="primary"
            onClick={() => window.location.href = '/admin/users'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View Analytics"
            description="System analytics and reports"
            icon={<AnalyticsIcon />}
            color="success"
            onClick={() => window.location.href = '/admin/analytics'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="View All Scans"
            description="Monitor all patient scans and predictions"
            icon={<AnalyticsIcon />}
            color="info"
            onClick={() => window.location.href = '/admin/scans'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <QuickActionCard
            title="System Settings"
            description="Configure system settings"
            icon={<SecurityIcon />}
            color="warning"
            onClick={() => toast('System settings coming soon', { icon: '⚙️' })}
          />
        </Grid>
      </Grid>

      {/* User Role Distribution */}
      {dashboardData?.users?.by_role && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="User Distribution by Role" />
              <CardContent>
                <Grid container spacing={2}>
                  {Object.entries(dashboardData.users.by_role).map(([role, count]) => (
                    <Grid item xs={6} key={role}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {count}
                        </Typography>
                        <Chip 
                          label={role.toUpperCase()} 
                          color={role === 'admin' ? 'error' : 'primary'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="System Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Active Users: {dashboardData.users?.active || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Inactive Users: {dashboardData.users?.inactive || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Predictions: {dashboardData.system?.total_predictions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Patients: {dashboardData.system?.total_patients || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Activity Summary */}
      {dashboardData?.recent_activity && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
            Recent Activity Summary
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Recent Logins (24h): {dashboardData.recent_activity.recent_logins || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Predictions (24h): {dashboardData.recent_activity.recent_predictions || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    New Users (7d): {dashboardData.recent_activity.new_users_week || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    System Uptime: {dashboardData.recent_activity.uptime || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
