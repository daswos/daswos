Write-Host "`n============================================================"
Write-Host "🚀 Starting Daswos Application..."
Write-Host "============================================================`n"
Write-Host "🔗 Application will be available at: http://localhost:3000`n"
Write-Host "============================================================`n"

# Get the directory where this script is located
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptPath

# Run the npm command
npm run dev
