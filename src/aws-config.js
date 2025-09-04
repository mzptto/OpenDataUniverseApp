// AWS Configuration for Amplify
const awsConfig = {
  Auth: {
    region: 'eu-west-1',
    userPoolId: 'eu-west-1_XXXXXXXXX', // Will be updated with actual values
    userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Will be updated with actual values
    identityPoolId: 'eu-west-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', // Will be updated with actual values
  },
  API: {
    endpoints: [
      {
        name: 'osduApi',
        endpoint: process.env.REACT_APP_API_URL || 'https://your-api-gateway-url',
        region: 'eu-west-1'
      }
    ]
  }
};

export default awsConfig;