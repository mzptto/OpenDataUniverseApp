# OSDU Data Explorer - AWS Deployment Guide

## 🎉 Deployment Status: LIVE

**Live Application URL**: https://prod.d3ibmynp1ulq33.amplifyapp.com

## Architecture Overview

The OSDU Data Explorer has been successfully migrated to a fully serverless AWS architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AWS Amplify   │    │   API Gateway    │    │ Lambda Functions│
│  (React App)    │───▶│  (REST API)      │───▶│ (Backend Logic) │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ AWS Secrets     │
                                               │ Manager         │
                                               │ (OSDU Creds)    │
                                               └─────────────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │ OSDU APIs       │
                                               │ (External)      │
                                               └─────────────────┘
```

## Deployed Components

### 🌐 Frontend (AWS Amplify)
- **Service**: AWS Amplify Hosting
- **URL**: https://prod.d3ibmynp1ulq33.amplifyapp.com
- **Features**: 
  - Automatic SSL certificate
  - Global CDN distribution
  - Automatic builds and deployments

### ⚡ Backend (Serverless)
- **API Gateway**: https://zitygaox8b.execute-api.eu-west-1.amazonaws.com/prod
- **Lambda Functions**:
  - `osdu-data-explorer-prod-search-api` - Handles OSDU search requests
  - `osdu-data-explorer-prod-storage-api` - Retrieves individual records
  - `osdu-data-explorer-prod-token-api` - Manages OSDU token refresh

### 🔐 Security & Configuration
- **AWS Secrets Manager**: Stores OSDU API credentials securely
- **Cognito User Pool**: Ready for user authentication (optional)
- **IAM Roles**: Proper permissions for Lambda execution

## API Endpoints

The application uses these serverless API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | POST | Search OSDU data |
| `/api/storage/{recordId}` | GET | Get specific record |
| `/api/refresh-token` | POST | Update OSDU token |

## Infrastructure as Code

All AWS resources are defined in CloudFormation templates:

- `infrastructure/cloudformation-template.yaml` - Core infrastructure
- `infrastructure/api-gateway-template.yaml` - API Gateway and Lambda functions

## Deployment Scripts

Ready-to-use PowerShell scripts for deployment:

- `infrastructure/deploy.ps1` - Deploy core infrastructure
- `infrastructure/deploy-api.ps1` - Deploy API Gateway and Lambda functions
- `infrastructure/package-lambdas.ps1` - Package and update Lambda code
- `deploy-to-amplify.ps1` - Deploy frontend to Amplify

## Cost Optimization

The serverless architecture provides excellent cost optimization:

- **Pay-per-use**: Only charged when application is used
- **Auto-scaling**: Handles traffic spikes automatically
- **No idle costs**: No servers running when not in use

**Estimated Monthly Costs**:
- AWS Amplify: $1-5 (depending on traffic)
- API Gateway: $3.50 per million requests
- Lambda: $0.20 per 1M requests + compute time
- Secrets Manager: $0.40 per secret per month
- **Total**: $5-20/month for typical usage

## Monitoring & Maintenance

### CloudWatch Logs
- Lambda function logs available in AWS CloudWatch
- API Gateway access logs and metrics
- Amplify build and deployment logs

### Updating the Application

1. **Frontend Updates**:
   ```powershell
   amplify publish
   ```

2. **Backend Updates**:
   ```powershell
   .\infrastructure\package-lambdas.ps1
   ```

3. **Infrastructure Changes**:
   ```powershell
   .\infrastructure\deploy.ps1
   .\infrastructure\deploy-api.ps1
   ```

### OSDU Token Management

Update OSDU credentials when needed:
```powershell
.\infrastructure\update-token.ps1
```

## Security Best Practices Implemented

✅ **Credentials Security**: OSDU tokens stored in AWS Secrets Manager  
✅ **HTTPS Everywhere**: SSL/TLS encryption for all communications  
✅ **IAM Roles**: Least privilege access for Lambda functions  
✅ **CORS Configuration**: Proper cross-origin resource sharing  
✅ **Environment Separation**: Production environment isolation  

## Troubleshooting

### Common Issues

1. **API Gateway 502 Errors**:
   - Check Lambda function logs in CloudWatch
   - Verify OSDU token is valid in Secrets Manager

2. **Frontend Build Failures**:
   - Check Amplify build logs
   - Verify environment variables are set

3. **OSDU API Connection Issues**:
   - Update token using `update-token.ps1`
   - Check network connectivity from Lambda

### Support Resources

- **AWS CloudWatch**: Monitor application performance
- **AWS X-Ray**: Trace requests through the system
- **Amplify Console**: Frontend deployment status
- **API Gateway Console**: Backend API monitoring

## Next Steps (Optional Enhancements)

1. **Custom Domain**: Set up custom domain name
2. **User Authentication**: Enable Cognito user sign-up/sign-in
3. **Monitoring Dashboards**: Create CloudWatch dashboards
4. **CI/CD Pipeline**: Automate deployments with GitHub Actions
5. **Performance Optimization**: Implement caching strategies

## Team Access

To give team members access to manage the deployment:

1. **AWS Console Access**: Add users to appropriate IAM groups
2. **Amplify CLI**: Team members need to run `amplify pull d3ibmynp1ulq33`
3. **Git Repository**: Ensure all team members have access to this repository

---

## 🚀 Success!

Your OSDU Data Explorer is now running on a production-ready, scalable AWS infrastructure. The application is live and ready for use by your team and stakeholders.

**Live URL**: https://prod.d3ibmynp1ulq33.amplifyapp.com