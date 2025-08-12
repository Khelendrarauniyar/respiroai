import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Person as PersonIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminScans = () => {
  const { makeAuthenticatedRequest } = useAuth();
  
  const [scans, setScans] = useState([]);
  const [filteredScans, setFilteredScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    filterScans();
  }, [scans, searchTerm, diseaseFilter, userFilter]);

  const loadScans = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/auth/admin/scans');
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setScans(data.scans);
        } else {
          toast.error('Failed to load scans');
        }
      } else {
        toast.error('Failed to fetch scans data');
      }
    } catch (error) {
      console.error('Load scans error:', error);
      toast.error('Error loading scans');
    } finally {
      setLoading(false);
    }
  };

  const filterScans = () => {
    let filtered = scans;

    if (searchTerm) {
      filtered = filtered.filter(scan => 
        scan.patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (diseaseFilter) {
      filtered = filtered.filter(scan => scan.predicted_disease === diseaseFilter);
    }

    if (userFilter) {
      filtered = filtered.filter(scan => scan.user.username === userFilter);
    }

    setFilteredScans(filtered);
  };

  const handleViewDetails = (scan) => {
    setSelectedScan(scan);
    setDetailsOpen(true);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getDiseaseColor = (disease) => {
    switch (disease?.toLowerCase()) {
      case 'normal':
        return 'success';
      case 'pneumonia':
        return 'error';
      case 'covid-19':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const uniqueDiseases = [...new Set(scans.map(scan => scan.predicted_disease))];
  const uniqueUsers = [...new Set(scans.map(scan => scan.user.username))];

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
          <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          All Scans & Predictions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor all patient scans and AI predictions across the system
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <AnalyticsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {scans.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Scans
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {uniqueUsers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unique Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <AnalyticsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {scans.filter(s => s.predicted_disease !== 'Normal').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Abnormal Cases
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {scans.filter(s => {
                      const scanDate = new Date(s.created_at);
                      const today = new Date();
                      const diffTime = today - scanDate;
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= 7;
                    }).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This Week
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                placeholder="Search by patient, user, or email"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Disease Filter</InputLabel>
                <Select
                  value={diseaseFilter}
                  label="Disease Filter"
                  onChange={(e) => setDiseaseFilter(e.target.value)}
                >
                  <MenuItem value="">All Diseases</MenuItem>
                  {uniqueDiseases.map(disease => (
                    <MenuItem key={disease} value={disease}>
                      {disease}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>User Filter</InputLabel>
                <Select
                  value={userFilter}
                  label="User Filter"
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <MenuItem value="">All Users</MenuItem>
                  {uniqueUsers.map(username => (
                    <MenuItem key={username} value={username}>
                      {username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setDiseaseFilter('');
                  setUserFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Scans Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Scan Results ({filteredScans.length} records)
          </Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Predicted Disease</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredScans.map((scan) => (
                  <TableRow key={scan.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {scan.patient.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scan.patient.age ? `${scan.patient.age} years` : ''} 
                          {scan.patient.gender ? ` • ${scan.patient.gender}` : ''}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {scan.user.full_name || scan.user.username}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {scan.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={scan.predicted_disease}
                        color={getDiseaseColor(scan.predicted_disease)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${(scan.confidence * 100).toFixed(1)}%`}
                        color={getConfidenceColor(scan.confidence)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(scan.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(scan)}
                        color="primary"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredScans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No scans found matching the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Scan Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Scan Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedScan && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Patient Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {selectedScan.patient.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Age:</strong> {selectedScan.patient.age || 'Unknown'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {selectedScan.patient.gender || 'Unknown'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  User Information
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Username:</strong> {selectedScan.user.username}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Full Name:</strong> {selectedScan.user.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedScan.user.email}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Prediction Results
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Predicted Disease:</strong>
                    <Chip
                      label={selectedScan.predicted_disease}
                      color={getDiseaseColor(selectedScan.predicted_disease)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Confidence:</strong>
                    <Chip
                      label={`${(selectedScan.confidence * 100).toFixed(1)}%`}
                      color={getConfidenceColor(selectedScan.confidence)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Scan Date:</strong> {formatDate(selectedScan.created_at)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Scan ID:</strong> {selectedScan.id}
                  </Typography>
                </Box>
                
                {selectedScan.image_path && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Image Path
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 2 }}>
                      {selectedScan.image_path}
                    </Typography>
                    
                    {/* Display the actual image */}
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Medical Scan Image
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <img 
                        src={`http://localhost:5000/uploads/${selectedScan.image_path.split(/[\\\/]/).pop()}`}
                        alt="Medical scan"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          console.error('Failed to load image:', selectedScan.image_path);
                          // Try alternative path
                          const altSrc = `http://localhost:5000/${selectedScan.image_path}`;
                          if (e.target.src !== altSrc) {
                            e.target.src = altSrc;
                          } else {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }
                        }}
                        onLoad={() => console.log('Image loaded successfully')}
                      />
                      <Typography 
                        variant="body2" 
                        color="error" 
                        sx={{ display: 'none', textAlign: 'center', mt: 2 }}
                      >
                        Image could not be loaded
                      </Typography>
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminScans;
