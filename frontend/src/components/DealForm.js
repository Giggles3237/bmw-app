import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

function DealForm() {
  const [form, setForm] = useState({
    // Basic Information
    external_id: '',
    date: '',
    month: '',
    year: '',
    bank: '',
    funded_date: '',
    stock_number: '',
    name: '',
    salesperson: '',
    finance_manager: '',
    type: '',
    split: '',
    split2: '',
    
    // Vehicle Information
    used_car_source: '',
    age: '',
    
    // Financial Information
    fe_gross: '',
    avp: '',
    be_gross: '',
    reserve: '',
    rewards: '',
    
    // Product Sales
    vsc: '',
    maintenance: '',
    gap: '',
    cilajet: '',
    diamon: '',
    key_product: '',
    collision_product: '',
    dent_product: '',
    excess: '',
    ppf: '',
    wheel_and_tire: '',
    product_count: '',
    
    // Additional Fees
    money: '',
    titling: '',
    mileage: '',
    license_insurance: '',
    fees: '',
    
    // Status Flags
    clean: false,
    payoff_flag: false,
    payoff_sent: '',
    atc_flag: false,
    registration_sent: '',
    
    // Notes
    notes: ''
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleDateChange = (field, date) => {
    setForm({ ...form, [field]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // Prepare payload - convert empty strings to undefined
      const payload = {};
      Object.keys(form).forEach((key) => {
        if (form[key] !== '' && form[key] !== null && form[key] !== undefined) {
          payload[key] = form[key];
        }
      });
      
      await axios.post('/api/deals', payload);
      setMessage({ type: 'success', text: 'Deal saved successfully!' });
      
      // Clear form
      setForm({
        external_id: '', date: '', month: '', year: '', bank: '', funded_date: '',
        stock_number: '', name: '', salesperson: '', finance_manager: '', type: '',
        split: '', split2: '', used_car_source: '', age: '', fe_gross: '', avp: '',
        be_gross: '', reserve: '', rewards: '', vsc: '', maintenance: '', gap: '',
        cilajet: '', diamon: '', key_product: '', collision_product: '', dent_product: '',
        excess: '', ppf: '', wheel_and_tire: '', product_count: '', money: '',
        titling: '', mileage: '', license_insurance: '', fees: '', clean: false,
        payoff_flag: false, payoff_sent: '', atc_flag: false, registration_sent: '', notes: ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save deal: ' + (err.response?.data?.error || err.message) });
    } finally {
      setLoading(false);
    }
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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Deal
        </Typography>
        
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
                  {renderField('external_id', 'External ID', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('date', 'Date', 'date', true)}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('month', 'Month', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('year', 'Year', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  {renderField('bank', 'Bank')}
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  {renderField('funded_date', 'Funded Date', 'date')}
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  {renderField('stock_number', 'Stock Number')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('name', 'Customer Name', 'text', true)}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('type', 'Vehicle Type')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('salesperson', 'Salesperson')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('finance_manager', 'Finance Manager')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('split', 'Split %', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('split2', 'Split 2 %', 'number')}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Vehicle Information" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('used_car_source', 'Used Car Source')}
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  {renderField('age', 'Age', 'number')}
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
                <Grid item xs={12} sm={6} md={4}>
                  {renderField('avp', 'AVP', 'number')}
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
            <CardHeader title="Product Sales" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('vsc', 'VSC', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('maintenance', 'Maintenance', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('gap', 'GAP', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('cilajet', 'Cilajet', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('diamon', 'Diamon', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('key_product', 'Key Product', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('collision_product', 'Collision Product', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('dent_product', 'Dent Product', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('excess', 'Excess', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('ppf', 'PPF', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('wheel_and_tire', 'Wheel & Tire', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('product_count', 'Product Count', 'number')}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Fees */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Additional Fees" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('money', 'Money', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('titling', 'Titling', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('mileage', 'Mileage', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('license_insurance', 'License/Insurance', 'number')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('fees', 'Fees', 'number')}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Status Flags */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Status Flags" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  {renderSwitch('clean', 'Clean')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderSwitch('payoff_flag', 'Payoff Flag')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderSwitch('atc_flag', 'ATC Flag')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('payoff_sent', 'Payoff Sent', 'date')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderField('registration_sent', 'Registration Sent', 'date')}
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

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ minWidth: '200px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Deal'}
            </Button>
          </Box>
        </form>
      </Box>
    </LocalizationProvider>
  );
}

export default DealForm;