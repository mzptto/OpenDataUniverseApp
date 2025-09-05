# Fix Amplify Deployment Plan

## Current Issues
- Static assets (JS/CSS) returning 404 errors despite being in deployment ZIP
- Multiple failed deployment attempts with manual ZIP uploads
- Complex infrastructure with mixed manual and CloudFormation resources
- App not accessible at root domain

## Current Infrastructure Audit

### AWS Resources Created:
1. **Amplify App**: `d3uthlzvcucp4k` (osdu-data-explorer)
2. **Lambda Functions**:
   - `osdu-search-api` (working)
   - `osdu-token-api` (working) 
   - `osdu-storage-api` (working with URL encoding fix)
3. **API Gateway**: `zitygaox8b` (working with CORS)
4. **Secrets Manager**: `osdu-data-explorer-prod-osdu-credentials`
5. **IAM Roles**: Various Lambda execution roles

### Working Components:
- ✅ Lambda functions with OSDU API integration
- ✅ API Gateway with proper CORS
- ✅ Storage API with URL encoding fix
- ✅ Secrets Manager integration

### Broken Components:
- ❌ Amplify static asset serving
- ❌ Manual deployment process
- ❌ Root domain routing

## Recommended Solution: Fresh Start with GitHub Integration

### Phase 1: Clean Slate Approach
1. **Delete Current Amplify App**
   ```bash
   aws amplify delete-app --app-id d3uthlzvcucp4k
   ```

2. **Keep Working Infrastructure**
   - Keep Lambda functions (they work perfectly)
   - Keep API Gateway (CORS is configured)
   - Keep Secrets Manager (credentials working)

### Phase 2: GitHub-Connected Amplify Setup
1. **Create New Amplify App with GitHub Integration**
   ```bash
   aws amplify create-app \
     --name "osdu-data-explorer" \
     --repository "https://github.com/mzptto/OpenDataUniverseApp" \
     --access-token "YOUR_GITHUB_TOKEN" \
     --platform WEB
   ```

2. **Create Branch Connected to GitHub**
   ```bash
   aws amplify create-branch \
     --app-id NEW_APP_ID \
     --branch-name main \
     --stage PRODUCTION \
     --enable-auto-build
   ```

3. **Configure Build Settings**
   ```yaml
   # amplify.yml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

### Phase 3: Environment Configuration
1. **Update Environment Variables**
   - Set `REACT_APP_API_URL` to existing API Gateway URL
   - Ensure production build uses deployed Lambda functions

2. **Configure Custom Domain (Optional)**
   - Set up custom domain if needed
   - Configure SSL certificate

### Phase 4: Testing & Validation
1. **Verify Static Assets Load**
2. **Test OSDU API Integration**
3. **Validate Entity Matching Fix**
4. **Test Repeat Icon Functionality**

## Alternative: Debug Current Deployment

If you prefer to fix the current setup:

### Investigation Steps:
1. **Check Deployment Logs**
   ```bash
   aws amplify get-job --app-id d3uthlzvcucp4k --branch-name main --job-id 3
   ```

2. **Verify ZIP Structure**
   - Ensure static files are at root level in ZIP
   - Check for proper directory structure

3. **Manual File Upload Test**
   - Try uploading individual files to S3 bucket
   - Test static asset serving directly

### Quick Fix Attempts:
1. **Add Build Spec File**
   ```yaml
   # Create amplify.yml in project root
   version: 1
   frontend:
     phases:
       build:
         commands:
           - echo "Using pre-built files"
     artifacts:
       baseDirectory: .
       files:
         - '**/*'
   ```

2. **Try Different ZIP Method**
   ```bash
   # From project root
   7z a -tzip amplify-deployment.zip build/*
   ```

## Recommendation: Go with GitHub Integration

**Pros:**
- Automatic deployments on push
- Proper build pipeline
- Better debugging capabilities
- Standard Amplify workflow
- Easier maintenance

**Cons:**
- Need to set up GitHub token
- Slight learning curve

## Next Steps (When You're Back):
1. Choose approach (GitHub integration recommended)
2. Clean up current Amplify app
3. Set up GitHub integration
4. Test deployment
5. Validate all functionality

## Files to Keep:
- All Lambda function code (working perfectly)
- API Gateway configuration (CORS fixed)
- React app fixes (entity matching, URL encoding)
- Environment configuration

## Files to Update:
- Add `amplify.yml` build specification
- Update `.env.production` with new Amplify URL
- Ensure GitHub repository is up to date

---
*Created: 2025-09-04 23:45*
*Status: Ready for implementation*