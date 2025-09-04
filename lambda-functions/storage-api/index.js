const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
        // Get record ID from path parameters
        const recordId = event.pathParameters?.recordId;
        if (!recordId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Record ID is required' })
            };
        }

        console.log('📦 Storage Request for record:', recordId);
        
        // Get OSDU credentials from Secrets Manager
        const secretName = process.env.OSDU_SECRET_NAME;
        const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        const credentials = JSON.parse(secret.SecretString);
        
        // Make request to OSDU Storage API
        const fetch = require('node-fetch');
        const response = await fetch(`https://demo-stage.edioperations.aws.com/api/storage/v2/records/${encodeURIComponent(recordId)}`, {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${credentials.token}`,
                'content-type': 'application/json',
                'data-partition-id': credentials.dataPartition || 'osdu'
            }
        });

        const data = await response.json();
        
        console.log('📦 Storage Response Status:', response.status);
        
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('❌ Storage Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};