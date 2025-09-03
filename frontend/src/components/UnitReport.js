import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  ToggleButton,
  ToggleButtonGroup,
  Chip,
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
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
  ViewWeek as ViewWeekIcon,
  ViewModule as ViewModuleIcon,
  Settings as SettingsIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

/**
 * Generates a summary of deals grouped by vehicle type.  Users can
 * filter by month and year.  This corresponds to the Unit Report
 * sheet in the Excel workbook.
 */
function UnitReport() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPerUnit, setShowPerUnit] = useState(false);
  
  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [dealDetails, setDealDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [detailSortConfig, setDetailSortConfig] = useState({});

  const fetchReport = async () => {
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
      
      const response = await axios.get('/api/reports/unit', { params });
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch report when component mounts with MTD defaults
  useEffect(() => {
    fetchReport();
  }, []); // Empty dependency array means this runs once on mount

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const calculatePerUnit = (total, units) => {
    if (!units || units === 0) return 0;
    return total / units;
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'New BMW': return '#1976d2';
      case 'Used BMW': return '#388e3c';
      case 'New MINI': return '#f57c00';
      case 'Used MINI': return '#7b1fa2';
      case 'CPO BMW': return '#d32f2f';
      case 'CPO MINI': return '#c2185b';
      default: return '#757575';
    }
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
      fetchReport();
    }, 100);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      setSelectedDateRange('custom');
      fetchReport();
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

  const handleRowExpand = async (vehicleType) => {
    const newExpandedRows = new Set(expandedRows);
    
    if (newExpandedRows.has(vehicleType)) {
      // Collapse
      newExpandedRows.delete(vehicleType);
      setExpandedRows(newExpandedRows);
    } else {
      // Expand
      newExpandedRows.add(vehicleType);
      setExpandedRows(newExpandedRows);
      
      // Fetch deal details if not already loaded
      if (!dealDetails[vehicleType]) {
        setLoadingDetails(prev => ({ ...prev, [vehicleType]: true }));
        
        try {
          const params = {};
          
          if (selectedDateRange === 'custom' && customStartDate && customEndDate) {
            params.start_date = customStartDate;
            params.end_date = customEndDate;
          } else {
            if (month) params.month = month;
            if (year) params.year = year;
          }
          
          params.type = vehicleType;
          
          const response = await axios.get('/api/deals', { params });
          setDealDetails(prev => ({ ...prev, [vehicleType]: response.data }));
        } catch (err) {
          console.error('Failed to fetch deal details:', err);
        } finally {
          setLoadingDetails(prev => ({ ...prev, [vehicleType]: false }));
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDetailSort = (vehicleType, key) => {
    const currentConfig = detailSortConfig[vehicleType] || {};
    let direction = 'asc';
    if (currentConfig.key === key && currentConfig.direction === 'asc') {
      direction = 'desc';
    }
    setDetailSortConfig(prev => ({
      ...prev,
      [vehicleType]: { key, direction }
    }));
  };

  const sortData = (data, config) => {
    if (!config.key) {
      // Default sort by vehicle type in specific order
      const typeOrder = {
        'New BMW': 1,
        'CPO BMW': 2,
        'Used BMW': 3,
        'New MINI': 4,
        'CPO MINI': 5,
        'Used MINI': 6
      };
      
      return [...data].sort((a, b) => {
        const aOrder = typeOrder[a.type] || 999;
        const bOrder = typeOrder[b.type] || 999;
        return aOrder - bOrder;
      });
    }
    
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

  const getSortIcon = (key, currentConfig) => {
    if (currentConfig.key !== key) return null;
    return currentConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
          Unit Report
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Performance analysis by vehicle type
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
                onClick={fetchReport}
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

            <Grid item>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Display:
                </Typography>
                <ToggleButtonGroup
                  value={showPerUnit ? 'pvr' : 'total'}
                  exclusive
                  onChange={(e, value) => setShowPerUnit(value === 'pvr')}
                  size="small"
                >
                  <ToggleButton value="total" sx={{ px: 2 }}>
                    Total
                  </ToggleButton>
                  <ToggleButton value="pvr" sx={{ px: 2 }}>
                    PVR
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
              No data found for the selected date range
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', width: 50 }}></TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => handleSort('type')}
                >
                  Vehicle Type {getSortIcon('type', sortConfig)}
                </TableCell>
                <TableCell 
                  align="center" 
                  sx={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => handleSort('units')}
                >
                  Units {getSortIcon('units', sortConfig)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => handleSort('fe_gross_total')}
                >
                  Front-End Gross {getSortIcon('fe_gross_total', sortConfig)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => handleSort('avp_total')}
                >
                  AVP {getSortIcon('avp_total', sortConfig)}
                </TableCell>
                <TableCell 
                  align="right" 
                  sx={{ fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                  onClick={() => handleSort('be_gross_total')}
                >
                  Back-End Gross {getSortIcon('be_gross_total', sortConfig)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortData(data, sortConfig).map((row, index) => {
                const isExpanded = expandedRows.has(row.type);
                const details = dealDetails[row.type] || [];
                const isLoadingDetails = loadingDetails[row.type];
                
                return (
                  <React.Fragment key={row.type || 'none'}>
                    <TableRow 
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f0f8ff' },
                        transition: 'background-color 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleRowExpand(row.type)}
                    >
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowExpand(row.type);
                          }}
                          sx={{ 
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }}
                        >
                          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: getTypeColor(row.type),
                              flexShrink: 0
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.type || 'Unknown'}
                          </Typography>
                          <Tooltip title="Click to view individual deals">
                            <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={row.units}
                          size="small"
                          sx={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 600,
                            minWidth: 50
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: parseFloat(row.fe_gross_total) >= 0 ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          {showPerUnit 
                            ? formatCurrency(calculatePerUnit(row.fe_gross_total, row.units))
                            : formatCurrency(row.fe_gross_total)
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: parseFloat(row.avp_total) >= 0 ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          {showPerUnit 
                            ? formatCurrency(calculatePerUnit(row.avp_total, row.units))
                            : formatCurrency(row.avp_total)
                          }
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: parseFloat(row.be_gross_total) >= 0 ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          {showPerUnit 
                            ? formatCurrency(calculatePerUnit(row.be_gross_total, row.units))
                            : formatCurrency(row.be_gross_total)
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Details Row */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            {isLoadingDetails ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={24} />
                                <Typography variant="body2" sx={{ ml: 1, alignSelf: 'center' }}>
                                  Loading deal details...
                                </Typography>
                              </Box>
                            ) : details.length > 0 ? (
                              <Card variant="outlined" sx={{ backgroundColor: '#f8f9fa' }}>
                                <CardContent sx={{ py: 2 }}>
                                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                    Individual Deals - {row.type}
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'date')}
                                        >
                                          Date {getSortIcon('date', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'stock_number')}
                                        >
                                          Stock # {getSortIcon('stock_number', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'name')}
                                        >
                                          Customer {getSortIcon('name', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'salesperson_name')}
                                        >
                                          Salesperson {getSortIcon('salesperson_name', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          align="right" 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'fe_gross')}
                                        >
                                          FE Gross {getSortIcon('fe_gross', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          align="right" 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'avp')}
                                        >
                                          AVP {getSortIcon('avp', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                        <TableCell 
                                          align="right" 
                                          sx={{ fontWeight: 600, cursor: 'pointer' }}
                                          onClick={() => handleDetailSort(row.type, 'be_gross')}
                                        >
                                          BE Gross {getSortIcon('be_gross', detailSortConfig[row.type] || {})}
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                                                         <TableBody>
                                       {sortData(details, detailSortConfig[row.type] || {}).map((deal, dealIndex) => (
                                        <TableRow key={deal.id || dealIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'white' } }}>
                                          <TableCell>{formatDate(deal.date)}</TableCell>
                                          <TableCell>{deal.stock_number || 'N/A'}</TableCell>
                                          <TableCell>{deal.name || 'N/A'}</TableCell>
                                          <TableCell>{deal.salesperson_name || 'N/A'}</TableCell>
                                          <TableCell align="right">
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: parseFloat(deal.fe_gross || 0) >= 0 ? '#2e7d32' : '#d32f2f',
                                                fontWeight: 500
                                              }}
                                            >
                                              {formatCurrency(deal.fe_gross)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: parseFloat(deal.avp || 0) >= 0 ? '#2e7d32' : '#d32f2f',
                                                fontWeight: 500
                                              }}
                                            >
                                              {formatCurrency(deal.avp)}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                color: parseFloat(deal.be_gross || 0) >= 0 ? '#2e7d32' : '#d32f2f',
                                                fontWeight: 500
                                              }}
                                            >
                                              {formatCurrency(deal.be_gross)}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </Card>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No individual deals found for this vehicle type
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default UnitReport;