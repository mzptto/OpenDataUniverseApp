# Deploy React App to AWS Amplify
Write-Host "Deploying OSDU Data Explorer to AWS Amplify..." -ForegroundColor Green

# Build the React app for production
Write-Host "Building React app..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully!" -ForegroundColor Green
    
    # Deploy to Amplify (if already initialized)
    Write-Host "Publishing to Amplify..." -ForegroundColor Blue
    amplify publish --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful!" -ForegroundColor Green
        Write-Host "Your app should be available at the Amplify URL" -ForegroundColor Cyan
    } else {
        Write-Error "Amplify publish failed"
    }
} else {
    Write-Error "Build failed"
}