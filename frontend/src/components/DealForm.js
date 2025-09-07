import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { format } from 'date-fns';
import CalculateIcon from '@mui/icons-material/Calculate';

function DealForm({ open, onClose, onSuccess, editMode = false, dealData = null }) {
  const [form, setForm] = useState({
    // Basic Information
    deal_number: '',
    external_id: '',
    date: new Date(),
    bank: 'BMW',
    funded_date: '',
    funded: false,
    funded_timestamp: null,
    stock_number: '',
    name: '',
    salesperson: '',
    finance_manager: '',
    type: '',
    
    // Financial Information
    fe_gross: '',
    avp: '',
    msrp: '',
    brand: 'BMW',
    be_gross: '',
    reserve: '',
    rewards: '',
    
    // Product Sales
    vsc: '',
    maintenance: '',
    gap: '',
    cilajet: '',
    key_product: '',
    collision_product: '',
    dent_product: '',
    excess: '',
    ppf: '',
    wheel_and_tire: '',
    product_count: '',
    
    // Status Flags
    registration_complete_date: '',
    
    // Notes
    notes: ''
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [salespersons, setSalespersons] = useState([]);
  const [salespersonsLoading, setSalespersonsLoading] = useState(true);
  const [avpCalculationMode, setAvpCalculationMode] = useState('direct'); // 'direct' or 'calculated'
       const [productCalculationModes, setProductCalculationModes] = useState({
    vsc: 'direct',
    maintenance: 'direct',
    gap: 'direct',
    cilajet: 'direct',
    key_product: 'direct',
    collision_product: 'direct',
    dent_product: 'direct',
    excess: 'direct',
    ppf: 'direct',
    wheel_and_tire: 'direct'
  });

  // Reset form when modal opens/closes or edit mode changes
  useEffect(() => {
    if (open) {
      if (editMode && dealData) {
        setForm({
          ...dealData,
          date: dealData.date ? new Date(dealData.date) : new Date(),
          funded_date: dealData.funded_date ? new Date(dealData.funded_date) : '',
          payoff_sent: dealData.payoff_sent ? new Date(dealData.payoff_sent) : '',
          registration_sent: dealData.registration_sent ? new Date(dealData.registration_sent) : '',
          funded: dealData.funded || false,
          funded_timestamp: dealData.funded_timestamp || null
        });
      } else {
        setForm({
          deal_number: '',
          external_id: '',
          date: new Date(),
          bank: 'BMW',
          funded_date: '',
          funded: false,
          funded_timestamp: null,
          stock_number: '',
          name: '',
          salesperson: '',
          finance_manager: '',
          type: '',
          fe_gross: '',
          avp: '',
          msrp: '',
          brand: 'BMW',
          be_gross: '',
          reserve: '',
          rewards: '',
          vsc: '',
          maintenance: '',
          gap: '',
          cilajet: '',
          key_product: '',
          collision_product: '',
          dent_product: '',
          excess: '',
          ppf: '',
          wheel_and_tire: '',
          product_count: '',
          clean: false,
          payoff_flag: false,
          payoff_sent: '',
          atc_flag: false,
          registration_sent: '',
          notes: ''
        });
      }
      setMessage(null);
      setLoading(false);
    }
  }, [open, editMode, dealData]);

  // Fetch salespersons when component mounts
  useEffect(() => {
    const fetchSalespersons = async () => {
      try {
        setSalespersonsLoading(true);
        const response = await axios.get('/api/salespersons');
        // Ensure we always set an array, even if the API returns something else
        setSalespersons(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching salespersons:', error);
        // Set empty array on error to prevent map errors
        setSalespersons([]);
      } finally {
        setSalespersonsLoading(false);
      }
    };
    
    fetchSalespersons();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDateChange = (field, date) => {
    setForm({ ...form, [field]: date });
  };

  const handleFundedToggle = () => {
    const now = new Date();
    setForm(prev => ({
      ...prev,
      funded: !prev.funded,
      funded_timestamp: !prev.funded ? now : null,
      funded_date: !prev.funded ? now : ''
    }));
  };

  // AVP calculation based on brand and MSRP
  const calculateAVP = (msrp, brand) => {
    if (!msrp || !brand) return '';
    
    const msrpValue = parseFloat(msrp);
    const adjustedMSRP = msrpValue - 1175; // Subtract $1,175 from MSRP
    
    if (adjustedMSRP <= 0) return '0.00'; // Prevent negative values
    
    const percentages = {
      'BMW': 0.05, // 5%
      'MINI': 0.04 // 4%
    };
    
    const percentage = percentages[brand] || 0;
    return (adjustedMSRP * percentage).toFixed(2);
  };

  const handleAVPModeChange = (mode) => {
    setAvpCalculationMode(mode);
    if (mode === 'calculated') {
      // Clear direct AVP input when switching to calculated mode
      setForm({ ...form, avp: '' });
    } else {
      // Clear MSRP and brand when switching to direct mode
      setForm({ ...form, msrp: '', brand: 'BMW' });
    }
  };

  const handleMSRPChange = (e) => {
    const msrp = e.target.value;
    setForm({ ...form, msrp });
    
    if (avpCalculationMode === 'calculated' && msrp && form.brand) {
      const calculatedAVP = calculateAVP(msrp, form.brand);
      setForm({ ...form, msrp, avp: calculatedAVP });
    }
  };

  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setForm({ ...form, brand });
    
    if (avpCalculationMode === 'calculated' && form.msrp && brand) {
      const calculatedAVP = calculateAVP(form.msrp, brand);
      setForm({ ...form, brand, avp: calculatedAVP });
    }
  };

  // Product calculation handlers
  const handleProductModeChange = (product, mode) => {
    setProductCalculationModes(prev => ({ ...prev, [product]: mode }));
    
    if (mode === 'calculated') {
      // Clear direct gross input when switching to calculated mode
      setForm({ ...form, [product]: '' });
    } else {
      // Clear price and cost when switching to direct mode
      setForm({ ...form, [`${product}_price`]: '', [`${product}_cost`]: '' });
    }
  };

  const handleProductPriceChange = (product, price) => {
    setForm({ ...form, [`${product}_price`]: price });
    
    if (productCalculationModes[product] === 'calculated' && price && form[`${product}_cost`]) {
      const calculatedGross = (parseFloat(price) - parseFloat(form[`${product}_cost`])).toFixed(2);
      setForm({ ...form, [`${product}_price`]: price, [product]: calculatedGross });
    }
  };

  const handleProductCostChange = (product, cost) => {
    setForm({ ...form, [`${product}_cost`]: cost });
    
    if (productCalculationModes[product] === 'calculated' && form[`${product}_price`] && cost) {
      const calculatedGross = (parseFloat(form[`${product}_price`]) - parseFloat(cost)).toFixed(2);
      setForm({ ...form, [`${product}_cost`]: cost, [product]: calculatedGross });
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepare payload - convert empty strings to undefined and format dates
      const payload = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== '' && form[key] !== null && form[key] !== undefined) {
          // Format dates to YYYY-MM-DD format for MySQL
          if (form[key] instanceof Date) {
            payload[key] = form[key].toISOString().split('T')[0];
          } else {
            payload[key] = form[key];
          }
        }
      });
      
      if (editMode && dealData) {
        // Update existing deal
        await axios.put(`/api/deals/${dealData.id}`, payload);
        setMessage({ type: 'success', text: 'Deal updated successfully!' });
      } else {
        // Create new deal
        await axios.post('/api/deals', payload);
        setMessage({ type: 'success', text: 'Deal saved successfully!' });
        
        // Clear form for new deal
        setForm({
          deal_number: '', external_id: '', date: new Date(), bank: 'BMW', funded_date: '',
          funded: false, funded_timestamp: null, stock_number: '', name: '', salesperson: '', finance_manager: '', type: '',
          fe_gross: '', avp: '', msrp: '', brand: 'BMW', be_gross: '', reserve: '', rewards: '', vsc: '', 
          maintenance: '', gap: '', cilajet: '', key_product: '', 
          collision_product: '', dent_product: '', excess: '', ppf: '', 
          wheel_and_tire: '', product_count: '', clean: false, payoff_flag: false, 
          payoff_sent: '', atc_flag: false, registration_sent: '', notes: ''
        });
        setAvpCalculationMode('direct');
        setProductCalculationModes({
          vsc: 'direct',
          maintenance: 'direct',
          gap: 'direct',
          cilajet: 'direct',
          key_product: 'direct',
          collision_product: 'direct',
          dent_product: 'direct',
          excess: 'direct',
          ppf: 'direct',
          wheel_and_tire: 'direct'
        });
      }
      
      // Close modal after successful save (with a small delay to show success message)
      setTimeout(() => {
        onSuccess ? onSuccess() : onClose();
      }, 1500);
      
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save deal: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    setLoading(false);
    onClose();
  };

  const renderField = (field, label, type = 'text', required = false, options = null) => {
    if (type === 'select' && options) {
      return (
        <FormControl fullWidth required={required}>
          <InputLabel>{label}</InputLabel>
          <Select
            name={field}
            value={form[field]}
            label={label}
            onChange={handleChange}
          >
            <MenuItem value="">Select {label}</MenuItem>
            {options.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    if (type === 'date') {
      return (
        <DatePicker
          label={label}
          value={form[field]}
          onChange={(date) => handleDateChange(field, date)}
          renderInput={(params) => <TextField {...params} fullWidth required={required} />}
        />
      );
    }

    if (type === 'number') {
      return (
        <TextField
          fullWidth
          label={label}
          name={field}
          type="number"
          value={form[field]}
          onChange={handleChange}
          required={required}
          inputProps={{ step: '0.01' }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      );
    }

    return (
      <TextField
        fullWidth
        label={label}
        name={field}
        type={type}
        value={form[field]}
        onChange={handleChange}
        required={required}
      />
    );
  };

  const renderSwitch = (field, label) => (
    <FormControlLabel
      control={
        <Switch
          name={field}
          checked={form[field]}
          onChange={handleChange}
        />
      }
      label={label}
    />
  );

  const renderProductField = (product, label) => {
    const mode = productCalculationModes[product];
    
    return (
      <Grid item xs={12} sm={6} md={3}>
        <Card variant="outlined" sx={{ p: 1, position: 'relative' }}>
          {/* Calculator Icon Button */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
            <Tooltip title={mode === 'calculated' ? 'Switch to direct entry' : 'Calculate from price & cost'}>
              <IconButton
                size="small"
                onClick={() => handleProductModeChange(product, mode === 'calculated' ? 'direct' : 'calculated')}
                tabIndex={-1}
                sx={{
                  backgroundColor: mode === 'calculated' ? '#1976d2' : '#f5f5f5',
                  color: mode === 'calculated' ? 'white' : '#666',
                  '&:hover': {
                    backgroundColor: mode === 'calculated' ? '#1565c0' : '#e0e0e0',
                  },
                  transition: 'all 0.2s ease-in-out',
                  transform: mode === 'calculated' ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <CalculateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', pr: 4 }}>
            {label}
          </Typography>
          
          {mode === 'direct' ? (
                         <TextField
               fullWidth
               size="small"
               label=""
               name={product}
               type="number"
               value={form[product]}
               onChange={handleChange}
               inputProps={{ step: '0.01' }}
               InputProps={{
                 startAdornment: <InputAdornment position="start">$</InputAdornment>,
               }}
             />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                label="Product Price"
                name={`${product}_price`}
                type="number"
                value={form[`${product}_price`] || ''}
                onChange={(e) => handleProductPriceChange(product, e.target.value)}
                inputProps={{ step: '0.01' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Product Cost"
                name={`${product}_cost`}
                type="number"
                value={form[`${product}_cost`] || ''}
                onChange={(e) => handleProductCostChange(product, e.target.value)}
                inputProps={{ step: '0.01' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
                             <TextField
                 fullWidth
                 size="small"
                 label="Calculated"
                 value={form[product] ? `$${form[product]}` : ''}
                 InputProps={{
                   readOnly: true,
                 }}
                 sx={{ 
                   backgroundColor: '#f8f9fa',
                   '& .MuiInputBase-input': {
                     fontWeight: 'bold',
                     color: '#1976d2'
                   }
                 }}
                 helperText={form[`${product}_price`] && form[`${product}_cost`] ? 
                   `$${form[`${product}_price`]} - $${form[`${product}_cost`]} = $${form[product]}` : 
                   'Enter price and cost to calculate'
                 }
               />
            </Box>
          )}
        </Card>
      </Grid>
    );
  };

    return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" component="h2">
            {editMode ? 'Edit Deal' : 'Add New Deal'}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Basic Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderField('deal_number', 'Deal Number', 'text', true)}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderField('date', 'Date', 'date', true)}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderField('bank', 'Bank')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant={form.funded ? "contained" : "outlined"}
                        color={form.funded ? "success" : "primary"}
                        onClick={handleFundedToggle}
                        sx={{
                          minHeight: '56px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {form.funded ? 'Funded' : 'Not Funded'}
                      </Button>
                      {form.funded_timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Last toggled: {new Date(form.funded_timestamp).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderField('stock_number', 'Stock Number')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderField('name', 'Customer Name', 'text', true)}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant={form.registration_complete_date ? "contained" : "outlined"}
                        color={form.registration_complete_date ? "success" : "primary"}
                        onClick={() => {
                          const today = new Date();
                          setForm(prev => ({
                            ...prev,
                            registration_complete_date: form.registration_complete_date ? '' : today.toISOString().split('T')[0]
                          }));
                        }}
                        sx={{
                          minHeight: '56px',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {form.registration_complete_date ? 'Registered' : 'Not Registered'}
                      </Button>
                      {form.registration_complete_date && (
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Registered: {format(new Date(form.registration_complete_date), 'MM/dd/yyyy')}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    {renderField('type', 'Vehicle Type', 'select', false, ['New BMW', 'New MINI', 'CPO BMW', 'CPO MINI', 'Used BMW', 'Used MINI'])}
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Salesperson</InputLabel>
                      <Select
                        name="salesperson"
                        value={form.salesperson}
                        label="Salesperson"
                        onChange={handleChange}
                        disabled={salespersonsLoading}
                      >
                        <MenuItem value="">
                          {salespersonsLoading ? 'Loading...' : 'Select Salesperson'}
                        </MenuItem>
                        {salespersons && salespersons.length > 0 ? (
                          salespersons.map(salesperson => (
                            <MenuItem key={salesperson.id} value={salesperson.name}>
                              {salesperson.name}
                            </MenuItem>
                          ))
                        ) : (
                          !salespersonsLoading && (
                            <MenuItem value="" disabled>
                              No salespersons available
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    {renderField('finance_manager', 'Finance Manager')}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Financial Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    {renderField('fe_gross', 'FE Gross', 'number')}
                  </Grid>
                  
                  {/* AVP Section */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card variant="outlined" sx={{ p: 1, position: 'relative' }}>
                      {/* Calculator Icon Button */}
                      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                        <Tooltip title={avpCalculationMode === 'calculated' ? 'Switch to direct entry' : 'Calculate from MSRP & brand'}>
                          <IconButton
                            size="small"
                            onClick={() => handleAVPModeChange(avpCalculationMode === 'calculated' ? 'direct' : 'calculated')}
                            tabIndex={-1}
                            sx={{
                              backgroundColor: avpCalculationMode === 'calculated' ? '#1976d2' : '#f5f5f5',
                              color: avpCalculationMode === 'calculated' ? 'white' : '#666',
                              '&:hover': {
                                backgroundColor: avpCalculationMode === 'calculated' ? '#1565c0' : '#e0e0e0',
                              },
                              transition: 'all 0.2s ease-in-out',
                              transform: avpCalculationMode === 'calculated' ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            <CalculateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', pr: 4 }}>
                        AVP
                      </Typography>
                      
                      {avpCalculationMode === 'direct' ? (
                        <TextField
                          fullWidth
                          size="small"
                          label="AVP"
                          name="avp"
                          type="number"
                          value={form.avp}
                          onChange={handleChange}
                          inputProps={{ step: '0.01' }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="MSRP"
                            name="msrp"
                            type="number"
                            value={form.msrp}
                            onChange={handleMSRPChange}
                            inputProps={{ step: '0.01' }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel>Brand</InputLabel>
                            <Select
                              name="brand"
                              value={form.brand}
                              label="Brand"
                              onChange={handleBrandChange}
                            >
                              <MenuItem value="BMW">BMW (5%)</MenuItem>
                              <MenuItem value="MINI">MINI (4%)</MenuItem>
                            </Select>
                          </FormControl>
                          <TextField
                            fullWidth
                            size="small"
                            label="Calculated AVP"
                            value={form.avp ? `$${form.avp}` : ''}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{ 
                              backgroundColor: '#f8f9fa',
                              '& .MuiInputBase-input': {
                                fontWeight: 'bold',
                                color: '#1976d2'
                              }
                            }}
                            helperText={form.msrp && form.brand ? 
                              `${form.brand} rate: ${form.brand === 'BMW' ? '5%' : '4%'} of ($${form.msrp} - $1,175)` : 
                              'Enter MSRP and select brand to calculate'
                            }
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    {renderField('be_gross', 'BE Gross', 'number')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    {renderField('reserve', 'Reserve', 'number')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    {renderField('rewards', 'Rewards', 'number')}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Product Sales */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title={`Product Sales (${(() => {
                const productFields = ['vsc', 'maintenance', 'gap', 'cilajet', 'key_product', 'collision_product', 'dent_product', 'excess', 'ppf', 'wheel_and_tire'];
                return productFields.filter(field => form[field] && form[field] !== '').length;
              })()})`} />
              <CardContent>
                <Grid container spacing={2}>
                  {renderProductField('vsc', 'VSC')}
                  {renderProductField('maintenance', 'Maintenance')}
                  {renderProductField('gap', 'GAP')}
                  {renderProductField('cilajet', 'Cilajet')}
                  {renderProductField('key_product', 'Key')}
                  {renderProductField('collision_product', 'Collision')}
                  {renderProductField('dent_product', 'Dent')}
                  {renderProductField('excess', 'Excess')}
                  {renderProductField('ppf', 'PPF')}
                  {renderProductField('wheel_and_tire', 'Wheel & Tire')}
                </Grid>
              </CardContent>
            </Card>

            {/* Status Flags */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Status Flags" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ minWidth: 120 }}>
                        Funded:
                      </Typography>
                      <Chip 
                        label={form.funded ? 'Funded' : 'Not Funded'} 
                        color={form.funded ? 'success' : 'default'}
                        variant="outlined"
                      />
                      {form.funded_date && (
                        <Typography variant="caption" color="text.secondary">
                          ({format(new Date(form.funded_date), 'MM/dd/yyyy')})
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ minWidth: 120 }}>
                        Registration Complete:
                      </Typography>
                      <Chip 
                        label={form.registration_complete_date ? 'Complete' : 'Pending'} 
                        color={form.registration_complete_date ? 'success' : 'default'}
                        variant="outlined"
                      />
                      {form.registration_complete_date && (
                        <Typography variant="caption" color="text.secondary">
                          ({format(new Date(form.registration_complete_date), 'MM/dd/yyyy')})
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Notes" />
              <CardContent>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </CardContent>
            </Card>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ minWidth: '200px' }}
          >
            {loading ? <CircularProgress size={24} /> : (editMode ? 'Update Deal' : 'Save Deal')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default DealForm;
