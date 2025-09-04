# Update OSDU Token in Secrets Manager
$token = "eyJraWQiOiIxWEt2bzZIQ1wvaE50WnFlXC9WQWdKOVN0aXo2WCtTUFwvV3V1MksrdnZHMXhZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNDE4MDRlOC00MDAxLTcwNDktYmNjYy02MzQyZjk3MDJkZjUiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9mTFJBVDJ6SUYiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiI1dnI5YTJhb2R1aW1jbnJmN29sYWI0aTRwIiwib3JpZ2luX2p0aSI6IjNjNTk3MmQ4LWEwMDYtNGIyMi05YWExLTgyZTM5ZGRjNWZmYiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoib3NkdU9uQXdzXC9vc2R1T25BV1NVc2VyIiwiYXV0aF90aW1lIjoxNzU2OTk3ODY2LCJleHAiOjE3NTY5OTk2NjYsImlhdCI6MTc1Njk5Nzg2NiwianRpIjoiNzJkYzNhNGMtMjMzMi00MWI0LTlhMjgtYmVlYmI3MjI4YTEwIiwidXNlcm5hbWUiOiJtenB0dG9AYW1hem9uLmNvLnVrIn0.SPGLwo5m3GqLC3H_z_QBbehzfHoXfT-UAgKFOL8HmxoF30UKc34lH-uBjoYTsO2xyfMg5Oadhp12K4U42lJWdv9KiGGfhyWMebAfzjLEeimwDdz4eSALi_R87C3MBh0xkzzqgAsEd_vWIi9W_sDO8rORDIM5z7hI8uwuF-Kr2_foDmzOzhlY9IcPNMfq-Um8JKvB_ejJB2kDmVJlHrQ2vg-P6XcNrgQZGe1egZiLmeXEFCYJZPYC7kXiWtHKb2sa0_ywWGgtzTUYzWyqT1961NZxMPA2NkAOEh7YoM7kGVbw38VjpVC5U8sbbaN7I47BZIZWdkmbDJSbnIQ7lGPQ5w"

$secretValue = @{
    token = $token
    apiUrl = "https://demo-stage.edioperations.aws.com"
    dataPartition = "osdu"
} | ConvertTo-Json

Write-Host "Updating OSDU token in Secrets Manager..." -ForegroundColor Blue

aws secretsmanager update-secret `
    --secret-id "osdu-data-explorer-prod-osdu-credentials" `
    --secret-string $secretValue

if ($LASTEXITCODE -eq 0) {
    Write-Host "Token updated successfully!" -ForegroundColor Green
} else {
    Write-Error "Failed to update token"
    exit 1
}