# Script PowerShell tạo chứng chỉ SSL tự ký cho Nginx trên Windows
$sslDir = Join-Path $PSScriptRoot "ssl"
if (!(Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir | Out-Null
}

$opensslPath = "C:\Program Files\Git\usr\bin\openssl.exe"
if (Test-Path $opensslPath) {
    & $opensslPath req -x509 -nodes -days 365 -newkey rsa:2048 `
      -keyout (Join-Path $sslDir "server.key") `
      -out (Join-Path $sslDir "server.crt") `
      -subj "/C=VN/ST=ThaiNguyen/L=ThaiNguyen/O=ICTU/OU=DTC245200226/CN=localhost"
    Write-Host "✅ Tạo chứng chỉ SSL thành công bằng OpenSSL tại $sslDir" -ForegroundColor Green
} else {
    Write-Host "⚠️ OpenSSL không tìm thấy tại $opensslPath" -ForegroundColor Yellow
}
