# Deploy API Gateway and Lambda Functions
param(
    [string]$Environment = "prod",
    [string]$Region = "us-east-1"
)

Write-Host "Deploying OSDU Data Explorer API..." -ForegroundColor Green

# Update OSDU token first
Write-Host "Updating OSDU token..." -ForegroundColor Blue
.\update-token.ps1

# Get Secrets Manager ARN
Write-Host "Getting Secrets Manager ARN..." -ForegroundColor Blue
$secretArn = aws secretsmanager describe-secret --secret-id "osdu-data-explorer-$Environment-osdu-credentials" --query "ARN" --output text

if (-not $secretArn) {
    Write-Error "Could not get Secrets Manager ARN"
    exit 1
}

Write-Host "Secrets Manager ARN: $secretArn" -ForegroundColor Yellow

# Deploy API Gateway and Lambda functions
Write-Host "Deploying API Gateway and Lambda functions..." -ForegroundColor Blue

aws cloudformation deploy `
    --template-file api-gateway-template.yaml `
    --stack-name "osdu-data-explorer-$Environment-api" `
    --parameter-overrides Environment=$Environment SecretsManagerArn=$secretArn `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "API deployed successfully!" -ForegroundColor Green
    
    # Get API Gateway URL
    $apiUrl = aws cloudformation describe-stacks --stack-name "osdu-data-explorer-$Environment-api" --region $Region --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text
    
    Write-Host "=== API Gateway Details ===" -ForegroundColor Cyan
    Write-Host "API URL: $apiUrl" -ForegroundColor White
    Write-Host "Endpoints:" -ForegroundColor White
    Write-Host "  POST $apiUrl/api/search" -ForegroundColor Gray
    Write-Host "  GET  $apiUrl/api/storage/{recordId}" -ForegroundColor Gray
    Write-Host "  POST $apiUrl/api/refresh-token" -ForegroundColor Gray
    
    # Save API URL for frontend configuration
    @{ ApiUrl = $apiUrl } | ConvertTo-Json | Out-File -FilePath "api-config.json"
    Write-Host "API configuration saved to api-config.json" -ForegroundColor Green
    
} else {
    Write-Error "API deployment failed!"
    exit 1
}