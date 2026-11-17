Write-Host "Iniciando SOS Pneus & Borracharia 24h (Porta 3336)..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
node server.js
