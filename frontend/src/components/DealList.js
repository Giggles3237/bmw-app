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
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function DealList() {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    startDate: null,
    endDate: null,
    salesperson: '',
    type: '',
    minFeGross: '',
    maxFeGross: '',
    minBeGross: '',
    maxBeGross: '',
    bank: '',
    status: ''
  });

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/deals', { params: { limit: 1000 } });
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

    // Apply filters
    if (filters.month) {
      filtered = filtered.filter(deal => deal.month === parseInt(filters.month));
    }
    if (filters.year) {
      filtered = filtered.filter(deal => deal.year === parseInt(filters.year));
    }
    if (filters.startDate) {
      filtered = filtered.filter(deal => new Date(deal.date) >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(deal => new Date(deal.date) <= filters.endDate);
    }
    if (filters.salesperson) {
      filtered = filtered.filter(deal => 
        deal.salesperson_name && deal.salesperson_name.toLowerCase().includes(filters.salesperson.toLowerCase())
      );
    }
    if (filters.type) {
      filtered = filtered.filter(deal => deal.type === filters.type);
    }
    if (filters.minFeGross) {
      filtered = filtered.filter(deal => deal.fe_gross >= parseFloat(filters.minFeGross));
    }
    if (filters.maxFeGross) {
      filtered = filtered.filter(deal => deal.fe_gross <= parseFloat(filters.maxFeGross));
    }
    if (filters.minBeGross) {
      filtered = filtered.filter(deal => deal.be_gross >= parseFloat(filters.minBeGross));
    }
    if (filters.maxBeGross) {
      filtered = filtered.filter(deal => deal.be_gross <= parseFloat(filters.maxBeGross));
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
    setFilters({
      month: '',
      year: '',
      startDate: null,
      endDate: null,
      salesperson: '',
      type: '',
      minFeGross: '',
      maxFeGross: '',
      minBeGross: '',
      maxBeGross: '',
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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique values for dropdowns
  const uniqueTypes = [...new Set(deals.map(deal => deal.type).filter(Boolean))];
  const uniqueBanks = [...new Set(deals.map(deal => deal.bank).filter(Boolean))];
  const uniqueSalespersons = [...new Set(deals.map(deal => deal.salesperson_name).filter(Boolean))];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Deal Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
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
          </CardContent>
        </Card>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Month"
                    type="number"
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    inputProps={{ min: 1, max: 12 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Year"
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(date) => handleFilterChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="End Date"
                    value={filters.endDate}
                    onChange={(date) => handleFilterChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Salesperson"
                    value={filters.salesperson}
                    onChange={(e) => handleFilterChange('salesperson', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Min FE Gross"
                    type="number"
                    value={filters.minFeGross}
                    onChange={(e) => handleFilterChange('minFeGross', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Max FE Gross"
                    type="number"
                    value={filters.maxFeGross}
                    onChange={(e) => handleFilterChange('maxFeGross', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Min BE Gross"
                    type="number"
                    value={filters.minBeGross}
                    onChange={(e) => handleFilterChange('minBeGross', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Max BE Gross"
                    type="number"
                    value={filters.maxBeGross}
                    onChange={(e) => handleFilterChange('maxBeGross', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                  <TableRow key={deal.id} hover>
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
      </Box>
    </LocalizationProvider>
  );
}

export default DealList;