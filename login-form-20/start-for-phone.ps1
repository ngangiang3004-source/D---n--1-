# Chay web + huong dan mo tren dien thoai (can HTTPS cho Tro ly AI)
$root = $PSScriptRoot
Write-Host ""
Write-Host "=== SONUS TACTIC - Mo web cho dien thoai ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Server dang chay tai: http://192.168.1.249:8080" -ForegroundColor Yellow
Write-Host "   (Xem lai IP bang lenh: ipconfig)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "2. Tren DIEN THOAI, Tro ly AI can link HTTPS." -ForegroundColor Yellow
Write-Host "   Cai ngrok: https://ngrok.com/download" -ForegroundColor DarkGray
Write-Host "   Mo terminal MOI va chay: ngrok http 8080" -ForegroundColor Green
Write-Host "   Mo link https://.... tren dien thoai" -ForegroundColor Green
Write-Host ""
Write-Host "3. Tren MAY TINH, Tro ly AI dung:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080/home.html" -ForegroundColor Green
Write-Host ""
Write-Host "Nhan Ctrl+C de tat server." -ForegroundColor DarkGray
Write-Host ""

Set-Location $root
python -m http.server 8080 --bind 0.0.0.0
