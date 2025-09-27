import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import axios from 'axios';
import API_CONFIG from '../config/api';

function Admin() {
  const [salespeople, setSalespeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  
  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    employee_number: '',
    email: '',
    phone: '',
    role: 'salesperson',
    payplan: 'BMW',
    demo_eligible: true,
    is_active: true
  });

  const fetchSalespeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALESPERSONS}`);
      setSalespeople(response.data);
    } catch (err) {
      setError('Failed to load salespeople');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalespeople();
  }, []);

  const handleOpenDialog = (salesperson = null) => {
    if (salesperson) {
      setEditingId(salesperson.id);
      setForm({
        name: salesperson.name || '',
        employee_number: salesperson.employee_number || '',
        email: salesperson.email || '',
        phone: salesperson.phone || '',
        role: salesperson.role || 'salesperson',
        payplan: salesperson.payplan || 'BMW',
        demo_eligible: salesperson.demo_eligible !== false,
        is_active: salesperson.is_active !== false
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        employee_number: '',
        email: '',
        phone: '',
        role: 'salesperson',
        payplan: 'BMW',
        demo_eligible: true,
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setForm({
      name: '',
      employee_number: '',
      email: '',
      phone: '',
      role: 'salesperson',
      payplan: 'BMW',
      demo_eligible: true,
      is_active: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALESPERSONS}/${editingId}`, form);
        setSuccess('Salesperson updated successfully!');
      } else {
        await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALESPERSONS}`, form);
        setSuccess('Salesperson added successfully!');
      }
      
      fetchSalespeople();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save salesperson');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salesperson?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALESPERSONS}/${id}`);
      setSuccess('Salesperson deleted successfully!');
      fetchSalespeople();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete salesperson');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin - Salespeople Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                color="primary"
              />
            }
            label="Show Inactive"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Salesperson
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Employee #</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Payplan</TableCell>
                <TableCell>Demo Eligible</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salespeople
                .filter(salesperson => showInactive || salesperson.is_active)
                .map((salesperson) => (
                <TableRow key={salesperson.id} hover>
                  <TableCell>{salesperson.id}</TableCell>
                  <TableCell>{salesperson.name}</TableCell>
                  <TableCell>{salesperson.employee_number || '-'}</TableCell>
                  <TableCell>{salesperson.email || '-'}</TableCell>
                  <TableCell>{salesperson.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={salesperson.role} 
                      color={getRoleColor(salesperson.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={salesperson.payplan || 'BMW'} 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={salesperson.demo_eligible ? 'Yes' : 'No'}
                      color={salesperson.demo_eligible ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={salesperson.is_active ? 'Active' : 'Inactive'}
                      color={salesperson.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(salesperson.created_at)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(salesperson)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(salesperson.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Salesperson' : 'Add New Salesperson'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee Number"
                  name="employee_number"
                  value={form.employee_number}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={form.role}
                    label="Role"
                    onChange={handleChange}
                  >
                    <MenuItem value="salesperson">Salesperson</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payplan</InputLabel>
                  <Select
                    name="payplan"
                    value={form.payplan}
                    label="Payplan"
                    onChange={handleChange}
                  >
                    <MenuItem value="BMW">BMW</MenuItem>
                    <MenuItem value="MINI">MINI</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="demo_eligible"
                      checked={form.demo_eligible}
                      onChange={handleChange}
                    />
                  }
                  label="Demo Eligible"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : (editingId ? 'Update' : 'Add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Admin;
