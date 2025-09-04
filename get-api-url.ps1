# Get API Gateway URL and save configuration
$apiUrl = aws cloudformation describe-stacks --stack-name "osdu-data-explorer-prod-api" --region eu-west-1 --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" --output text

if ($apiUrl) {
    Write-Host "API Gateway URL: $apiUrl" -ForegroundColor Green
    
    # Save to config file for frontend
    @{
        REACT_APP_API_URL = $apiUrl
    } | ConvertTo-Json | Out-File -FilePath "aws-config.json"
    
    Write-Host "Configuration saved to aws-config.json" -ForegroundColor Blue
} else {
    Write-Error "Could not retrieve API Gateway URL"
}