#!/bin/bash
# ==============================================================================
# HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - ĐỀ TÀI 14
# Script Bash: Khởi động toàn bộ hệ thống với 1 lệnh duy nhất (Linux/macOS)
# ==============================================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}      HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - ĐỀ TÀI 14${NC}"
echo -e "${YELLOW}           KHỞI ĐỘNG TOÀN BỘ HỆ THỐNG VỚI 1 LỆNH DUY NHẤT${NC}"
echo -e "${GREEN}          Sinh viên: Hoàng Xuân Đoàn - MSSV: dtc245200226${NC}"
echo -e "${CYAN}==============================================================================${NC}"
echo ""

# 1. Tự động kiểm tra file .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[*] File .env chưa tồn tại. Đang tự động sao chép từ .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}[✓] Đã tạo file .env thành công.${NC}"
    fi
else
    echo -e "${GREEN}[✓] File .env đã sẵn sàng.${NC}"
fi

# 2. Tự động kiểm tra và tạo chứng chỉ SSL nếu chưa có
if [ ! -f "nginx/ssl/server.crt" ]; then
    echo -e "${YELLOW}[*] Chưa có chứng chỉ SSL. Đang tự động sinh SSL tự ký cho Nginx HTTPS...${NC}"
    mkdir -p nginx/ssl
    if command -v openssl >/dev/null 2>&1; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/server.key \
            -out nginx/ssl/server.crt \
            -subj "/C=VN/ST=Hanoi/L=Hanoi/O=ProjectManagement/OU=DevOps/CN=localhost" >/dev/null 2>&1
        echo -e "${GREEN}[✓] Đã tạo chứng chỉ SSL thành công.${NC}"
    else
        echo -e "${YELLOW}[!] Không tìm thấy openssl, Nginx vẫn hoạt động trên HTTP port 80.${NC}"
    fi
else
    echo -e "${GREEN}[✓] Chứng chỉ SSL đã sẵn sàng.${NC}"
fi

# 3. Kiểm tra Docker
if ! command -v docker >/dev/null 2>&1; then
    echo -e "${RED}[X] LỖI: Không tìm thấy lệnh docker! Vui lòng cài đặt Docker Desktop hoặc Docker Engine.${NC}"
    exit 1
fi

# 4. Kiểm tra Docker Daemon
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}[X] LỖI: Docker daemon chưa chạy. Vui lòng khởi động Docker service hoặc Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}[✓] Docker daemon đang hoạt động.${NC}"
echo ""

# 5. Build và khởi động 9 containers
echo -e "${CYAN}[*] Đang build và khởi động toàn bộ hệ thống bằng Docker Compose...${NC}"
docker compose up -d --build

echo ""
echo -e "${CYAN}[*] Kiểm tra trạng thái các container...${NC}"
sleep 5
docker compose ps

echo ""
echo -e "${GREEN}==============================================================================${NC}"
echo -e "${GREEN}  🚀 HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG VỚI 1 LỆNH DUY NHẤT!${NC}"
echo -e "${GREEN}==============================================================================${NC}"
echo ""
echo -e "${YELLOW}  [CÁC ĐỊA CHỈ TRUY CẬP DỊCH VỤ]:${NC}"
echo "  ----------------------------------------------------------------------------"
echo "  1. 🌐 Ứng dụng Web (Frontend)   : http://localhost"
echo "  2. ⚡ Backend REST API           : http://localhost/api"
echo "  3. 📖 Swagger API Documentation  : http://localhost/api/docs"
echo "  4. 🩺 Health Check               : http://localhost/api/health"
echo "  5. 📊 Prometheus Metrics Raw     : http://localhost/api/metrics"
echo "  6. 🗄️ pgAdmin 4 (Quản trị DB)   : http://localhost:5050"
echo "  7. 📈 Grafana Monitoring         : http://localhost:3001"
echo "  8. 🎯 Prometheus Dashboard       : http://localhost:9090"
echo ""
echo -e "${YELLOW}  [TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH]:${NC}"
echo "  ----------------------------------------------------------------------------"
echo "  • Web App (Admin)     : admin@pm.local    | Mật khẩu: Admin@123"
echo "  • Web App (PM Lead)   : pm.minh@pm.local  | Mật khẩu: Admin@123"
echo "  • Web App (Developer) : dev.tuan@pm.local | Mật khẩu: Admin@123"
echo "  • pgAdmin 4           : admin@pm.com      | Mật khẩu: PgAdmin@2026_Secure!"
echo "  • Grafana             : admin             | Mật khẩu: Grafana@2026_Secure!"
echo ""
echo -e "${YELLOW}  [CÁC LỆNH ĐIỀU KHIỂN]:${NC}"
echo "  ----------------------------------------------------------------------------"
echo "  • Dừng hệ thống       : ./stop.sh    (hoặc docker compose down)"
echo "  • Xem realtime logs   : ./logs.sh    (hoặc docker compose logs -f)"
echo "  • Kiểm tra trạng thái : ./status.sh  (hoặc docker compose ps)"
echo "  • Xóa toàn bộ dữ liệu : ./clean.sh   (hoặc docker compose down -v)"
echo -e "${GREEN}==============================================================================${NC}"
echo ""

# Tự động mở trình duyệt nếu có lệnh xdg-open (Linux) hoặc open (macOS)
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost" >/dev/null 2>&1 &
elif command -v open >/dev/null 2>&1; then
    open "http://localhost" >/dev/null 2>&1 &
fi
