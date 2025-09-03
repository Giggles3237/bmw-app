import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
  Paper,
  Container,
  TextField,
  Button,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import DealList from './components/DealList';
import DealForm from './components/DealForm';
import SalespersonReport from './components/SalespersonReport';
import UnitReport from './components/UnitReport';

const drawerWidth = 240;

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, view: 'deals' },
  { text: 'Add Deal', icon: <AddIcon />, view: 'add' },
  { text: 'Salesperson Report', icon: <PersonIcon />, view: 'salespersonReport' },
  { text: 'Unit Report', icon: <AssessmentIcon />, view: 'unitReport' },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('deals');
  const [salespersonId, setSalespersonId] = useState(() => {
    return localStorage.getItem('salespersonId') || '';
  });
  const [savedId, setSavedId] = useState(() => localStorage.getItem('salespersonId') || '');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSaveId = () => {
    localStorage.setItem('salespersonId', salespersonId);
    setSavedId(salespersonId);
  };

  const handleNavigation = (newView) => {
    setView(newView);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          BMW Sales
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={view === item.view}
              onClick={() => handleNavigation(item.view)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: view === item.view ? 'white' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.view === view)?.text || 'BMW Sales Management'}
            </Typography>
            
            {/* Salesperson ID Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
                label="Salesperson ID"
                type="number"
                value={salespersonId}
                onChange={(e) => setSalespersonId(e.target.value)}
                sx={{ width: '120px' }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleSaveId}
                sx={{ minWidth: 'auto' }}
              >
                Save
              </Button>
              {savedId && (
                <Chip
                  label={`ID: ${savedId}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* Navigation Drawer */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: '64px',
          }}
        >
          <Container maxWidth="xl">
            <Paper sx={{ p: 3, minHeight: 'calc(100vh - 120px)' }}>
              {view === 'deals' && <DealList />}
              {view === 'add' && <DealForm />}
              {view === 'salespersonReport' && (
                <SalespersonReport salespersonId={savedId} />
              )}
              {view === 'unitReport' && <UnitReport />}
            </Paper>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;