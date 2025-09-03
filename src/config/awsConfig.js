import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: process.env.REACT_APP_COGNITO_DOMAIN?.replace('https://', ''),
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [process.env.REACT_APP_REDIRECT_URI],
          redirectSignOut: [process.env.REACT_APP_LOGOUT_URI],
          responseType: 'code'
        }
      }
    }
  }
};

// Configure Amplify immediately
if (process.env.REACT_APP_USER_POOL_ID) {
  Amplify.configure(awsConfig);
}

export default awsConfig;