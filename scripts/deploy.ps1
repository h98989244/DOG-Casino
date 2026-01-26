param (
    [string]$EnvFilePath = ".env.local",
    [string]$BranchName = "main"
)

$ErrorActionPreference = "Stop"

# 1. Load Env
Write-Host "Reading configuration from $EnvFilePath..."
if (-not (Test-Path $EnvFilePath)) {
    Write-Error "File $EnvFilePath not found."
    exit 1
}

$content = Get-Content $EnvFilePath -Encoding UTF8 -Raw
# Handle different line endings splitting
$lines = $content -split "\r?\n"
$AppId = $null

foreach ($line in $lines) {
    $line = $line.Trim()
    if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) { continue }
    
    # Simple parsing: Key=Value
    $parts = $line -split '=', 2
    if ($parts.Length -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        
        # Remove quotes
        if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1, $value.Length - 2) }
        elseif ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1, $value.Length - 2) }
        
        if ($key -eq "AMPLIFY_ID") {
            $AppId = $value
        }
    }
}

if (-not $AppId) {
    Write-Error "AMPLIFY_ID not found in $EnvFilePath"
    exit 1
}

Write-Host "App ID: $AppId"
Write-Host "Branch: $BranchName"

# 2. Build
Write-Host "Running build..."
# Use call operator & to ensure command execution
& pnpm build
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Build failed"
    exit 1 
}

# 3. Zip
Write-Host "Step 3: Zipping artifacts..."
$ZipPath = "$PWD\deploy.zip"
if (Test-Path $ZipPath) { Remove-Item $ZipPath }

# Determine dist path
$DistPath = "$PWD\dist"
if (-not (Test-Path $DistPath)) {
    Write-Error "Dist folder not found at $DistPath"
    exit 1
}

# Compress contents of dist
try {
    Compress-Archive -Path "$DistPath\*" -DestinationPath $ZipPath -Force
}
catch {
    Write-Error "Failed to zip: $_"
    exit 1
}

# 4. Create Deployment
Write-Host "Step 4: Creating Amplify deployment (Region: ap-southeast-1)..."
try {
    $output = aws amplify create-deployment --app-id $AppId --branch-name $BranchName --region ap-southeast-1
    Write-Host "AWS Output: $output"
    $createDepJson = $output | Out-String | ConvertFrom-Json
}
catch {
    Write-Error "Failed to create deployment. Error: $_"
    exit 1
}

$JobId = $createDepJson.jobId
$UploadUrl = $createDepJson.zipUploadUrl

if (-not $JobId) {
    Write-Error "Failed to get Job ID from create-deployment output"
    exit 1
}

Write-Host "Job ID: $JobId"
Write-Host "Uploading zip to S3..."

# 5. Upload
try {
    Invoke-RestMethod -Uri $UploadUrl -Method Put -InFile $ZipPath -ContentType "application/zip"
}
catch {
    Write-Error "Failed to upload zip file. $_"
    exit 1
}

# 6. Start Deployment
Write-Host "Starting deployment..."
aws amplify start-deployment --app-id $AppId --branch-name $BranchName --job-id $JobId --region ap-southeast-1

Write-Host "Deployment initiated successfully!"
Write-Host "Check status locally via: aws amplify get-job --app-id $AppId --branch-name $BranchName --job-id $JobId --region ap-southeast-1"
