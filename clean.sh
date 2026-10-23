#!/bin/bash
# ==============================================================================
# HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - ĐỀ TÀI 14
# Script dọn dẹp toàn bộ dữ liệu & containers (clean / reset)
# ==============================================================================

read -p "CẢNH BÁO: Thao tác này sẽ xóa toàn bộ dữ liệu database (volumes). Bạn có chắc chắn không? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
    echo "Đang dừng hệ thống và xóa toàn bộ volumes..."
    docker compose down -v
    echo "[✓] Đã dọn dẹp hoàn tất. Lần chạy tiếp theo (./start.sh) sẽ khởi tạo CSDL mới."
else
    echo "Đã hủy thao tác."
fi
