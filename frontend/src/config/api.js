// API Configuration
//
// We support three scenarios for determining the backend base URL:
// 1. When a `REACT_APP_API_BASE_URL` environment variable is provided we use it.
//    This lets deployments (including Vercel preview/production builds) control
//    the API endpoint without requiring a code change.
// 2. During local development we continue to default to the Express server
//    running on port 3001.
// 3. In hosted environments where the frontend and backend are deployed
//    together (for example the production build served by Vercel) we fall
//    back to relative `/api` paths so the browser uses the same origin.
const BASE_URL = process.env.REACT_APP_API_BASE_URL
  || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

const API_CONFIG = {
  BASE_URL,
  
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
