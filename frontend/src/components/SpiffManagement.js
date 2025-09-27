import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

/**
 * SpiffManagement component for managing monthly spiffs
 * Phase 1: Basic CRUD operations for spiff assignment
 */
function SpiffManagement() {
  // State management
  const [spiffs, setSpiffs] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [spiffTypes, setSpiffTypes] = useState([]);
  const [spiffCategories, setSpiffCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSpiff, setSelectedSpiff] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    salesperson_id: '',
    spiff_type_id: '',
    spiff_type_name: '', // Add custom spiff type name
    amount: '',
    description: '',
    notes: ''
  });

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [spiffsRes, salespersonsRes, spiffTypesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly`, {
          params: { 
            month: formData.month, 
            year: formData.year 
          }
        }),
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALESPERSONS}`),
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/types`),
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/categories`)
      ]);
      
      setSpiffs(spiffsRes.data);
      setSalespersons(salespersonsRes.data);
      setSpiffTypes(spiffTypesRes.data);
      setSpiffCategories(categoriesRes.data);
    } catch (err) {
      setError('Failed to fetch initial data');
      console.error('Error fetching initial data:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpiff = async () => {
    try {
      const spiffData = {
        month: formData.month,
        year: formData.year,
        salesperson_id: formData.salesperson_id,
        spiff_type_name: formData.spiff_type_name,
        amount: formData.amount,
        description: formData.description,
        notes: formData.notes
      };
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly`, spiffData);
      setSpiffs(prev => [...prev, response.data]);
      setAddDialogOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to add spiff');
      console.error('Error adding spiff:', err);
    }
  };

  const handleUpdateSpiff = async () => {
    try {
      const updateData = {
        amount: formData.amount,
        description: formData.description,
        notes: formData.notes,
        spiff_type_name: formData.spiff_type_name,
        status: formData.status
      };
      
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly/${selectedSpiff.id}`,
        updateData
      );
      setSpiffs(prev => prev.map(spiff => 
        spiff.id === selectedSpiff.id ? response.data : spiff
      ));
      setEditDialogOpen(false);
      setSelectedSpiff(null);
      resetForm();
    } catch (err) {
      setError('Failed to update spiff');
      console.error('Error updating spiff:', err);
    }
  };

  const handleDeleteSpiff = async (spiffId) => {
    if (!window.confirm('Are you sure you want to delete this spiff?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly/${spiffId}`);
      setSpiffs(prev => prev.filter(spiff => spiff.id !== spiffId));
    } catch (err) {
      setError('Failed to delete spiff');
      console.error('Error deleting spiff:', err);
    }
  };

  const handleStatusChange = async (spiffId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly/${spiffId}`,
        { status: newStatus }
      );
      setSpiffs(prev => prev.map(spiff => 
        spiff.id === spiffId ? response.data : spiff
      ));
    } catch (err) {
      setError('Failed to update spiff status');
      console.error('Error updating spiff status:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      salesperson_id: '',
      spiff_type_id: '',
      spiff_type_name: '',
      amount: '',
      description: '',
      notes: '',
      status: 'draft'
    });
  };

  const openEditDialog = (spiff) => {
    setSelectedSpiff(spiff);
    setFormData({
      month: spiff.month,
      year: spiff.year,
      salesperson_id: spiff.salesperson_id,
      spiff_type_id: spiff.spiff_type_id,
      spiff_type_name: spiff.spiff_type_name || '',
      amount: spiff.amount,
      description: spiff.description || '',
      notes: spiff.notes || '',
      status: spiff.status || 'draft'
    });
    setEditDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'paid': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getDateRangeLabel = () => {
    switch (selectedDateRange) {
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Previous Month';
      case 'quarterToDate': return 'Quarter to Date';
      case 'yearToDate': return 'Year to Date';
      case 'lastQuarter': return 'Last Quarter';
      case 'lastYear': return 'Last Year';
      case 'custom': return 'Custom Range';
      default: return 'This Month';
    }
  };

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    setShowCustomPicker(false);
    
    const now = new Date();
    let newMonth = formData.month;
    let newYear = formData.year;
    
    switch (range) {
      case 'thisMonth':
        newMonth = now.getMonth() + 1;
        newYear = now.getFullYear();
        break;
      case 'lastMonth':
        newMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        newYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        break;
      case 'quarterToDate':
        newMonth = Math.floor(now.getMonth() / 3) * 3 + 1;
        newYear = now.getFullYear();
        break;
      case 'yearToDate':
        newMonth = 1;
        newYear = now.getFullYear();
        break;
      case 'lastQuarter':
        const lastQuarterMonth = Math.floor((now.getMonth() - 3) / 3) * 3 + 1;
        newMonth = lastQuarterMonth < 1 ? lastQuarterMonth + 12 : lastQuarterMonth;
        newYear = lastQuarterMonth < 1 ? now.getFullYear() - 1 : now.getFullYear();
        break;
      case 'lastYear':
        newMonth = 1;
        newYear = now.getFullYear() - 1;
        break;
      case 'custom':
        setShowCustomPicker(true);
        setDateAnchorEl(null);
        return;
    }
    
    setFormData(prev => ({ ...prev, month: newMonth, year: newYear }));
    setDateAnchorEl(null);
    
    // Fetch data after a short delay to ensure state updates
    setTimeout(() => {
      fetchSpiffsForMonth(newMonth, newYear);
    }, 100);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setSelectedDateRange('custom');
      // For custom date range, we'll need to modify the API call
      // For now, let's use the start date's month/year
      const startDate = new Date(customStartDate);
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();
      setFormData(prev => ({ ...prev, month, year }));
      fetchSpiffsForMonth(month, year);
    }
  };

  const getDateRangeIcon = (range) => {
    switch (range) {
      case 'thisMonth': return <TodayIcon />;
      case 'lastMonth': return <CalendarIcon />;
      case 'quarterToDate': return <ViewModuleIcon />;
      case 'yearToDate': return <TrendingUpIcon />;
      case 'lastQuarter': return <ViewWeekIcon />;
      case 'lastYear': return <ScheduleIcon />;
      case 'custom': return <DateRangeIcon />;
      default: return <CalendarIcon />;
    }
  };

  const fetchSpiffsForMonth = async (month, year) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/monthly`, {
        params: { month, year }
      });
      setSpiffs(response.data);
    } catch (err) {
      setError('Failed to fetch spiffs for selected period');
      console.error('Error fetching spiffs:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpiffAmount = spiffs.reduce((sum, spiff) => sum + (parseFloat(spiff.amount) || 0), 0);

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Spiff Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage monthly spiffs and incentives for salespeople
        </Typography>
      </Box>

      {/* Date Range Picker */}
      <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Date Range Picker */}
            <Grid item>
              <Button
                variant="outlined"
                startIcon={getDateRangeIcon(selectedDateRange)}
                onClick={(e) => setDateAnchorEl(e.currentTarget)}
                sx={{ 
                  minWidth: 180,
                  justifyContent: 'flex-start',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {getDateRangeLabel()}
              </Button>
              <Menu
                anchorEl={dateAnchorEl}
                open={Boolean(dateAnchorEl)}
                onClose={() => setDateAnchorEl(null)}
                PaperProps={{
                  sx: {
                    minWidth: 200,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem onClick={() => handleDateRangeSelect('thisMonth')}>
                  <ListItemIcon><TodayIcon /></ListItemIcon>
                  <ListItemText primary="This Month" />
                </MenuItem>
                <MenuItem onClick={() => handleDateRangeSelect('lastMonth')}>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText primary="Previous Month" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDateRangeSelect('quarterToDate')}>
                  <ListItemIcon><ViewModuleIcon /></ListItemIcon>
                  <ListItemText primary="Quarter to Date" />
                </MenuItem>
                <MenuItem onClick={() => handleDateRangeSelect('lastQuarter')}>
                  <ListItemIcon><ViewWeekIcon /></ListItemIcon>
                  <ListItemText primary="Last Quarter" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDateRangeSelect('yearToDate')}>
                  <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                  <ListItemText primary="Year to Date" />
                </MenuItem>
                <MenuItem onClick={() => handleDateRangeSelect('lastYear')}>
                  <ListItemIcon><ScheduleIcon /></ListItemIcon>
                  <ListItemText primary="Last Year" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleDateRangeSelect('custom')}>
                  <ListItemIcon><DateRangeIcon /></ListItemIcon>
                  <ListItemText primary="Custom Range" />
                </MenuItem>
              </Menu>
            </Grid>

            {/* Custom Date Range Inputs */}
            {showCustomPicker && (
              <>
                <Grid item>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="End Date"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 150 }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleCustomDateSubmit}
                    disabled={!customStartDate || !customEndDate}
                    sx={{ 
                      minWidth: 80,
                      backgroundColor: '#2e7d32',
                      '&:hover': { backgroundColor: '#1b5e20' }
                    }}
                  >
                    Apply
                  </Button>
                </Grid>
              </>
            )}

            {/* Manual Month/Year Inputs */}
            {!showCustomPicker && selectedDateRange !== 'custom' && (
              <>
                <Grid item>
                  <TextField
                    label="Month"
                    type="number"
                    value={formData.month}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      setFormData(prev => ({ ...prev, month }));
                      fetchSpiffsForMonth(month, formData.year);
                    }}
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      setFormData(prev => ({ ...prev, year }));
                      fetchSpiffsForMonth(formData.month, year);
                    }}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Grid>
              </>
            )}

            <Grid item>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => fetchSpiffsForMonth(formData.month, formData.year)}
                disabled={loading}
                sx={{ 
                  minWidth: 120,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  }
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Refresh'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Spiffs
              </Typography>
              <Typography variant="h4">
                {spiffs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {formatCurrency(totalSpiffAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h4" sx={{ color: 'warning.main' }}>
                {spiffs.filter(s => s.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" sx={{ color: 'success.main' }}>
                {spiffs.filter(s => s.status === 'approved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {formData.month}/{formData.year} Spiffs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ 
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            '&:hover': { background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)' }
          }}
        >
          Add Spiff
        </Button>
      </Box>

      {/* Spiffs Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Salesperson</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 1 }}>Loading spiffs...</Typography>
                </TableCell>
              </TableRow>
            ) : spiffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No spiffs found for {formData.month}/{formData.year}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              spiffs.map((spiff) => (
                <TableRow 
                  key={spiff.id}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f8ff' }
                  }}
                >
                  <TableCell>{spiff.salesperson_name}</TableCell>
                  <TableCell>{spiff.category_name}</TableCell>
                  <TableCell>{spiff.spiff_type_name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(spiff.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={spiff.status} 
                      color={getStatusColor(spiff.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(spiff.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => openEditDialog(spiff)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteSpiff(spiff.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    {spiff.status === 'pending' && (
                      <Tooltip title="Approve">
                        <IconButton 
                          size="small" 
                          onClick={() => handleStatusChange(spiff.id, 'approved')}
                          color="success"
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Spiff Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Spiff</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Month"
                type="number"
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                fullWidth
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Salesperson</InputLabel>
                <Select
                  value={formData.salesperson_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, salesperson_id: e.target.value }))}
                  label="Salesperson"
                  disabled={loading}
                >
                  {loading ? (
                    <MenuItem disabled>Loading salespersons...</MenuItem>
                  ) : salespersons.length === 0 ? (
                    <MenuItem disabled>No salespersons found</MenuItem>
                  ) : salespersons
                    .filter(person => person.is_active === true || person.is_active === 1)
                    .length === 0 ? (
                    <MenuItem disabled>No active salespersons found</MenuItem>
                  ) : (
                    salespersons
                      .filter(person => person.is_active === true || person.is_active === 1)
                      .map((person) => (
                        <MenuItem key={person.id} value={person.id}>
                          {person.name}
                        </MenuItem>
                      ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Spiff Type"
                value={formData.spiff_type_name}
                onChange={(e) => setFormData(prev => ({ ...prev, spiff_type_name: e.target.value }))}
                fullWidth
                placeholder="Enter spiff type (e.g., VSC Bonus, Unit Bonus, etc.)"
                helperText="Enter a custom spiff type name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                fullWidth
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSpiff} variant="contained">Add Spiff</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Spiff Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Spiff</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Spiff Type"
                value={formData.spiff_type_name}
                onChange={(e) => setFormData(prev => ({ ...prev, spiff_type_name: e.target.value }))}
                fullWidth
                placeholder="Enter spiff type name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                fullWidth
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || selectedSpiff?.status || 'draft'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSpiff} variant="contained">Update Spiff</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SpiffManagement;
