@'
# Notification Service Setup Script (Windows PowerShell)

Write-Host "🔧 Setting up Notification Service..." -ForegroundColor Cyan

# Create logs directory
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Create templates cache directory
New-Item -ItemType Directory -Force -Path ".template-cache" | Out-Null

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📧 To enable email, configure EMAIL_USER and EMAIL_PASSWORD in .env" -ForegroundColor Yellow
Write-Host "💬 To enable SMS, configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Start the service with: npm run dev" -ForegroundColor Cyan
'@ | Out-File -FilePath scripts\setup.ps1 -Encoding utf8