# OSDU Data Explorer - Infrastructure Deployment Script
param(
    [string]$Environment = "prod",
    [string]$Region = "us-east-1"
)

$StackName = "osdu-data-explorer-$Environment"
$TemplateFile = "cloudformation-template.yaml"

Write-Host "Deploying OSDU Data Explorer Infrastructure..." -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host "Stack Name: $StackName" -ForegroundColor Yellow

# Verify AWS CLI is configured
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "AWS Account: $($identity.Account)" -ForegroundColor Green
    Write-Host "User: $($identity.Arn)" -ForegroundColor Green
} catch {
    Write-Error "AWS CLI not configured. Run 'aws configure' first."
    exit 1
}

# Deploy CloudFormation stack
Write-Host "Deploying CloudFormation stack..." -ForegroundColor Blue

aws cloudformation deploy `
    --template-file $TemplateFile `
    --stack-name $StackName `
    --parameter-overrides Environment=$Environment `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "Infrastructure deployed successfully!" -ForegroundColor Green
    
    # Get stack outputs
    Write-Host "Getting stack outputs..." -ForegroundColor Blue
    $outputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs" --output json | ConvertFrom-Json
    
    Write-Host "=== Infrastructure Details ===" -ForegroundColor Cyan
    foreach ($output in $outputs) {
        Write-Host "$($output.OutputKey): $($output.OutputValue)" -ForegroundColor White
    }
    
    # Save outputs to file for later use
    $outputs | ConvertTo-Json -Depth 3 | Out-File -FilePath "infrastructure-outputs.json"
    Write-Host "Outputs saved to infrastructure-outputs.json" -ForegroundColor Green
    
} else {
    Write-Error "Infrastructure deployment failed!"
    exit 1
}