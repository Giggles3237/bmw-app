import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function DealList({ onNavigate }) {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    // Set default range to include available data (2018)
    const startDate = new Date(2018, 0, 1); // January 1, 2018
    const endDate = new Date(2025, 11, 31); // December 31, 2025
    return {
      startDate: startDate,
      endDate: endDate,
      salesperson: '',
      type: '',
      bank: '',
      status: ''
    };
  });

  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('yearToDate');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Deal detail dialog states
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current month and year for default filtering
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
      const currentYear = today.getFullYear();
      
      // For now, let's fetch all deals without date filtering to see what's available
      const response = await axios.get('/api/deals', { 
        params: { 
          limit: 1000 
        } 
      });
      setDeals(response.data);
      setFilteredDeals(response.data);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...deals];

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

    // Apply date filters - convert Date objects to month/year for backend filtering
    if (filters.startDate) {
      const startMonth = filters.startDate.getMonth() + 1; // getMonth() returns 0-11
      const startYear = filters.startDate.getFullYear();
      filtered = filtered.filter(deal => {
        if (!deal.month || !deal.year) return false;
        return (deal.year > startYear) || 
               (deal.year === startYear && deal.month >= startMonth);
      });
    }
    if (filters.endDate) {
      const endMonth = filters.endDate.getMonth() + 1;
      const endYear = filters.endDate.getFullYear();
      filtered = filtered.filter(deal => {
        if (!deal.month || !deal.year) return false;
        return (deal.year < endYear) || 
               (deal.year === endYear && deal.month <= endMonth);
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

    setFilteredDeals(filtered);
  }, [deals, searchTerm, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    const today = new Date();
    // Set default range to include available data (2018-2025)
    const startDate = new Date(2018, 0, 1); // January 1, 2018
    const endDate = new Date(2025, 11, 31); // December 31, 2025
    setFilters({
      startDate: startDate,
      endDate: endDate,
      salesperson: '',
      type: '',
      bank: '',
      status: ''
    });
    setSearchTerm('');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      default: return 'Year to Date';
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

  const handleDateRangeSelect = (range) => {
    setSelectedDateRange(range);
    setShowCustomPicker(false);
    
    const now = new Date();
    let newStartDate = filters.startDate;
    let newEndDate = filters.endDate;
    
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.getTime() === 0) return '-';
    return date.toLocaleDateString();
  };

  // Get unique values for dropdowns
  const uniqueTypes = [...new Set(deals.map(deal => deal.type).filter(Boolean))];
  const uniqueBanks = [...new Set(deals.map(deal => deal.bank).filter(Boolean))];
  const uniqueSalespersons = [...new Set(deals.map(deal => deal.salesperson_name).filter(Boolean))];

  // Handle deal row click
  const handleDealClick = (deal) => {
    setSelectedDeal(deal);
    setDetailDialogOpen(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedDeal(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Deal Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => onNavigate && onNavigate('add')}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': {
                  backgroundColor: '#1565c0',
                }
              }}
            >
              Add Deal
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear All
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
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
                  onClick={fetchDeals}
                  disabled={loading}
                  fullWidth
                >
                  Refresh
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
            Showing {filteredDeals.length} of {deals.length} deals
          </Typography>
          <Chip 
            label={`Total FE Gross: ${formatCurrency(filteredDeals.reduce((sum, deal) => sum + (deal.fe_gross || 0), 0))}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          /* Deals Table */
          <TableContainer component={Paper} sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Stock #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Salesperson</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell>FE Gross</TableCell>
                  <TableCell>BE Gross</TableCell>
                  <TableCell>Total Gross</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow 
                    key={deal.id} 
                    hover 
                    onClick={() => handleDealClick(deal)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <TableCell>{deal.id}</TableCell>
                    <TableCell>{formatDate(deal.date)}</TableCell>
                    <TableCell>{deal.stock_number || '-'}</TableCell>
                    <TableCell>{deal.name || '-'}</TableCell>
                    <TableCell>{deal.salesperson_name || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={deal.type || 'Unknown'} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{deal.bank || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(deal.fe_gross)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(deal.be_gross)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {formatCurrency((deal.fe_gross || 0) + (deal.be_gross || 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredDeals.length === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                No deals found matching your criteria
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Deal Detail Dialog */}
        <Dialog 
          open={detailDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Deal #{selectedDeal?.id} - {selectedDeal?.name}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={selectedDeal.funded ? 'Funded' : 'Not Funded'} 
                      color={selectedDeal.funded ? 'success' : 'default'}
                      variant="outlined"
                      size="small"
                    />
                    {selectedDeal.funded_timestamp && (
                      <Typography variant="caption" color="text.secondary">
                        ({new Date(selectedDeal.funded_timestamp).toLocaleDateString()})
                      </Typography>
                    )}
                  </Box>
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
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => {
                // Navigate to edit form with the selected deal data
                if (onNavigate && selectedDeal) {
                  onNavigate('add', { editMode: true, dealData: selectedDeal });
                }
                handleCloseDialog();
              }}
            >
              Edit Deal
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}

export default DealList;