import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const PatientManagement = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    emergency_contact: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPatients();
      
      if (response && response.data.success) {
        setPatients(response.data.patients);
      } else {
        toast.error('Failed to load patients');
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Error loading patients');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
      contact: patient.contact || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || ''
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!formData.name || !formData.age || !formData.gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setEditLoading(true);
      const response = await ApiService.updatePatient(selectedPatient.id, {
        ...formData,
        age: parseInt(formData.age)
      });

      if (response && response.data.success) {
        toast.success('Patient updated successfully!');
        loadPatients(); // Refresh the list
        setEditDialogOpen(false);
        setSelectedPatient(null);
      } else {
        toast.error(response.data.error || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Error updating patient');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await ApiService.deletePatient(selectedPatient.id);

      if (response && response.data.success) {
        toast.success('Patient deleted successfully!');
        loadPatients(); // Refresh the list
        setDeleteDialogOpen(false);
        setSelectedPatient(null);
      } else {
        toast.error(response.data.error || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Error deleting patient');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return 'primary';
      case 'female':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Patient Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your registered patients. You can add, edit, or remove patient records.
        </Typography>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {patients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {patients.filter(p => p.gender?.toLowerCase() === 'male').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Male Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {patients.filter(p => p.gender?.toLowerCase() === 'female').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Female Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Age
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patients Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Your Patients ({patients.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/patient/register')}
            >
              Add New Patient
            </Button>
          </Box>

          {patients.length === 0 ? (
            <Alert severity="info">
              No patients registered yet. 
              <Button
                color="primary"
                onClick={() => navigate('/patient/register')}
                sx={{ ml: 1 }}
              >
                Register your first patient
              </Button>
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="bold">
                            {patient.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{patient.age} years</TableCell>
                      <TableCell>
                        <Chip
                          label={patient.gender}
                          color={getGenderColor(patient.gender)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{patient.contact || 'Not provided'}</TableCell>
                      <TableCell>{formatDate(patient.created_at)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(patient)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(patient)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add patient"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/patient/register')}
      >
        <AddIcon />
      </Fab>

      {/* Edit Patient Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Edit Patient: {selectedPatient?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age *"
                type="number"
                value={formData.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
                inputProps={{ min: 0, max: 150 }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender *</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender *"
                  onChange={(e) => handleFormChange('gender', e.target.value)}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact"
                value={formData.contact}
                onChange={(e) => handleFormChange('contact', e.target.value)}
                placeholder="Phone or email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergency_contact}
                onChange={(e) => handleFormChange('emergency_contact', e.target.value)}
                placeholder="Emergency contact information"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Delete Patient
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedPatient?.name}</strong>? 
            This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Note: You cannot delete a patient who has associated medical records.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PatientManagement;
