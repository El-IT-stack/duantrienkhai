#!/bin/bash
echo "Đang dừng toàn bộ hệ thống Quản lý Dự án..."
docker compose down
echo "[✓] Đã dừng toàn bộ dịch vụ an toàn. Dữ liệu database được bảo toàn."
