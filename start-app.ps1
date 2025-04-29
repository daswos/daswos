Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Daswos Application..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Application will be available at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path "DW-1"
npm run dev
