const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Your OSDU token - can be updated via API
let OSDU_TOKEN = 'eyJraWQiOiIxWEt2bzZIQ1wvaE50WnFlXC9WQWdKOVN0aXo2WCtTUFwvV3V1MksrdnZHMXhZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNDE4MDRlOC00MDAxLTcwNDktYmNjYy02MzQyZjk3MDJkZjUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9mTFJBVDJ6SUYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI1dnI5YTJhb2R1aW1jbnJmN29sYWI0aTRwIiwib3JpZ2luX2p0aSI6ImE3OWQ4ZmJkLWVjMGMtNGI1NS04NGFjLTE3NjBkY2FkNzc0MCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3NkdU9uQXdzXC9vc2R1T25BV1NVc2VyIiwiYXV0aF90aW1lIjoxNzU2ODM5MTkyLCJleHAiOjE3NTY4NDI3MzIsImlhdCI6MTc1Njg0MDkzMiwianRpIjoiNTA5ODZhYzktMGM4My00NTQxLTkzMTYtZGM0YWNjMDVjMjliIiwidXNlcm5hbWUiOiJtenB0dG9AYW1hem9uLmNvLnVrIn0.GW5jylHIcQKxdxWyupFtF3itexODQNZOnAHM6RpnyO0wPWY9l56nKgcy0ptAFuOlpHPn9X94Efal9o9zfeoeAC_qWw4SJjXezVffsRz5ZL_fzoVXyZs0V6U0T5P9hSA-alynqeSBdj-3gWAMeBIHFhT44lZYYzBRfMDjD7bDPwyPQ3RidWL7MH-O16Jr_2XA3DE_VaXgaXo7iBetAg7GNQ7FePF-Bba5xUIbW7P8xs4Qp8q5cOTuBz5cZvdqTFyNu3F_9UXySeyHh7xf3lzIwk9gAVT0ysQGIsoT3Ah8kYv7w9xgdAYLdnoLoORyeS_7ueX4O8IHfX95SOpT1kmOwA';

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

// Token refresh endpoint
app.post('/api/refresh-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  // Remove 'Bearer ' prefix if it exists, since we add it in the headers
  OSDU_TOKEN = token.replace(/^Bearer\s+/i, '').trim();
  console.log('🔄 Token updated successfully');
  res.json({ message: 'Token updated successfully' });
});

app.listen(PORT, () => {
  console.log(`🚀 OSDU Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to OSDU demo-stage environment`);
});