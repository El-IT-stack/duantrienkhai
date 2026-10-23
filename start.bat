@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo       HE THONG QUAN LY DU AN (PROJECT MANAGEMENT) - DE TAI 14
echo            KHOI DONG TOAN BO HE THONG VOI 1 LENH DUY NHAT
echo           Sinh vien: Hoang Xuan Doan - MSSV: dtc245200226
echo ==============================================================================
echo.

REM --- 0. THEM DUONG DAN DOCKER VAO PATH NEU CHUA CO ---
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;!PATH!"
    ) else if exist "%ProgramFiles%\Docker\Docker\resources\bin\docker.exe" (
        set "PATH=%ProgramFiles%\Docker\Docker\resources\bin;!PATH!"
    )
)

REM --- 1. TU DONG TAO FILE .ENV NEU CHUA CO ---
if exist ".env" goto ENV_EXISTS
echo [*] File cau hinh .env chua ton tai. Dang tu dong tao tu .env.example...
if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo [OK] Da tao file .env thanh cong.
)
:ENV_EXISTS
echo [OK] File .env da san sang.

REM --- 2. TU DONG TAO SSL CERTIFICATE NEU CHUA CO ---
if exist "nginx\ssl\server.crt" goto SSL_EXISTS
echo [*] Chung chi SSL chua ton tai. Dang tao chung chi SSL...
if not exist "nginx\ssl" mkdir "nginx\ssl"
if exist "C:\Program Files\Git\usr\bin\openssl.exe" (
    "C:\Program Files\Git\usr\bin\openssl.exe" req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\server.key -out nginx\ssl\server.crt -subj "/C=VN/ST=Hanoi/L=Hanoi/O=ProjectManagement/OU=DevOps/CN=localhost" >nul 2>&1
)
:SSL_EXISTS
echo [OK] Chung chi SSL Nginx da san sang.

REM --- 3. KIEM TRA LENH DOCKER ---
where docker >nul 2>&1
if %ERRORLEVEL% equ 0 goto DOCKER_CLI_FOUND
echo.
echo [X] LOI: Khong tim thay lenh 'docker' trong he thong!
echo     Vui long kiem tra Docker Desktop da duoc cai dat hay chua.
echo     Link cai dat: https://www.docker.com/products/docker-desktop/
echo.
pause
exit /b 1

:DOCKER_CLI_FOUND
REM --- 4. KIEM TRA VA TU DONG KHOI DONG DOCKER DAEMON NEU CHUA CHAY ---
docker info >nul 2>&1
if %ERRORLEVEL% equ 0 goto DOCKER_IS_RUNNING

echo [*] Docker daemon chua chay. Dang tu dong tim va khoi dong Docker Desktop...

set "DOCKER_BIN="
if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" set "DOCKER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
if not defined DOCKER_BIN if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" set "DOCKER_BIN=%ProgramFiles%\Docker\Docker\Docker Desktop.exe"

if defined DOCKER_BIN (
    echo [*] Dang khoi chay Docker Desktop tu: !DOCKER_BIN!
    start "" "!DOCKER_BIN!"
    echo [*] Dang doi Docker daemon san sang - co the mat 15-40 giay...
    set /a count=0
) else (
    echo [!] Vui long mo Docker Desktop thu cong tren man hinh!
    echo     Dang cho ban mo Docker Desktop...
)

:WAIT_DOCKER_LOOP
ping 127.0.0.1 -n 4 >nul
docker info >nul 2>&1
if %ERRORLEVEL% equ 0 goto DOCKER_IS_RUNNING

set /a count+=3
echo     ...Dang cho Docker san sang (!count! giay)...
if !count! lss 90 goto WAIT_DOCKER_LOOP

echo [!] Da cho 90s, tiep tuc kiem tra...
goto WAIT_DOCKER_LOOP

:DOCKER_IS_RUNNING
endlocal
echo [OK] Docker daemon dang hoat dong tot.
echo.

REM --- 5. BUILD VA KHOI DONG TOAN BO SERVICES VOI DOCKER COMPOSE ---
echo [*] Dang build va khoi dong 9 containers (Postgres, Backend, Frontend, Nginx, Prometheus, Grafana, Loki, Promtail, pgAdmin)...
echo.
docker compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo.
    echo [X] Qua trinh khoi dong Docker Compose gap loi.
    echo     Thu chay 'docker compose logs' de kiem tra chi tiet.
    pause
    exit /b 1
)

echo.
echo [*] Dang kiem tra trang thai suc khoe cac dich vu...
ping 127.0.0.1 -n 4 >nul
docker compose ps

echo.
echo ==============================================================================
echo  HE THONG DA KHOI DONG THANH CONG VOI 1 LENH DUY NHAT!
echo ==============================================================================
echo.
echo  [CAC DIA CHI TRUY CAP DICH VU]:
echo  ----------------------------------------------------------------------------
echo  1. Ung dung Web (Frontend)    : http://localhost
echo  2. Backend REST API            : http://localhost/api
echo  3. Swagger API Documentation   : http://localhost/api/docs
echo  4. Health Check                : http://localhost/api/health
echo  5. Prometheus Metrics Raw      : http://localhost/api/metrics
echo  6. pgAdmin 4 (Quan tri DB)     : http://localhost:5050
echo  7. Grafana Monitoring          : http://localhost:3001
echo  8. Prometheus Dashboard        : http://localhost:9090
echo.
echo  [TAI KHOAN DANG NHAP MAC DINH]:
echo  ----------------------------------------------------------------------------
echo  - Web App (Admin)     : admin@pm.local    (Mat khau: Admin@123)
echo  - Web App (PM Lead)   : pm.minh@pm.local  (Mat khau: Admin@123)
echo  - Web App (Developer) : dev.tuan@pm.local (Mat khau: Admin@123)
echo  - pgAdmin 4           : admin@pm.com      (Mat khau: PgAdmin@2026_Secure!)
echo  - Grafana             : admin             (Mat khau: Grafana@2026_Secure!)
echo.
echo  [CAC LENH DIEU KHIEN HE THONG (1 LENH)]:
echo  ----------------------------------------------------------------------------
echo  - Dung he thong       : .\stop.bat    (hoac docker compose down)
echo  - Xem realtime logs   : .\logs.bat    (hoac docker compose logs -f)
echo  - Kiem tra trang thai : .\status.bat  (hoac docker compose ps)
echo  - Xoa toan bo du lieu : .\clean.bat   (hoac docker compose down -v)
echo ==============================================================================
echo.

REM --- 6. TU DONG MO TRINH DUYET ---
echo [*] Dang tu dong mo ung dung Web tai http://localhost ...
start http://localhost

echo.
echo [V] Khoi dong hoan tat! Nhan phim bat ky de thoat cua so nay.
echo     (Toan bo he thong van tiep tuc chay nen an toan trong Docker).
pause >nul
exit /b 0
