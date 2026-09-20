export const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : process.env.REACT_APP_API_URL;
