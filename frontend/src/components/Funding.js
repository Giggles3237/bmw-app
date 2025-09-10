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
  InputAdornment,
  Collapse,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import API_CONFIG from '../config/api';

function Funding() {
  const [unfundedDeals, setUnfundedDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    salesperson: '',
    type: '',
    bank: '',
    startDate: null,
    endDate: null
  });

  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // Deal detail dialog states
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Form states
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    funded_date: null,
    bank: '',
    notes: ''
  });

  const fetchUnfundedDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEALS}`);
      // Filter for deals without funded_date
      const unfunded = response.data.filter(deal => !deal.funded_date);
      setUnfundedDeals(unfunded);
      setFilteredDeals(unfunded);
    } catch (err) {
      setError('Failed to load unfunded deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnfundedDeals();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...unfundedDeals];

    // Text search across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        (deal.name && deal.name.toLowerCase().includes(searchLower)) ||
        (deal.stock_number && deal.stock_number.toLowerCase().includes(searchLower)) ||
        (deal.salesperson_name && deal.salesperson_name.toLowerCase().includes(searchLower)) ||
        (deal.type && deal.type.toLowerCase().includes(searchLower)) ||
        (deal.bank && deal.bank.toLowerCase().includes(searchLower))
      );
    }

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(deal => {
        if (!deal.date) return false;
        const dealDate = new Date(deal.date);
        return dealDate >= filters.startDate;
      });
    }
    if (filters.endDate) {
      filtered = filtered.filter(deal => {
        if (!deal.date) return false;
        const dealDate = new Date(deal.date);
        return dealDate <= filters.endDate;
      });
    }
    if (filters.salesperson) {
      filtered = filtered.filter(deal => 
        deal.salesperson_name && deal.salesperson_name.toLowerCase().includes(filters.salesperson.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(deal => deal.type === filters.type);
    }
    if (filters.bank) {
      filtered = filtered.filter(deal => 
        deal.bank && deal.bank.toLowerCase().includes(filters.bank.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortData(filtered, sortConfig);

    setFilteredDeals(filtered);
  }, [unfundedDeals, searchTerm, filters, sortConfig]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      salesperson: '',
      type: '',
      bank: '',
      startDate: null,
      endDate: null
    });
    setSearchTerm('');
    setSelectedDateRange('all');
    setShowCustomPicker(false);
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
      case 'all': return 'All Time';
      default: return 'All Time';
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
      case 'all': return <CalendarIcon />;
      default: return <CalendarIcon />;
    }
  };

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    setShowCustomPicker(false);
    
    const now = new Date();
    let newStartDate = null;
    let newEndDate = null;
    
    switch (range) {
      case 'thisMonth':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        newStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarterToDate':
        newStartDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'yearToDate':
        newStartDate = new Date(now.getFullYear(), 0, 1);
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastQuarter':
        const lastQuarterMonth = Math.floor((now.getMonth() - 3) / 3) * 3;
        newStartDate = new Date(now.getFullYear(), lastQuarterMonth < 0 ? lastQuarterMonth + 12 : lastQuarterMonth, 1);
        newEndDate = new Date(now.getFullYear(), lastQuarterMonth < 0 ? lastQuarterMonth + 15 : lastQuarterMonth + 3, 0);
        break;
      case 'lastYear':
        newStartDate = new Date(now.getFullYear() - 1, 0, 1);
        newEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'custom':
        setShowCustomPicker(true);
        setDateAnchorEl(null);
        return;
      case 'all':
        newStartDate = null;
        newEndDate = null;
        break;
    }
    
    setFilters(prev => ({
      ...prev,
      startDate: newStartDate,
      endDate: newEndDate
    }));
    setDateAnchorEl(null);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setSelectedDateRange('custom');
      setFilters(prev => ({
        ...prev,
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      }));
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data, config) => {
    if (!config.key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];
      
      // Handle numeric values
      if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      // Handle date values
      if (config.key === 'date') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }
      
      if (aVal < bVal) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

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

      await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DEALS}/${selectedDeal.id}`, updateData);
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

  // Handle deal row click for viewing details
  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setDetailDialogOpen(true);
  };

  // Handle detail dialog close
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDeal(null);
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

  // Get unique values for dropdowns
  const uniqueTypes = [...new Set(unfundedDeals.map(deal => deal.type).filter(Boolean))];
  const uniqueBanks = [...new Set(unfundedDeals.map(deal => deal.bank).filter(Boolean))];
  const uniqueSalespersons = [...new Set(unfundedDeals.map(deal => deal.salesperson_name).filter(Boolean))];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Funding Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`${filteredDeals.length} Unfunded Deals`}
              color="warning"
              variant="outlined"
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear All
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

        {/* Search and Filter Bar */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search deals by customer name, stock number, salesperson, type, or bank..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              {/* Date Range Picker */}
              <Grid item xs={12} md={3}>
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
                  <MenuItemComponent onClick={() => handleDateRangeSelect('all')}>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText primary="All Time" />
                  </MenuItemComponent>
                  <Divider />
                  <MenuItemComponent onClick={() => handleDateRangeSelect('thisMonth')}>
                    <ListItemIcon><TodayIcon /></ListItemIcon>
                    <ListItemText primary="This Month" />
                  </MenuItemComponent>
                  <MenuItemComponent onClick={() => handleDateRangeSelect('lastMonth')}>
                    <ListItemIcon><CalendarIcon /></ListItemIcon>
                    <ListItemText primary="Previous Month" />
                  </MenuItemComponent>
                  <Divider />
                  <MenuItemComponent onClick={() => handleDateRangeSelect('quarterToDate')}>
                    <ListItemIcon><ViewModuleIcon /></ListItemIcon>
                    <ListItemText primary="Quarter to Date" />
                  </MenuItemComponent>
                  <MenuItemComponent onClick={() => handleDateRangeSelect('lastQuarter')}>
                    <ListItemIcon><ViewWeekIcon /></ListItemIcon>
                    <ListItemText primary="Last Quarter" />
                  </MenuItemComponent>
                  <Divider />
                  <MenuItemComponent onClick={() => handleDateRangeSelect('yearToDate')}>
                    <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                    <ListItemText primary="Year to Date" />
                  </MenuItemComponent>
                  <MenuItemComponent onClick={() => handleDateRangeSelect('lastYear')}>
                    <ListItemIcon><ScheduleIcon /></ListItemIcon>
                    <ListItemText primary="Last Year" />
                  </MenuItemComponent>
                  <Divider />
                  <MenuItemComponent onClick={() => handleDateRangeSelect('custom')}>
                    <ListItemIcon><DateRangeIcon /></ListItemIcon>
                    <ListItemText primary="Custom Range" />
                  </MenuItemComponent>
                </Menu>
              </Grid>

              {/* Custom Date Range Inputs */}
              {showCustomPicker && (
                <>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="End Date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={1}>
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

              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchUnfundedDeals}
                  disabled={loading}
                  fullWidth
                >
                  Refresh
                </Button>
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  fullWidth
                >
                  Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Salesperson"
                    value={filters.salesperson}
                    onChange={(e) => handleFilterChange('salesperson', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Vehicle Type"
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {uniqueTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Bank</InputLabel>
                    <Select
                      value={filters.bank}
                      label="Bank"
                      onChange={(e) => handleFilterChange('bank', e.target.value)}
                    >
                      <MenuItem value="">All Banks</MenuItem>
                      {uniqueBanks.map(bank => (
                        <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Collapse>

        {/* Results Summary */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredDeals.length} of {unfundedDeals.length} unfunded deals
          </Typography>
          <Chip 
            label={`Total FE Gross: ${formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.fe_gross || 0), 0))}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {filteredDeals.length === 0 ? (
              <Card>
                <CardContent>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      All deals are funded!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No unfunded deals found matching your criteria.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('date')}
                      >
                        Date {getSortIcon('date')}
                      </TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Stock #</TableCell>
                      <TableCell 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('salesperson_name')}
                      >
                        Salesperson {getSortIcon('salesperson_name')}
                      </TableCell>
                      <TableCell 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('type')}
                      >
                        Type {getSortIcon('type')}
                      </TableCell>
                      <TableCell 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('fe_gross')}
                      >
                        FE Gross {getSortIcon('fe_gross')}
                      </TableCell>
                      <TableCell 
                        sx={{ cursor: 'pointer' }}
                        onClick={() => handleSort('be_gross')}
                      >
                        BE Gross {getSortIcon('be_gross')}
                      </TableCell>
                      <TableCell>Days Since Deal</TableCell>
                      <TableCell>Bank</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDeals.map((deal) => {
                      const daysSince = getDaysSinceDeal(deal.date);
                      return (
                        <TableRow key={deal.id} hover>
                          <TableCell>{deal.id}</TableCell>
                          <TableCell>{formatDate(deal.date)}</TableCell>
                          <TableCell 
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleDealClick(deal)}
                          >
                            {deal.name || '-'}
                          </TableCell>
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
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDealClick(deal)}
                                  color="info"
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark as Funded">
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDialog(deal)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
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

        {/* Deal Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Deal #{selectedDeal?.id} - {selectedDeal?.name}
              </Typography>
              <IconButton onClick={handleCloseDetailDialog}>
                <ClearIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedDeal && (
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    Basic Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Stock Number</Typography>
                  <Typography variant="body1">{selectedDeal.stock_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{formatDate(selectedDeal.date)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip label={selectedDeal.type || 'Unknown'} size="small" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Salesperson</Typography>
                  <Typography variant="body1">{selectedDeal.salesperson_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Bank</Typography>
                  <Typography variant="body1">{selectedDeal.bank || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Funded Status</Typography>
                  <Chip 
                    label="Not Funded" 
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                {/* Financial Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                    Financial Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">FE Gross</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(selectedDeal.fe_gross)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">BE Gross</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(selectedDeal.be_gross)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Total Gross</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency((selectedDeal.fe_gross || 0) + (selectedDeal.be_gross || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Split %</Typography>
                  <Typography variant="body1">{selectedDeal.split ? `${selectedDeal.split}%` : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">AVP</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.avp)}</Typography>
                </Grid>

                {/* Product Sales */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                    Product Sales
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Reserve</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.reserve)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Rewards</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.rewards)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">VSC</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.vsc)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Maintenance</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.maintenance)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">GAP</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.gap)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Cilajet</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.cilajet)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Diamon</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.diamon)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Key</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.key_product)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Collision</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.collision_product)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Dent</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.dent_product)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Excess</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.excess)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">PPF</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.ppf)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">Wheel & Tire</Typography>
                  <Typography variant="body1">{formatCurrency(selectedDeal.wheel_and_tire)}</Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenDialog(selectedDeal);
              }}
            >
              Mark as Funded
            </Button>
          </DialogActions>
        </Dialog>

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
