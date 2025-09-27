import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  Speed as SpeedIcon,
  AccountBalance as BankIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Main Dashboard component providing comprehensive dealership management overview
 * Features:
 * - Key Performance Indicators (KPIs)
 * - Sales performance metrics
 * - Financial summaries
 * - Top performers
 * - Monthly trends
 * - Quick actions
 */
function Dashboard() {
  // State management
  const [dashboardData, setDashboardData] = useState({
    sales: null,
    payroll: null,
    units: null,
    spiffs: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Date picker states
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState('thisMonth');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Fetch data in parallel
      const [salesResponse, payrollResponse, unitsResponse, spiffsResponse] = await Promise.all([
        // Salesperson report data
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/salesperson`, {
          params: { month: currentMonth, year: currentYear }
        }).catch(() => ({ data: [] })),
        
        // Payroll data
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/payroll`, {
          params: { month: currentMonth, year: currentYear }
        }).catch(() => ({ data: [] })),
        
        // Unit report data
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REPORTS}/unit`, {
          params: { month: currentMonth, year: currentYear }
        }).catch(() => ({ data: [] })),
        
        // Spiff summary data
        axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SPIFFS}/summary/${currentMonth}/${currentYear}`)
          .catch(() => ({ data: [] }))
      ]);

      setDashboardData({
        sales: salesResponse.data,
        payroll: payrollResponse.data,
        units: unitsResponse.data,
        spiffs: spiffsResponse.data
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to safely parse numeric values
  const safeParseFloat = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const { sales, payroll, units, spiffs } = dashboardData;
    
    // Sales metrics
    const totalDeals = sales?.reduce((sum, person) => sum + safeParseFloat(person.deal_count), 0) || 0;
    const totalFeGross = sales?.reduce((sum, person) => sum + safeParseFloat(person.fe_gross_total), 0) || 0;
    const totalBeGross = sales?.reduce((sum, person) => sum + safeParseFloat(person.be_gross_total), 0) || 0;
    const totalGross = totalFeGross + totalBeGross;
    
    // Unit metrics
    const totalUnits = units?.reduce((sum, unit) => sum + safeParseFloat(unit.units), 0) || 0;
    const bmwUnits = units?.filter(u => u.type?.includes('BMW')).reduce((sum, unit) => sum + safeParseFloat(unit.units), 0) || 0;
    const miniUnits = units?.filter(u => u.type?.includes('MINI')).reduce((sum, unit) => sum + safeParseFloat(unit.units), 0) || 0;
    
    // Payroll metrics
    const totalPayroll = payroll?.reduce((sum, person) => sum + safeParseFloat(person.total_pay), 0) || 0;
    const avgPayPerPerson = payroll?.length > 0 ? totalPayroll / payroll.length : 0;
    
    // Spiff metrics
    const totalSpiffs = spiffs?.reduce((sum, person) => sum + safeParseFloat(person.total_amount), 0) || 0;
    const approvedSpiffs = spiffs?.reduce((sum, person) => sum + safeParseFloat(person.approved_amount), 0) || 0;
    
    return {
      totalDeals,
      totalGross,
      totalFeGross,
      totalBeGross,
      totalUnits,
      bmwUnits,
      miniUnits,
      totalPayroll,
      avgPayPerPerson,
      totalSpiffs,
      approvedSpiffs,
      activeSalespeople: sales?.length || 0
    };
  };

  // Get top performers
  const getTopPerformers = () => {
    const { sales, payroll } = dashboardData;
    
    if (!sales || !payroll) return { topSalespeople: [], topEarners: [] };
    
    // Top salespeople by units
    const topSalespeople = [...sales]
      .sort((a, b) => safeParseFloat(b.deal_count) - safeParseFloat(a.deal_count))
      .slice(0, 5);
    
    // Top earners by total pay
    const topEarners = [...payroll]
      .sort((a, b) => safeParseFloat(b.total_pay) - safeParseFloat(a.total_pay))
      .slice(0, 5);
    
    return { topSalespeople, topEarners };
  };

  // Get product performance
  const getProductPerformance = () => {
    const { sales } = dashboardData;
    
    if (!sales) return [];
    
    const productTotals = sales.reduce((acc, person) => {
      acc.vsc += safeParseFloat(person.vsc_total);
      acc.gap += safeParseFloat(person.gap_total);
      acc.maintenance += safeParseFloat(person.maintenance_total);
      acc.cilajet += safeParseFloat(person.cilajet_total);
      acc.wheelAndTire += safeParseFloat(person.wheel_and_tire_total);
      return acc;
    }, {
      vsc: 0,
      gap: 0,
      maintenance: 0,
      cilajet: 0,
      wheelAndTire: 0
    });
    
    return [
      { name: 'VSC', amount: productTotals.vsc, color: '#1976d2' },
      { name: 'GAP', amount: productTotals.gap, color: '#388e3c' },
      { name: 'Maintenance', amount: productTotals.maintenance, color: '#f57c00' },
      { name: 'Cilajet', amount: productTotals.cilajet, color: '#7b1fa2' },
      { name: 'Wheel & Tire', amount: productTotals.wheelAndTire, color: '#d32f2f' }
    ].sort((a, b) => b.amount - a.amount);
  };

  const formatCurrency = (amount) => {
    const safeAmount = safeParseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  const formatNumber = (num) => {
    const safeNum = safeParseFloat(num);
    return new Intl.NumberFormat('en-US').format(safeNum);
  };

  const getDateRangeLabel = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  const metrics = calculateMetrics();
  const { topSalespeople, topEarners } = getTopPerformers();
  const productPerformance = getProductPerformance();

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Dealership Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getDateRangeLabel()} • Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            onClick={(e) => setDateAnchorEl(e.currentTarget)}
            sx={{ minWidth: 150 }}
          >
            {getDateRangeLabel()}
          </Button>
          
          <Menu
            anchorEl={dateAnchorEl}
            open={Boolean(dateAnchorEl)}
            onClose={() => setDateAnchorEl(null)}
          >
            <MenuItem onClick={() => {
              const now = new Date();
              setMonth(now.getMonth() + 1);
              setYear(now.getFullYear());
              setDateAnchorEl(null);
              fetchDashboardData();
            }}>
              <ListItemIcon><CalendarIcon /></ListItemIcon>
              <ListItemText primary="This Month" />
            </MenuItem>
            <MenuItem onClick={() => {
              const now = new Date();
              const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth();
              const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
              setMonth(lastMonth);
              setYear(lastYear);
              setDateAnchorEl(null);
              fetchDashboardData();
            }}>
              <ListItemIcon><CalendarIcon /></ListItemIcon>
              <ListItemText primary="Last Month" />
            </MenuItem>
          </Menu>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(metrics.totalUnits)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Units Sold
                  </Typography>
                </Box>
                <ShippingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(metrics.totalGross)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Gross Profit
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(metrics.totalPayroll)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Payroll
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            height: '100%'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatNumber(metrics.totalDeals)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Deals
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatNumber(metrics.bmwUnits)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                BMW Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 'bold' }}>
                {formatNumber(metrics.miniUnits)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MINI Units
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                {formatCurrency(metrics.totalFeGross)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Front-End Gross
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                {formatCurrency(metrics.totalBeGross)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Back-End Gross
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                {formatCurrency(metrics.avgPayPerPerson)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Pay per Person
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ textAlign: 'center', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                {formatCurrency(metrics.totalSpiffs)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Spiffs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Top Performers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top Performers
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Salesperson</TableCell>
                      <TableCell align="right">Units</TableCell>
                      <TableCell align="right">Gross</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topSalespeople.map((person, index) => (
                      <TableRow key={person.salesperson || index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {index < 3 && (
                              <StarIcon 
                                sx={{ 
                                  fontSize: 16, 
                                  color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                                  mr: 1 
                                }} 
                              />
                            )}
                            {person.salesperson || 'Unassigned'}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={safeParseFloat(person.deal_count)} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(safeParseFloat(person.fe_gross_total) + safeParseFloat(person.be_gross_total))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Performance */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Product Performance
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                {productPerformance.map((product, index) => (
                  <Box key={product.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(product.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={productPerformance[0]?.amount > 0 ? (product.amount / productPerformance[0].amount) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: product.color,
                          borderRadius: 4
                        }
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Unit Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Unit Breakdown
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle Type</TableCell>
                      <TableCell align="right">Units</TableCell>
                      <TableCell align="right">FE Gross</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.units?.map((unit, index) => (
                      <TableRow key={unit.type || index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: unit.type?.includes('BMW') ? '#1976d2' : '#f57c00',
                                mr: 1
                              }}
                            />
                            {unit.type || 'Unknown'}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={safeParseFloat(unit.units)} 
                            size="small" 
                            color={unit.type?.includes('BMW') ? 'primary' : 'secondary'} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(unit.fe_gross_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                <SpeedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AssessmentIcon />}
                    sx={{ py: 2 }}
                  >
                    View Reports
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<MoneyIcon />}
                    sx={{ py: 2 }}
                  >
                    Payroll
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<PeopleIcon />}
                    sx={{ py: 2 }}
                  >
                    Add Deal
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<TrophyIcon />}
                    sx={{ py: 2 }}
                  >
                    Manage Spiffs
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active Salespeople
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {metrics.activeSalespeople}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
