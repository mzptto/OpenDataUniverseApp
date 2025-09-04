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
        // Parse request body
        const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { token } = requestBody;
        
        if (!token) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Token is required' })
            };
        }
        
        console.log('🔄 Token refresh request received');
        
        // Remove 'Bearer ' prefix if it exists
        const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
        
        // Get current secret
        const secretName = process.env.OSDU_SECRET_NAME;
        const secret = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
        const credentials = JSON.parse(secret.SecretString);
        
        // Update token in credentials
        credentials.token = cleanToken;
        
        // Update secret in Secrets Manager
        await secretsManager.updateSecret({
            SecretId: secretName,
            SecretString: JSON.stringify(credentials)
        }).promise();
        
        console.log('🔄 Token updated successfully in Secrets Manager');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Token updated successfully' })
        };
        
    } catch (error) {
        console.error('❌ Token Update Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};