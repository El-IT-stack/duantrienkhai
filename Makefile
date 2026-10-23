.PHONY: help up start down stop restart logs ps status clean

# Lệnh mặc định khi chỉ gõ 'make'
.DEFAULT_GOAL := start

help:
	@echo "=============================================================================="
	@echo "  HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - MAKEFILE COMMANDS"
	@echo "=============================================================================="
	@echo "  make / make start  : Khởi động toàn bộ 9 services với 1 lệnh duy nhất"
	@echo "  make stop / down   : Dừng toàn bộ hệ thống (dữ liệu được giữ nguyên)"
	@echo "  make restart       : Khởi động lại toàn bộ containers"
	@echo "  make logs          : Theo dõi logs realtime của tất cả services"
	@echo "  make status / ps   : Kiểm tra trạng thái hoạt động của các containers"
	@echo "  make clean         : Dừng và xóa toàn bộ dữ liệu volumes (Reset DB)"
	@echo "=============================================================================="

start: up

up:
	@docker compose up -d --build

down: stop

stop:
	@docker compose down

restart:
	@docker compose restart

logs:
	@docker compose logs -f

status: ps

ps:
	@docker compose ps

clean:
	@docker compose down -v
