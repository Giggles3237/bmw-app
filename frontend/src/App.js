import React, { useState, useEffect } from 'react';
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
  Chip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountBalance as AccountBalanceIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import DealList from './components/DealList';
import DealForm from './components/DealForm';
import SalespersonReport from './components/SalespersonReport';
import UnitReport from './components/UnitReport';
import Admin from './components/Admin';
import Funding from './components/Funding';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

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
  { text: 'Dashboard', icon: <DashboardIcon />, view: 'deals', roles: ['admin', 'manager', 'salesperson', 'finance', 'viewer'] },
  { text: 'Funding', icon: <AccountBalanceIcon />, view: 'funding', roles: ['admin', 'manager', 'finance'] },
  { text: 'Salesperson Report', icon: <PersonIcon />, view: 'salespersonReport', roles: ['admin', 'manager', 'salesperson'] },
  { text: 'Unit Report', icon: <AssessmentIcon />, view: 'unitReport', roles: ['admin', 'manager', 'finance', 'viewer'] },
  { text: 'Admin', icon: <SettingsIcon />, view: 'admin', roles: ['admin'] },
  { text: 'User Management', icon: <PeopleIcon />, view: 'userManagement', roles: ['admin'] },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('deals');
  const [salespersonId, setSalespersonId] = useState(() => {
    return localStorage.getItem('salespersonId') || '';
  });
  const [savedId, setSavedId] = useState(() => localStorage.getItem('salespersonId') || '');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Deal form modal state
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [dealFormMode, setDealFormMode] = useState('add'); // 'add' or 'edit'
  const [dealFormData, setDealFormData] = useState(null);
  const [dealListRefreshKey, setDealListRefreshKey] = useState(0);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSaveId = () => {
    localStorage.setItem('salespersonId', salespersonId);
    setSavedId(salespersonId);
  };

  const handleNavigation = (newView, options = {}) => {
    setView(newView);
    setMobileOpen(false);
    
    // Handle deal form modal
    if (newView === 'add' || options.editMode) {
      setDealFormMode(options.editMode ? 'edit' : 'add');
      setDealFormData(options.dealData || null);
      setDealFormOpen(true);
    }
  };

  const handleDealFormClose = () => {
    setDealFormOpen(false);
    setDealFormData(null);
    setDealFormMode('add');
  };

  const handleDealFormSuccess = () => {
    // Refresh the DealList component by incrementing the refresh key
    setDealListRefreshKey(prev => prev + 1);
    setDealFormOpen(false);
    setDealFormData(null);
    setDealFormMode('add');
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setView('deals');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Filter menu items based on user role
  const filteredMenuItems = user ? menuItems.filter(item => 
    item.roles.includes(user.role)
  ) : [];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          BMW Sales
        </Typography>
      </Toolbar>
      <List>
        {filteredMenuItems.map((item) => (
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
              {view === 'deals' && 'Deal Dashboard'}
              {view === 'funding' && 'Funding'}
              {view === 'salespersonReport' && 'Salesperson Report'}
              {view === 'unitReport' && 'Unit Report'}
              {view === 'admin' && 'Admin'}
              {view === 'userManagement' && 'User Management'}
            </Typography>
            
            {/* User Menu */}
            {user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  {user.first_name} {user.last_name}
                </Typography>
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  sx={{ p: 0 }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
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
              {!user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <>
                  {view === 'deals' && <DealList onNavigate={handleNavigation} key={dealListRefreshKey} />}
                  {view === 'funding' && <Funding />}
                  {view === 'salespersonReport' && (
                    <SalespersonReport salespersonId={savedId} />
                  )}
                  {view === 'unitReport' && <UnitReport />}
                  {view === 'admin' && <Admin />}
                  {view === 'userManagement' && <UserManagement />}
                </>
              )}
            </Paper>
          </Container>
        </Box>

        {/* Deal Form Modal */}
        <DealForm
          open={dealFormOpen}
          onClose={handleDealFormClose}
          onSuccess={handleDealFormSuccess}
          editMode={dealFormMode === 'edit'}
          dealData={dealFormData}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;