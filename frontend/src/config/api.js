// API Configuration
const API_CONFIG = {
  // Automatically detect environment and use appropriate backend URL
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001'  // Local development
    : 'https://bmw-backend-g3lg5epgu-chris-projects-92828244.vercel.app', // Production
  
  // API endpoints
  ENDPOINTS: {
    AUTH: '/api/auth',
    DEALS: '/api/deals',
    SALESPERSONS: '/api/salespersons',
    REPORTS: '/api/reports',
    SPIFFS: '/api/spiffs'
  }
};

export default API_CONFIG;
