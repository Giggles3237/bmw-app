import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';
import PayrollModal from './PayrollModal';
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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { 
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
 * PayrollSheet component displays payroll calculations for salespersons
 * based on unit pay plans, similar to the Salesperson sheet in Einstein.
 * Shows unit counts, commissions, bonuses, and total pay calculations.
 * 
 * Features:
 * - Click on salesperson names to view detailed PDF-style payroll sheets
 * - Print functionality for individual payroll sheets
 * - Responsive design for mobile devices
 */
function PayrollSheet() {
  // Default to current month and year (MTD)
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // getMonth() returns 0-11
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  // Get user info for admin check
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
        params.start_date = customStartDate;
        params.end_date = customEndDate;
      } else {
        // Use month/year for other date ranges
        if (month) params.month = month;
        if (year) params.year = year;
      }
      
      console.log('Fetching payroll with params:', params);
      console.log('API URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/payroll`);
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/payroll`, { params });
      console.log('Payroll response:', response.data);
      setData(response.data);
    } catch (err) {
      setError(`Failed to fetch payroll data: ${err.message}`);
      console.error('Payroll fetch error:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch payroll when component mounts with MTD defaults
  useEffect(() => {
    fetchPayroll();
  }, []); // Empty dependency array means this runs once on mount

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
    let newMonth = month;
    let newYear = year;
    
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
    
    setMonth(newMonth);
    setYear(newYear);
    setDateAnchorEl(null);
    
    // Fetch data after a short delay to ensure state updates
    setTimeout(() => {
      fetchPayroll();
    }, 100);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setSelectedDateRange('custom');
      fetchPayroll();
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

  // Calculate totals for summary row
  const totals = data.reduce((acc, person) => {
    acc.deal_count += person.deal_count || 0;
    acc.bmw_units += person.bmw_units || 0;
    acc.mini_units += person.mini_units || 0;
    acc.total_units += person.total_units || 0;
    acc.fe_gross_total += person.fe_gross_total || 0;
    acc.be_gross_total += person.be_gross_total || 0;
    acc.product_total += person.product_total || 0;
    acc.unit_commission += person.unit_commission || 0;
    acc.product_commission += person.product_commission || 0;
    acc.bonus_earned += person.bonus_earned || 0;
    acc.approved_spiff_amount += person.approved_spiff_amount || 0;
    acc.total_pay += person.total_pay || 0;
    return acc;
  }, {
    deal_count: 0,
    bmw_units: 0,
    mini_units: 0,
    total_units: 0,
    fe_gross_total: 0,
    be_gross_total: 0,
    product_total: 0,
    unit_commission: 0,
    product_commission: 0,
    bonus_earned: 0,
    approved_spiff_amount: 0,
    total_pay: 0
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleSalespersonClick = async (payrollData) => {
    try {
      // Fetch detailed payroll data for this specific salesperson
      const params = { month, year, salesperson_id: payrollData.salesperson_id };
      console.log('Sending request with params:', params);
      console.log('API URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/payroll`);
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/payroll`, { params });
      
      if (response.data && response.data.length > 0) {
        console.log('Detailed payroll data received:', response.data[0]);
        console.log('Deal details:', response.data[0].deal_details);
        setSelectedPayroll(response.data[0]); // Get the detailed data with deal_details
        setIsModalOpen(true);
      } else {
        console.log('No detailed data, using summary data');
        setSelectedPayroll(payrollData); // Fallback to summary data
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching detailed payroll:', err);
      setSelectedPayroll(payrollData); // Fallback to summary data
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPayroll(null);
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Payroll Sheet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Payroll calculations for salespersons
        </Typography>
      </Box>

      {/* Controls Card */}
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

            {/* Manual Month/Year Inputs (for custom range) */}
            {!showCustomPicker && selectedDateRange !== 'custom' && (
              <>
                <Grid item>
                  <TextField
                    label="Month"
                    type="number"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    label="Year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
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
                onClick={fetchPayroll}
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

      {/* Pay Plan Information - Only visible to admin users */}
      {user && user.role === 'admin' && (
        <Card sx={{ mb: 3, backgroundColor: '#e8f4fd', border: '1px solid #b3d9ff' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#0066cc', fontWeight: 600 }}>
              Pay Plans - Sliding Unit Scale
            </Typography>
            
            <Grid container spacing={3}>
              {/* BMW Pay Plan */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                  BMW
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2"><strong>Units 1-5:</strong> $200 each</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 6:</strong> $225</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 7:</strong> $250</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 8:</strong> $300</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 9:</strong> $325</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 10:</strong> $350</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 11:</strong> $375</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Units 12+:</strong> $425 each</Typography></Grid>
                </Grid>
              </Grid>
              
              {/* MINI Pay Plan */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
                  MINI
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2"><strong>Units 1-7:</strong> $225 each</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 8:</strong> $275</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 9:</strong> $300</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 10:</strong> $325</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Unit 11:</strong> $350</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Units 12+:</strong> $375 each</Typography></Grid>
                </Grid>
              </Grid>
            </Grid>
            
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Data Table */}
      {!loading && !error && data.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary">
              No payroll data found for the selected date range
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>💡 Tip:</strong> Click on any salesperson's name to view their detailed PDF-style payroll sheet
            </Typography>
          </Alert>

          {/* Payroll Table */}
          <TableContainer component={Paper} sx={{ mb: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Salesperson</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Payplan</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Demo Eligible</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Deals</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>BMW Units</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>MINI Units</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Total Units</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>FE Gross</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>BE Gross</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Products</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Unit Comm</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Prod Comm</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Bonus</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Spiffs</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.95rem', backgroundColor: '#d4edda' }}>Total Pay</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((person, index) => (
                  <TableRow 
                    key={person.salesperson_id || index} 
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                      '&:hover': { backgroundColor: '#f0f8ff' },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      <Button
                        onClick={() => handleSalespersonClick(person)}
                        sx={{
                          background: 'none',
                          border: 'none',
                          color: '#007bff',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: 'inherit',
                          padding: 0,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline'
                          }
                        }}
                        title="Click to view detailed payroll sheet"
                      >
                        {person.salesperson || 'Unassigned'}
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={person.payplan || 'BMW'} 
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={person.demo_eligible ? 'Yes' : 'No'}
                        color={person.demo_eligible ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {person.deal_count || 0}
                    </TableCell>
                    <TableCell align="center">
                      {person.bmw_units || 0}
                    </TableCell>
                    <TableCell align="center">
                      {person.mini_units || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                      {person.total_units || 0}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.fe_gross_total)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.be_gross_total)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.product_total)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.unit_commission)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.product_commission)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.bonus_earned)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(person.approved_spiff_amount || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: '#d4edda'
                    }}>
                      {formatCurrency(person.total_pay)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Totals Row */}
                <TableRow sx={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>TOTALS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    -
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    -
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {totals.deal_count}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {totals.bmw_units}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {totals.mini_units}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {totals.total_units}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.fe_gross_total)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.be_gross_total)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.product_total)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.unit_commission)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.product_commission)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.bonus_earned)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.approved_spiff_amount || 0)}
                  </TableCell>
                  <TableCell align="right" sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: '#c3e6cb'
                  }}>
                    {formatCurrency(totals.total_pay)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Statistics */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>Total Salespeople</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#007bff' }}>
                    {data.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>BMW Units</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                    {totals.bmw_units}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>MINI Units</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#17a2b8' }}>
                    {totals.mini_units}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>Total Units</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6c757d' }}>
                    {totals.total_units}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>Total Payroll</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#dc3545' }}>
                    {formatCurrency(totals.total_pay)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#495057' }}>Avg per Person</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6f42c1' }}>
                    {formatCurrency(data.length > 0 ? totals.total_pay / data.length : 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Payroll Modal */}
      <PayrollModal
        isOpen={isModalOpen}
        onClose={closeModal}
        payrollData={selectedPayroll}
        month={month}
        year={year}
      />
    </Box>
  );
}

export default PayrollSheet;
