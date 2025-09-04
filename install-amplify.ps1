# Install AWS Amplify dependencies
Write-Host "Installing AWS Amplify dependencies..." -ForegroundColor Blue

npm install aws-amplify @aws-amplify/ui-react

if ($LASTEXITCODE -eq 0) {
    Write-Host "Amplify dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Error "Failed to install Amplify dependencies"
    exit 1
}