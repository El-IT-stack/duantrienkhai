# ==============================================================================
# HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - ĐỀ TÀI 14
# Script PowerShell: Khởi động toàn bộ hệ thống với 1 lệnh duy nhất
# ==============================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Khởi động Hệ thống Quản lý Dự án - Đề tài 14"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "      HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - ĐỀ TÀI 14" -ForegroundColor Cyan
Write-Host "           KHỞI ĐỘNG TOÀN BỘ HỆ THỐNG VỚI 1 LỆNH DUY NHẤT" -ForegroundColor Yellow
Write-Host "          Sinh viên: Hoàng Xuân Đoàn - MSSV: dtc245200226" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Tự động kiểm tra file .env
if (-not (Test-Path ".env")) {
    Write-Host "[*] File .env chưa tồn tại. Đang tự động sao chép từ .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[✓] Đã tạo file .env thành công." -ForegroundColor Green
    } else {
        Write-Host "[!] Không tìm thấy .env.example, Docker Compose sẽ dùng giá trị mặc định." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[✓] File cấu hình .env đã sẵn sàng." -ForegroundColor Green
}

# 2. Tự động kiểm tra SSL cho HTTPS
if (-not (Test-Path "nginx\ssl\server.crt")) {
    Write-Host "[*] Chứng chỉ SSL chưa có. Đang tự động tạo self-signed SSL cho HTTPS..." -ForegroundColor Yellow
    if (-not (Test-Path "nginx\ssl")) { New-Item -ItemType Directory -Path "nginx\ssl" -Force | Out-Null }
    try {
        $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(5)
        $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
        [System.IO.File]::WriteAllBytes("nginx\ssl\server.crt", $certBytes)
        
        $rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($cert)
        if ($rsa) {
            $keyBytes = $rsa.ExportRSAPrivateKey()
            $pemKey = "-----BEGIN RSA PRIVATE KEY-----`r`n" + [System.Convert]::ToBase64String($keyBytes, [System.Base64FormattingOptions]::InsertLineBreaks) + "`r`n-----END RSA PRIVATE KEY-----"
            [System.IO.File]::WriteAllText("nginx\ssl\server.key", $pemKey)
        }
        Write-Host "[✓] Đã tạo chứng chỉ SSL cho Nginx thành công." -ForegroundColor Green
    } catch {
        Write-Host "[!] Chưa thể tạo SSL tự động, Nginx vẫn phục vụ cổng HTTP 80 bình thường." -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[✓] Chứng chỉ SSL đã sẵn sàng." -ForegroundColor Green
}

# 3. Kiểm tra lệnh Docker
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "[X] LỖI: Không tìm thấy Docker CLI trên máy tính của bạn!" -ForegroundColor Red
    Write-Host "    Vui lòng cài đặt Docker Desktop từ: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    Exit 1
}

# 4. Kiểm tra Docker Daemon & tự động khởi động nếu chưa chạy
$dockerRunning = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
} catch {}

if (-not $dockerRunning) {
    Write-Host "[*] Docker daemon chưa chạy. Đang tự động tìm và khởi động Docker Desktop..." -ForegroundColor Yellow
    $dockerPaths = @(
        "$env:LOCALAPPDATA\Programs\DockerDesktop\Docker Desktop.exe",
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
    )
    $foundPath = $dockerPaths | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($foundPath) {
        Write-Host "[*] Đang khởi chạy: $foundPath" -ForegroundColor Cyan
        Start-Process -FilePath $foundPath
        Write-Host "[*] Đang chờ Docker daemon sẵn sàng..." -ForegroundColor Cyan
        $seconds = 0
        while ($seconds -lt 90) {
            Start-Sleep -Seconds 3
            $seconds += 3
            try {
                $null = docker info 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $dockerRunning = $true
                    break
                }
            } catch {}
            Write-Host "    ...đã đợi $seconds giây..." -ForegroundColor DarkGray
        }
    } else {
        Write-Host "[!] Vui lòng khởi động Docker Desktop từ Start Menu..." -ForegroundColor Yellow
        while (-not $dockerRunning) {
            Start-Sleep -Seconds 3
            try {
                $null = docker info 2>&1
                if ($LASTEXITCODE -eq 0) { $dockerRunning = $true; break }
            } catch {}
        }
    }
}

Write-Host "[✓] Docker daemon đang hoạt động tốt." -ForegroundColor Green
Write-Host ""

# 5. Build và khởi động 9 containers
Write-Host "[*] Đang build và khởi động toàn bộ hệ thống bằng Docker Compose..." -ForegroundColor Cyan
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Khởi động Docker Compose thất bại!" -ForegroundColor Red
    Exit 1
}

Write-Host ""
Write-Host "[*] Đang kiểm tra trạng thái các container..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
docker compose ps

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  🚀 HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG VỚI 1 LỆNH DUY NHẤT!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  [CÁC ĐỊA CHỈ TRUY CẬP DỊCH VỤ]:" -ForegroundColor Yellow
Write-Host "  ----------------------------------------------------------------------------"
Write-Host "  1. 🌐 Ứng dụng Web (Frontend)   : http://localhost" -ForegroundColor White
Write-Host "  2. ⚡ Backend REST API           : http://localhost/api" -ForegroundColor White
Write-Host "  3. 📖 Swagger API Documentation  : http://localhost/api/docs" -ForegroundColor White
Write-Host "  4. 🩺 Health Check               : http://localhost/api/health" -ForegroundColor White
Write-Host "  5. 📊 Prometheus Metrics Raw     : http://localhost/api/metrics" -ForegroundColor White
Write-Host "  6. 🗄️ pgAdmin 4 (Quản trị DB)   : http://localhost:5050" -ForegroundColor White
Write-Host "  7. 📈 Grafana Monitoring         : http://localhost:3001" -ForegroundColor White
Write-Host "  8. 🎯 Prometheus Dashboard       : http://localhost:9090" -ForegroundColor White
Write-Host ""
Write-Host "  [TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH]:" -ForegroundColor Yellow
Write-Host "  ----------------------------------------------------------------------------"
Write-Host "  • Web App (Admin)     : admin@pm.local    | Mật khẩu: Admin@123" -ForegroundColor White
Write-Host "  • Web App (PM Lead)   : pm.minh@pm.local  | Mật khẩu: Admin@123" -ForegroundColor White
Write-Host "  • Web App (Developer) : dev.tuan@pm.local | Mật khẩu: Admin@123" -ForegroundColor White
Write-Host "  • pgAdmin 4           : admin@pm.com      | Mật khẩu: PgAdmin@2026_Secure!" -ForegroundColor White
Write-Host "  • Grafana             : admin             | Mật khẩu: Grafana@2026_Secure!" -ForegroundColor White
Write-Host ""
Write-Host "  [CÁC LỆNH ĐIỀU KHIỂN]:" -ForegroundColor Yellow
Write-Host "  ----------------------------------------------------------------------------"
Write-Host "  • Dừng hệ thống       : .\stop.bat    (hoặc docker compose down)" -ForegroundColor White
Write-Host "  • Xem realtime logs   : .\logs.bat    (hoặc docker compose logs -f)" -ForegroundColor White
Write-Host "  • Kiểm tra trạng thái : .\status.bat  (hoặc docker compose ps)" -ForegroundColor White
Write-Host "  • Xóa toàn bộ dữ liệu : .\clean.bat   (hoặc docker compose down -v)" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host ""

# 6. Mở trình duyệt tự động
Write-Host "[*] Đang tự động mở ứng dụng Web tại http://localhost ..." -ForegroundColor Cyan
Start-Process "http://localhost"
