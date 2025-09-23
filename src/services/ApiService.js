export class ApiService {
  static async makeRequest(endpoint, options = {}) {
    const baseUrl = process.env.REACT_APP_API_URL;
    
    if (!baseUrl) {
      throw new Error('REACT_APP_API_URL environment variable is not set');
    }

    const url = `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'content-type': 'application/json',
        ...options.headers
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  static async search(searchBody) {
    return this.makeRequest('/api/search', {
      method: 'POST',
      body: JSON.stringify(searchBody)
    });
  }

  static async getRecord(recordId) {
    return this.makeRequest(`/api/storage/${encodeURIComponent(recordId)}`, {
      method: 'GET'
    });
  }

  static async refreshToken(token) {
    return this.makeRequest('/api/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }
}
