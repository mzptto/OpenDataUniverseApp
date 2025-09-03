const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

let authToken = null;

// Test endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OSDU Proxy Server Running', authenticated: !!authToken });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const authResponse = await fetch('https://demo-stage.edioperations.aws.com/auth/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      authToken = authData.access_token;
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy OSDU API calls
app.all('/api/osdu/*', async (req, res) => {
  if (!authToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const osduPath = req.path.replace('/api/osdu', '');
    const osduUrl = `https://demo-stage.edioperations.aws.com${osduPath}`;
    
    const response = await fetch(osduUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'data-partition-id': 'osdu'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`OSDU Proxy running on http://localhost:${PORT}`);
});

module.exports = app;