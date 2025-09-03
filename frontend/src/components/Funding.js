import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Chip,
  InputAdornment
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function Funding() {
  const [unfundedDeals, setUnfundedDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [form, setForm] = useState({
    funded_date: null,
    bank: '',
    notes: ''
  });

  const fetchUnfundedDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/deals');
      // Filter for deals without funded_date
      const unfunded = response.data.filter(deal => !deal.funded_date);
      setUnfundedDeals(unfunded);
    } catch (err) {
      setError('Failed to load unfunded deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnfundedDeals();
  }, []);

  const handleOpenDialog = (deal) => {
    setSelectedDeal(deal);
    setForm({
      funded_date: null,
      bank: deal.bank || '',
      notes: deal.notes || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeal(null);
    setForm({
      funded_date: null,
      bank: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        ...form,
        funded_date: form.funded_date ? form.funded_date.toISOString().split('T')[0] : null
      };

      await axios.put(`/api/deals/${selectedDeal.id}`, updateData);
      setSuccess('Deal funded successfully!');
      
      fetchUnfundedDeals(); // Refresh the list
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update deal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (date) => {
    setForm({ ...form, funded_date: date });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getTime() === 0) return '-';
    return date.toLocaleDateString();
  };

  const getDaysSinceDeal = (dealDate) => {
    if (!dealDate) return 0;
    const deal = new Date(dealDate);
    if (isNaN(deal.getTime()) || deal.getTime() === 0) return 0;
    const today = new Date();
    const diffTime = Math.abs(today - deal);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days) => {
    if (days > 30) return 'error';
    if (days > 14) return 'warning';
    return 'success';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Funding Management
          </Typography>
          <Chip 
            label={`${unfundedDeals.length} Unfunded Deals`}
            color="warning"
            variant="outlined"
          />
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
          <>
            {unfundedDeals.length === 0 ? (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      All deals are funded!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No unfunded deals found.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Stock #</TableCell>
                      <TableCell>Salesperson</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>FE Gross</TableCell>
                      <TableCell>BE Gross</TableCell>
                      <TableCell>Days Since Deal</TableCell>
                      <TableCell>Bank</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unfundedDeals.map((deal) => {
                      const daysSince = getDaysSinceDeal(deal.date);
                      return (
                        <TableRow key={deal.id} hover>
                          <TableCell>{deal.id}</TableCell>
                          <TableCell>{formatDate(deal.date)}</TableCell>
                          <TableCell>{deal.name || '-'}</TableCell>
                          <TableCell>{deal.stock_number || '-'}</TableCell>
                          <TableCell>{deal.salesperson_name || '-'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={deal.type || 'Unknown'} 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(deal.fe_gross)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(deal.be_gross)}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${daysSince} days`}
                              color={getUrgencyColor(daysSince)}
                              size="small"
                              icon={<ScheduleIcon />}
                            />
                          </TableCell>
                          <TableCell>{deal.bank || '-'}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(deal)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        {/* Funding Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Mark Deal as Funded
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {selectedDeal && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Deal #{selectedDeal.id} - {selectedDeal.name}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Stock #: {selectedDeal.stock_number || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salesperson: {selectedDeal.salesperson_name || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        FE Gross: {formatCurrency(selectedDeal.fe_gross)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        BE Gross: {formatCurrency(selectedDeal.be_gross)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DatePicker
                    label="Funded Date"
                    value={form.funded_date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bank"
                    name="bank"
                    value={form.bank}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">🏦</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Funding Notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Any additional notes about the funding..."
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading || !form.funded_date}
                startIcon={<CheckCircleIcon />}
              >
                {loading ? <CircularProgress size={20} /> : 'Mark as Funded'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default Funding;
