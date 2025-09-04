# Package and Deploy Lambda Functions
param(
    [string]$Environment = "prod"
)

$functions = @("search-api", "storage-api", "token-api")

Write-Host "Packaging Lambda functions..." -ForegroundColor Green

foreach ($func in $functions) {
    Write-Host "Processing $func..." -ForegroundColor Blue
    
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $rootDir = Split-Path -Parent $scriptDir
    $funcDir = Join-Path $rootDir "lambda-functions\$func"
    $zipFile = Join-Path $scriptDir "$func.zip"
    
    # Install dependencies
    Push-Location $funcDir
    npm install --production
    Pop-Location
    
    # Create zip file
    if (Test-Path $zipFile) {
        Remove-Item $zipFile
    }
    
    Compress-Archive -Path "$funcDir\*" -DestinationPath $zipFile
    
    # Update Lambda function code
    $functionName = "osdu-data-explorer-$Environment-$func"
    Write-Host "Updating $functionName..." -ForegroundColor Yellow
    
    aws lambda update-function-code `
        --function-name $functionName `
        --zip-file "fileb://$zipFile"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$func updated successfully!" -ForegroundColor Green
    } else {
        Write-Error "Failed to update $func"
    }
    
    # Clean up
    Remove-Item $zipFile
}

Write-Host "All Lambda functions updated!" -ForegroundColor Green