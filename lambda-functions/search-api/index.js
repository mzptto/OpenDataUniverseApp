const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        console.log('🔍 Search Request:', JSON.stringify(event.body, null, 2));
        
        // Get OSDU credentials from Secrets Manager
        const secretName = process.env.OSDU_SECRET_NAME;
        const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        const credentials = JSON.parse(secret.SecretString);
        
        // Parse request body
        const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        
        // Make request to OSDU API
        const fetch = require('node-fetch');
        const response = await fetch('https://demo-stage.edioperations.aws.com/api/search/v2/query_with_cursor', {
            method: 'POST',
            headers: {
                'authorization': `Bearer ${credentials.token}`,
                'content-type': 'application/json',
                'data-partition-id': credentials.dataPartition || 'osdu'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        console.log('📊 Search Response Status:', response.status);
        console.log('📊 Results Count:', data.results?.length || 0);
        if (data.results?.length > 0) {
            console.log('📊 First Result Kind:', data.results[0].kind);
            console.log('📊 First Result Type:', data.results[0].type);
        }
        
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('❌ Search Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};