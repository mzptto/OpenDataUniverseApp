require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// OSDU token loaded from environment — set OSDU_TOKEN in your .env file
let OSDU_TOKEN = process.env.OSDU_TOKEN || '';

app.use(cors());
app.use(express.json());

// Search endpoint proxy
app.post('/api/search', async (req, res) => {
  try {
    console.log('🔍 Search Request:', JSON.stringify(req.body, null, 2));
    
    const response = await fetch('https://demo-stage.edioperations.aws.com/api/search/v2/query_with_cursor', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${OSDU_TOKEN}`,
        'content-type': 'application/json',
        'data-partition-id': 'osdu'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    
    console.log('📊 Search Response Status:', response.status);
    console.log('📊 Results Count:', data.results?.length || 0);
    if (data.results?.length > 0) {
      console.log('📊 First Result Kind:', data.results[0].kind);
      console.log('📊 First Result Type:', data.results[0].type);
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Search Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Storage endpoint proxy
app.get('/api/storage/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const response = await fetch(`https://demo-stage.edioperations.aws.com/api/storage/v2/records/${encodeURIComponent(recordId)}`, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${OSDU_TOKEN}`,
        'content-type': 'application/json',
        'data-partition-id': 'osdu'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token refresh endpoint — requires X-Refresh-Secret header to prevent unauthorized token replacement
app.post('/api/refresh-token', (req, res) => {
  const secret = process.env.REFRESH_SECRET;
  if (secret && req.headers['x-refresh-secret'] !== secret) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  OSDU_TOKEN = token.replace(/^Bearer\s+/i, '').trim();
  console.log('Token updated successfully');
  res.json({ message: 'Token updated successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 OSDU Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to OSDU demo-stage environment`);
  if (!OSDU_TOKEN) {
    console.warn('⚠️  OSDU_TOKEN is not set — requests will be rejected until a token is supplied.');
  }
});