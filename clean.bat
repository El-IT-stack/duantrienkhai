@echo off
echo ==============================================================================
echo  CANH BAO: Thao tac nay se dung he thong va XOA TOAN BO DU LIEU (Volumes)
echo ==============================================================================
set /p confirm="Ban co chac chan muon xoa sach du lieu database khong? (y/N): "
if /i "%confirm%"=="y" (
    echo Dang dung va xoa toan bo volumes...
    docker compose down -v
    echo [OK] Da don dep sach se. Lan khoi dong tiep theo (start.bat) se tao lai CSDL tu dau.
) else (
    echo Da huy thao tac.
)
echo.
pause
