# HƯỚNG DẪN VẬN HÀNH, TRIỂN KHAI VÀ SỬ DỤNG HỆ THỐNG
## ĐỀ TÀI 14: HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT)

> **Môn học:** Triển khai & Quản trị Hệ thống Phần mềm  
> **Repository GitHub:** [https://github.com/El-IT-stack/duantrienkhai](https://github.com/El-IT-stack/duantrienkhai)  
> **Phiên bản:** 1.0.0 (Production-ready via Docker Compose)

---

## MỤC LỤC
1. [Giới thiệu & Thông tin Dự án](#1-giới-thiệu--thông-tin-dự-án)
2. [Cấu trúc Stack: Danh sách 12 Containers](#2-cấu-trúc-stack-danh-sách-12-containers)
3. [Cơ chế Kết nối Mạng giữa các Containers (Network Isolation)](#3-cơ-chế-kết-nối-mạng-giữa-các-containers-network-isolation)
4. [Hướng dẫn Chạy từ Đầu đến Cuối (Step-by-Step)](#4-hướng-dẫn-chạy-từ-đầu-đến-cuối-step-by-step)
5. [Hướng dẫn Sử dụng các Chức năng Ứng dụng](#5-hướng-dẫn-sử-dụng-các-chức-năng-ứng-dụng)
6. [Tài liệu Tổng hợp Lệnh Xem & Phân tích Log](#6-tài-liệu-tổng-hợp-lệnh-xem--phân-tích-log)
7. [Hướng dẫn Kiểm tra các Biện pháp Hardening Bảo mật](#7-hướng-dẫn-kiểm-tra-các-biện-pháp-hardening-bảo-mật)
8. [Hướng dẫn Kiểm tra Hệ thống Giám sát (Monitoring)](#8-hướng-dẫn-kiểm-tra-hệ-thống-giám-sát-monitoring)
9. [Xử lý Sự cố Thường gặp (Troubleshooting)](#9-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. GIỚI THIỆU & THÔNG TIN DỰ ÁN

### 1.1. Phạm vi nghiệp vụ
Hệ thống Quản lý Dự án (Project Management) giải quyết bài toán quản trị tiến độ công việc, phân công nhiệm vụ và phối hợp nhóm trong doanh nghiệp phần mềm:
* **Quản trị người dùng & Phân quyền RBAC:** 3 cấp bậc quyền hạn rõ ràng (**Admin**, **Project Manager**, **Member**).
* **Quản lý danh mục Dự án:** Theo dõi vòng đời dự án (`PLANNING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), tính toán % tiến độ hoàn thành tự động dựa trên số công việc hoàn tất.
* **Bảng công việc Kanban (Tasks Board):** Trực quan hóa tiến độ qua 4 cột (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`), mức độ ưu tiên (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), cảnh báo task quá hạn.
* **Bình luận & Trao đổi:** Thành viên thảo luận trực tiếp trên từng task.
* **Dashboard Thống kê Điều hành:** Tổng hợp số liệu tức thời từ database PostgreSQL: tỷ lệ dự án hoàn tất, số task quá hạn, biểu đồ phân bố khối lượng công việc.

### 1.2. Kiến trúc Công nghệ
* **Frontend:** React 18 SPA, TypeScript, Vite, Tailwind CSS (giao diện tối Dark Mode, Glassmorphism, tiếng Việt).
* **Backend:** Node.js 20 Alpine, NestJS framework, JWT Bearer Token, Bcrypt password hashing, prom-client metrics, Swagger OpenAPI 3.0.
* **Cơ sở dữ liệu:** PostgreSQL 16 Alpine, Web Client pgAdmin 4.
* **Cổng giao tiếp:** Nginx Reverse Proxy, SSL tự ký, Security Headers, gzip compression.
* **Hạ tầng Giám sát & Ghi log:** Prometheus, Grafana, cAdvisor, Nginx Prometheus Exporter, PostgreSQL Exporter, Loki, Promtail.

---

## 2. CẤU TRÚC STACK: DANH SÁCH 12 CONTAINERS

Toàn bộ hệ thống vận hành thông qua cụm 12 container được định nghĩa trong file `docker-compose.yml`:

| STT | Container Name | Service Name | Docker Image | Port Mapping (Host:Container) | Mục đích & Vai trò trong hệ thống |
|:---:|---|---|---|:---:|---|
| 1 | `pm_nginx` | `nginx` | `nginx:1.25-alpine` | `80:80`<br>`443:443` | **Cổng vào duy nhất:** Reverse proxy định tuyến Web & API, thực thi Security Headers, xử lý HTTPS, ghi nhận access log JSON. |
| 2 | `pm_frontend` | `frontend` | Multi-stage build từ `frontend/Dockerfile` | *Nội bộ* (80) | Chứa mã nguồn giao diện React SPA đã build production, phục vụ tĩnh qua Nginx nội bộ. |
| 3 | `pm_backend` | `backend` | Multi-stage build từ `backend/Dockerfile` | *Nội bộ* (3000) | REST API xử lý toàn bộ logic, xác thực JWT, tương tác PostgreSQL, xuất metrics `/api/metrics`. |
| 4 | `pm_postgres` | `postgres` | `postgres:16-alpine` | *Nội bộ* (5432) | CSDL quan hệ chính. Dữ liệu lưu vào named volume `pm_postgres_data`. Cổng 5432 **không mở ra ngoài host**. |
| 5 | `pm_pgadmin` | `pgadmin` | `dpage/pgadmin4:8` | `5050:80` | Giao diện web trực quan quản trị bảng, truy vấn SQL và cấu trúc dữ liệu PostgreSQL. |
| 6 | `pm_prometheus`| `prometheus` | `prom/prometheus:v2.51.0` | `9090:9090` | Thu thập (scrape) và lưu trữ time-series metrics định kỳ mỗi 10 giây từ 5 endpoints. |
| 7 | `pm_grafana` | `grafana` | `grafana/grafana:10.4.1` | `3001:3000` | Dashboard trực quan hóa toàn bộ chỉ số hệ thống và hiển thị trực tiếp luồng log từ Loki. |
| 8 | `pm_cadvisor` | `cadvisor` | `gcr.io/cadvisor/cadvisor:v0.49.1` | `8080:8080` | Trích xuất thông số hiệu năng phần cứng thời gian thực của từng container (CPU %, RAM MB, Network I/O). |
| 9 | `pm_nginx_exporter` | `nginx-exporter` | `nginx/nginx-prometheus-exporter:1.1.0` | *Nội bộ* (9113) | Đọc chỉ số từ Nginx `stub_status` (kết nối active, reading, writing, số requests) chuyển cho Prometheus. |
| 10 | `pm_postgres_exporter` | `postgres-exporter` | `prometheuscommunity/postgres-exporter:v0.15.0` | *Nội bộ* (9187) | Cào chỉ số database PostgreSQL (active connections, commits/s, rollbacks/s, locks, DB size). |
| 11 | `pm_loki` | `loki` | `grafana/loki:2.9.5` | `3100:3100` | Engine lưu trữ, lập chỉ mục và phân tích log tập trung (hỗ trợ ngôn ngữ LogQL). |
| 12 | `pm_promtail` | `promtail` | `grafana/promtail:2.9.5` | *Nội bộ* (9080) | Log shipper đọc file log Nginx (`pm_access.log`) và Backend (`app.log`) đẩy về Loki theo chu kỳ 1s. |

---

## 3. CƠ CHẾ KẾT NỐI MẠNG GIỮA CÁC CONTAINERS (NETWORK ISOLATION)

### 3.1. Sử dụng công nghệ gì để kết nối?
* **Docker Bridge Networks:** Sử dụng driver mạng `bridge` do Docker cung cấp trên môi trường ảo hóa.
* **Internal DNS Resolution:** Docker tự động tích hợp một DNS server nội bộ (127.0.0.11). Các container giao tiếp trực tiếp với nhau thông qua **Service Name** (ví dụ: `postgres`, `backend`, `frontend`, `prometheus`, `loki`), **hoàn toàn không dùng `localhost` hay IP cứng**.
  * *Ví dụ:* Backend kết nối database qua chuỗi `postgres:5432`.
  * *Ví dụ:* Nginx chuyển tiếp request sang backend qua `http://backend_service` (`backend:3000`).
  * *Ví dụ:* Promtail đẩy log sang Loki qua `http://loki:3100/loki/api/v1/push`.

### 3.2. Phân tách mạng 3 lớp (Network Segmentation)
Nhằm đạt tiêu chuẩn bảo mật Hardening, hệ thống chia thành 3 mạng độc lập:

```
[CLIENT / INTERNET]
        │ Port 80, 443
        ▼
┌─────────────────── pm_public_network ───────────────────┐
│  - pm_nginx                                            │
│  - pm_frontend                                         │
│  - pm_pgadmin    (Port 5050)                           │
│  - pm_grafana    (Port 3001)                           │
│  - pm_prometheus (Port 9090)                           │
└────────┬────────────────────────────────────────────────┘
         │
┌────────┴────────── pm_internal_network ─────────────────┐
│  - pm_nginx                                            │
│  - pm_backend                                          │
│  - pm_postgres          (Port 5432 - CÔ LẬP HOÀN TOÀN)  │
│  - pm_pgadmin                                          │
│  - pm_postgres_exporter                                │
└────────┬────────────────────────────────────────────────┘
         │
┌────────┴───────── pm_monitoring_network ────────────────┐
│  - pm_prometheus                                       │
│  - pm_grafana                                          │
│  - pm_loki                                             │
│  - pm_promtail                                         │
│  - pm_cadvisor                                         │
│  - pm_nginx_exporter                                   │
│  - pm_postgres_exporter                                │
│  - pm_backend                                          │
│  - pm_nginx                                            │
└────────────────────────────────────────────────────────┘
```

* **Lợi ích an ninh:**
  * Container `frontend` nằm ở `pm_public_network`, **không thể thấy và không thể truy cập trực tiếp** vào `postgres`.
  * Cổng 5432 của CSDL không được map ra Host (máy thật), tránh hoàn toàn nguy cơ quét cổng và tấn công brute-force từ mạng ngoài.
  * Mạng giám sát `pm_monitoring_network` lưu thông luồng dữ liệu metrics và logs riêng biệt, không ảnh hưởng đến băng thông nghiệp vụ.

---

## 4. HƯỚNG DẪN CHẠY TỪ ĐẦU ĐẾN CUỐI (STEP-BY-STEP)

### Bước 1: Yêu cầu chuẩn bị
Đảm bảo máy đã cài đặt:
1. **Docker Desktop** (hoặc Docker Engine trên Linux). Kiểm tra bằng lệnh:
   ```powershell
   docker --version
   docker compose version
   ```
2. Đảm bảo Docker Desktop đang chạy (icon Docker chuyển màu xanh / `docker ps` không báo lỗi daemon).

### Bước 2: Clone repository & Di chuyển vào thư mục dự án
```powershell
git clone https://github.com/El-IT-stack/duantrienkhai.git
cd duantrienkhai
```

### Bước 3: Tạo file cấu hình môi trường `.env`
Hệ thống sử dụng file `.env` để truyền toàn bộ secret và port cấu hình:
```powershell
# Trên Windows PowerShell:
Copy-Item .env.example .env

# Trên Linux / macOS:
cp .env.example .env
```
*(File `.env` đã có sẵn các cấu hình mặc định tối ưu, bạn có thể chỉnh sửa mật khẩu nếu cần)*.

### Bước 4: Khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất
```powershell
docker compose up -d --build
```
*Hoặc sử dụng các script tiện ích tạo sẵn:*
* **Windows:** Click đúp chuột vào file `start.bat` (hoặc `run.bat`).
* **Linux/macOS:** Thực thi `./start.sh`.

### Bước 5: Kiểm tra trạng thái toàn bộ containers
```powershell
docker compose ps
```
**Yêu cầu đạt chuẩn:** Tất cả 12 container đều hiển thị `STATUS: Up` (và `pm_postgres`, `pm_cadvisor` hiển thị `healthy`).

### Bước 5.1: Kiểm tra log khởi động toàn bộ dịch vụ
Để đảm bảo các container khởi động trơn tru và kết nối cơ sở dữ liệu thành công, kiểm tra log khởi động:
```powershell
# Xem nhanh 30 dòng log gần nhất của tất cả dịch vụ:
docker compose logs --tail=30

# Hoặc chỉ kiểm tra riêng log khởi động của Backend:
docker compose logs --tail=30 backend

# Xem log theo thời gian thực (nhấn Ctrl + C để thoát):
# Trên Windows: Click đúp file logs.bat (hoặc gõ .\logs.bat)
# Trên Linux / macOS: Thực thi ./logs.sh
```

### Bước 6: Truy cập các dịch vụ trên trình duyệt
Mở trình duyệt web và truy cập theo bảng địa chỉ sau:

| Dịch vụ | Địa chỉ Web | Tài khoản / Mật khẩu |
|---|---|---|
| **Ứng dụng Web chính (HTTP)** | `http://localhost` | `admin@pm.local` / `Admin@123` |
| **Ứng dụng Web bảo mật (HTTPS)** | `https://localhost` | *(Chấp nhận chứng chỉ tự ký khi trình duyệt hỏi)* |
| **Tài liệu Swagger API** | `http://localhost/api/docs` | Xác thực Bearer Token lấy từ `/api/auth/login` |
| **API Health Check** | `http://localhost/api/health` | Không cần đăng nhập |
| **Grafana Monitoring Dashboard** | `http://localhost:3001` | `admin` / `Grafana@2026_Secure!` |
| **Prometheus Target List** | `http://localhost:9090/targets` | Xem trạng thái 5 targets cào chỉ số |
| **pgAdmin 4 (Quản trị CSDL)** | `http://localhost:5050` | `admin@pm.com` / `PgAdmin@2026_Secure!` |
| **cAdvisor Container Resource** | `http://localhost:8080` | Xem thông số phần cứng container |

### Bước 7: Dừng hệ thống khi kết thúc làm việc
```powershell
# Dừng các container (dữ liệu trong database vẫn được giữ nguyên):
docker compose down

# Khi cần xóa sạch mọi volume để khởi động lại từ đầu:
docker compose down -v
```

---

## 5. HƯỚNG DẪN SỬ DỤNG CÁC CHỨC NĂNG ỨNG DỤNG

### 5.1. Danh sách tài khoản demo có sẵn trong CSDL
Mật khẩu mặc định cho toàn bộ tài khoản mẫu: **`Admin@123`**

| Vai trò (Role) | Email đăng nhập | Quyền hạn chính |
|---|---|---|
| **Quản trị viên (Admin)** | `admin@pm.local` | Toàn quyền: Thêm/Sửa/Xóa tài khoản, dự án, công việc; xem toàn bộ thống kê. |
| **Trưởng dự án 1 (PM Minh)** | `pm.minh@pm.local` | Quản lý dự án PMS Khách sạn, gán task cho dev, quản lý tiến độ. |
| **Trưởng dự án 2 (PM Hương)**| `pm.huong@pm.local` | Quản lý dự án Cổng thanh toán và dự án DevOps. |
| **Lập trình viên Backend** | `dev.tuan@pm.local` | Xem task được gán, đổi trạng thái Kanban, gửi bình luận thảo luận. |
| **Lập trình viên Frontend** | `dev.linh@pm.local` | Nhận task giao diện, cập nhật tiến độ công việc. |
| **Kiểm thử viên (QA)** | `qa.nam@pm.local` | Kiểm thử tính năng, quản lý các task kiểm thử tải và rà soát lỗi. |

### 5.2. Các luồng thao tác chính trên Giao diện Web
1. **Đăng nhập:** Truy cập `http://localhost/login`, nhập email và mật khẩu -> Bấm "Đăng nhập". Hệ thống lưu JWT Token vào LocalStorage.
2. **Xem Trang Tổng Quan (Dashboard):** 
   * Quan sát 4 thẻ KPI: Tổng số dự án, Thành viên hoạt động, Tỷ lệ công việc hoàn thành, và **Công việc Quá Hạn (màu đỏ cảnh báo)**.
   * Xem tiến độ các dự án trọng điểm theo thanh % (tính toán thực tế từ số task `DONE`).
3. **Quản lý Dự án (`/projects`):**
   * Bấm nút "Thêm Dự Án" (yêu cầu quyền Admin hoặc PM) -> Nhập tên, mô tả, ngày bắt đầu, ngày kết thúc, trạng thái.
   * Lọc dự án theo trạng thái (`Đang thực hiện`, `Kế hoạch`, `Hoàn thành`).
   * Bấm vào từng dự án để xem chi tiết danh sách thành viên và các task con trực thuộc.
4. **Bảng công việc Kanban (`/tasks`):**
   * Bảng chia thành 4 cột: `Cần làm` (TODO), `Đang làm` (IN_PROGRESS), `Đang duyệt` (REVIEW), `Hoàn thành` (DONE).
   * Thêm task mới: Chọn dự án, nhập tiêu đề, mô tả, gán người thực hiện, mức độ ưu tiên và hạn chót (Deadline).
   * Chuyển trạng thái task: Bấm chọn trạng thái mới trên thẻ công việc.
   * Bình luận: Bấm vào task để mở khung bình luận và thảo luận trao đổi giữa các thành viên.

### 5.3. Sử dụng pgAdmin 4 để quản trị PostgreSQL
1. Truy cập `http://localhost:5050`, đăng nhập: `admin@pm.com` / `PgAdmin@2026_Secure!`.
2. Hệ thống đã được **tự động nạp sẵn Server kết nối** (Auto-discovery):
   * Ở thanh bên trái (**Object Explorer**), click vào biểu tượng mũi tên `>` cạnh mục **Servers**.
   * Bạn sẽ thấy server **`Project Management DB`**.
   * Nhấp chuột vào **`Project Management DB`** để kết nối (nếu hỏi mật khẩu, nhập: `StrongP@ssw0rd_2026_Secure!` và tích chọn *Save Password*).
3. Xem toàn bộ danh sách 5 bảng dữ liệu thực tế tại:
   * **Servers** -> **Project Management DB** -> **Databases** -> **`project_management_db`** -> **Schemas** -> **`public`** -> **`Tables`**.
   * Gồm: `users`, `projects`, `project_members`, `tasks`, `task_comments`.
   * Chuột phải vào bất kỳ bảng nào -> Chọn **View/Edit Data** -> **All Rows** để xem dữ liệu demo.

*(Lưu ý: Nếu bạn muốn tự thêm thủ công một kết nối mới: Chuột phải vào **Servers** -> **Register** -> **Server...** -> Đặt tên tại tab *General*, và tab *Connection* điền Host: `postgres`, Port: `5432`, Database: `project_management_db`, Username: `postgres_admin`, Password: `StrongP@ssw0rd_2026_Secure!` -> Bấm Save)*.

---

## 6. TÀI LIỆU TỔNG HỢP LỆNH XEM & PHÂN TÍCH LOG

Hệ thống hỗ trợ 3 phương thức kiểm tra log toàn diện từ cơ bản đến nâng cao: Script tiện ích tự động, Docker CLI trực tiếp, và Giao diện Grafana Loki (LogQL).

---

### 6.1. Xem log nhanh bằng Script tiện ích có sẵn
Thư mục dự án đã tạo sẵn các script tự động gom log toàn bộ 12 container theo thời gian thực:
* **Trên Windows:** Click đúp chuột vào file **`logs.bat`** (hoặc mở Terminal gõ `.\logs.bat`).
* **Trên Linux / macOS:** Chạy lệnh `./logs.sh`.
*(Nhấn tổ hợp phím `Ctrl + C` để dừng chế độ theo dõi log)*.

---

### 6.2. Lệnh xem và kiểm tra log qua Docker CLI

#### 1. Xem log tổng hợp toàn bộ 12 dịch vụ
```powershell
# Theo dõi realtime toàn bộ log phát sinh:
docker compose logs -f

# Xem 50 dòng log gần nhất của toàn bộ hệ thống (không treo terminal):
docker compose logs --tail=50
```

#### 2. Xem log chi tiết của từng dịch vụ cụ thể
```powershell
# Xem log Nginx Reverse Proxy (truy cập Web, định tuyến API):
docker compose logs -f nginx

# Xem log Backend API (NestJS REST API):
docker compose logs -f backend

# Xem log Cơ sở dữ liệu PostgreSQL:
docker compose logs -f postgres

# Xem log Tác nhân thu thập log Promtail:
docker compose logs -f promtail

# Xem log Máy chủ lưu trữ và lập chỉ mục log Loki:
docker compose logs -f loki

# Xem log Hệ thống giám sát Prometheus:
docker compose logs -f prometheus

# Xem log Dashboard Grafana:
docker compose logs -f grafana
```

#### 3. Xem log kèm Timestamp và giới hạn số dòng
```powershell
# Xem 50 dòng log gần nhất của Backend:
docker compose logs --tail=50 backend

# Xem log Backend kèm mốc thời gian ISO chi tiết:
docker compose logs -f -t backend

# Xem 100 dòng log gần nhất của Nginx:
docker compose logs --tail=100 nginx
```

#### 4. Lọc log lỗi nhanh bằng lệnh tìm kiếm (Filter Error)
```powershell
# Trên Windows PowerShell (Lọc các dòng có chứa lỗi):
docker compose logs --tail=150 | Select-String -Pattern "error|fail|warn|exception" -CaseSensitive:$false

# Trên Windows CMD:
docker compose logs --tail=150 | findstr /i "error fail warn exception"

# Trên Linux / macOS (Bash):
docker compose logs --tail=150 | grep -Ei "error|fail|warn|exception"
```

#### 5. Đọc trực tiếp file log có cấu trúc bên trong container
Hệ thống cấu hình ghi file log chuyên dụng để Promtail thu thập:
```powershell
# Đọc 20 dòng access log định dạng JSON mới nhất của Nginx:
docker compose exec nginx tail -n 20 /var/log/nginx/pm_access.log

# Đọc log lỗi Nginx (nếu có):
docker compose exec nginx tail -n 20 /var/log/nginx/pm_error.log

# Đọc 20 dòng application log định dạng JSON của Backend:
docker compose exec backend tail -n 20 /var/log/backend/app.log

# Theo dõi file log Nginx trực tiếp theo thời gian thực:
docker compose exec nginx tail -f /var/log/nginx/pm_access.log
```

---

### 6.3. Truy vấn Log tập trung qua LogQL trên Grafana Explore (Loki)

Grafana tích hợp nguồn dữ liệu Loki cho phép tìm kiếm, trích xuất và phân tích log tập trung thông qua ngôn ngữ **LogQL**.

#### Quy tắc đặt nhãn (Labels) của hệ thống
> [!WARNING]
> **LƯU Ý QUAN TRỌNG VỀ NHÃN (LABEL):**
> Trong Grafana Loki, hệ thống này **KHÔNG** sử dụng nhãn `{container="..."}` hay `{container_name="..."}`. Nếu bạn nhập `{container="nginx"}` sẽ nhận thông báo lỗi: `No logs volume available` (không tìm thấy dữ liệu).
> 
> Thay vào đó, hãy sử dụng nhãn **`service`** hoặc **`job`** theo bảng chuẩn dưới đây:

| Mục tiêu cần kiểm tra | Nhãn & Câu truy vấn LogQL chuẩn | Ý nghĩa & Mô tả |
|---|---|---|
| **Log Nginx (Chung)** | `{service="nginx"}` | Toàn bộ log truy cập và lỗi phát sinh tại cổng Nginx |
| **Log Nginx Access** | `{job="nginx_access"}` | Chi tiết từng lượt request HTTP/HTTPS vào Web/API |
| **Log Nginx Error** | `{job="nginx_error"}` | Cảnh báo hoặc lỗi kết nối upstream của Nginx |
| **Log Backend API** | `{service="backend"}` hoặc `{job="app"}` | Log hoạt động, truy vấn DB, ngoại lệ của NestJS API |
| **Toàn bộ Container** | `{job="docker-containers"}` | Gom toàn bộ log từ tất cả các container |

#### Các bước mở và truy vấn Log trên Grafana:
1. Mở trình duyệt truy cập: `http://localhost:3001` (Tài khoản: `admin` / `Grafana@2026_Secure!`).
2. Vào mục **Explore** (biểu tượng la bàn ở thanh menu bên trái, hoặc truy cập nhanh `http://localhost:3001/explore`).
3. Tại ô chọn Datasource phía trên cùng, chọn **Loki**.
4. **Mẹo thao tác nhanh:** Bấm vào nút **`Label browser`** (cạnh nút *Kick start your query*) -> chọn label `service` hoặc `job` -> bấm chọn dịch vụ cần xem -> bấm **Show logs**.

#### 5 Câu truy vấn LogQL thực tế hay dùng nhất:

* **Câu 1 - Xem toàn bộ lưu lượng truy cập Nginx thời gian thực:**
  ```logql
  {job="nginx_access"}
  ```
  *Bóc tách JSON hiển thị: IP client, method HTTP, URI, status code, response time.*

* **Câu 2 - Lọc cảnh báo & lỗi HTTP (Mã trạng thái >= 400):**
  ```logql
  {job="nginx_access"} | json | status >= 400
  ```
  *Khoanh vùng các request lỗi 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error).*

* **Câu 3 - Xem toàn bộ log Backend NestJS API:**
  ```logql
  {service="backend"}
  ```

* **Câu 4 - Lọc các log lỗi ứng dụng Backend cấp độ `error`:**
  ```logql
  {job="app"} | json | level="error"
  ```
  *Hiển thị chi tiết lỗi runtime, thông báo ngoại lệ (exception) và call stack.*

* **Câu 5 - Tìm kiếm theo từ khóa trong log Backend (VD: "UUID" hoặc "Database"):**
  ```logql
  {service="backend"} |= "UUID"
  ```
  *(Lọc ra tất cả các dòng log Backend có chứa từ khóa "UUID")*.

#### Kiểm tra trạng thái máy chủ Loki qua API:
```powershell
# Trên PowerShell kiểm tra các nhãn log đang hoạt động trong Loki:
(Invoke-RestMethod -Uri 'http://localhost:3100/loki/api/v1/labels').data

# Xem các giá trị của nhãn service:
(Invoke-RestMethod -Uri 'http://localhost:3100/loki/api/v1/label/service/values').data
```

## 7. HƯỚNG DẪN KIỂM TRA CÁC BIỆN PHÁP HARDENING BẢO MẬT

Dưới đây là các câu lệnh kiểm tra cụ thể để chứng minh hệ thống đã áp dụng các biện pháp Hardening:

### 7.1. Kiểm tra Container chạy dưới quyền Non-Root User
Hệ thống không chạy container ứng dụng bằng tài khoản `root`:
```powershell
# Kiểm tra user thực thi trong Backend container:
docker compose exec backend whoami
# KẾT QUẢ ĐẠT: appuser (thuộc appgroup, UID/GID không phải 0)

# Kiểm tra user thực thi trong Frontend container:
docker compose exec frontend whoami
# KẾT QUẢ ĐẠT: nginx (không phải root)
```

### 7.2. Kiểm tra cờ chống leo thang đặc quyền (`no-new-privileges`)
Ngăn chặn tiến trình bên trong container chiếm quyền root của máy host:
```powershell
# Kiểm tra cấu hình bảo mật trên container backend:
docker inspect pm_backend --format '{{.HostConfig.SecurityOpt}}'
# KẾT QUẢ ĐẠT: [no-new-privileges:true]

# Kiểm tra trên container nginx:
docker inspect pm_nginx --format '{{.HostConfig.SecurityOpt}}'
# KẾT QUẢ ĐẠT: [no-new-privileges:true]
```

### 7.3. Kiểm tra các Security Headers bảo vệ trên Nginx
Thực hiện request kiểm tra các header an ninh chống Clickjacking, MIME-sniffing, XSS:
```powershell
curl.exe -i http://localhost/nginx-health
```
**Danh sách Header bắt buộc phải xuất hiện trong phản hồi:**
* `X-Frame-Options: SAMEORIGIN` -> Chống tấn công Clickjacking.
* `X-Content-Type-Options: nosniff` -> Chống tấn công MIME-type Sniffing.
* `X-XSS-Protection: 1; mode=block` -> Kích hoạt bộ lọc chống XSS của trình duyệt.
* `Referrer-Policy: strict-origin-when-cross-origin` -> Bảo vệ thông tin URL nguồn.
* `Permissions-Policy: camera=(), microphone=(), geolocation=()` -> Vô hiệu hóa quyền truy cập thiết bị nhạy cảm.
* `Content-Security-Policy: default-src 'self' ...` -> Giới hạn nguồn nạp tài nguyên an toàn.

### 7.4. Kiểm tra CSDL PostgreSQL không bị lộ cổng ra ngoài Internet
CSDL PostgreSQL chỉ mở trong mạng nội bộ Docker:
```powershell
# Kiểm tra thử kết nối vào cổng 5432 từ máy host:
Test-NetConnection -ComputerName localhost -Port 5432
# KẾT QUẢ ĐẠT: TcpTestSucceeded : False (Không thể kết nối từ máy host)
```
*(Chỉ các container nội bộ như `backend`, `pgadmin` mới có thể kết nối tới database qua hostname `postgres:5432`)*.

### 7.5. Kiểm tra Cô lập Mạng giữa Frontend và Database
Container `frontend` không thể kết nối trực tiếp đến database:
```powershell
docker compose exec frontend nc -zv postgres 5432
# KẾT QUẢ ĐẠT: Lỗi "bad address 'postgres'" do không cùng mạng pm_internal_network
```

### 7.6. Kiểm tra Bảo vệ Secrets và Khóa riêng tư trong Git
Đảm bảo file `.env` và các private key bí mật không bị commit lên GitHub:
```powershell
git status --ignored
# KẾT QUẢ ĐẠT: .env, backend/dist/, frontend/dist/, nginx/ssl/server.key nằm trong mục "Ignored files"
```

---

## 8. HƯỚNG DẪN KIỂM TRA HỆ THỐNG GIÁM SÁT (MONITORING)

### 8.1. Kiểm tra 5 Scrape Targets trên Prometheus
1. Truy cập `http://localhost:9090/targets`.
2. Kiểm tra danh sách 5 targets, tất cả phải hiển thị trạng thái màu xanh **UP**:
   * `backend` (`backend:3000/api/metrics`) -> **UP**
   * `cadvisor` (`cadvisor:8080/metrics`) -> **UP**
   * `nginx-exporter` (`nginx-exporter:9113/metrics`) -> **UP**
   * `postgres-exporter` (`postgres-exporter:9187/metrics`) -> **UP**
   * `prometheus` (`localhost:9090/metrics`) -> **UP**

### 8.2. Xem Dashboard tự động trên Grafana
1. Đăng nhập `http://localhost:3001` (`admin` / `Grafana@2026_Secure!`).
2. Vào menu **Dashboards** -> Chọn thư mục **Đề tài 14 - Project Management** -> Mở dashboard:  
   **`Project Management - Giám Sát Toàn Diện (Đề Tài 14)`**.
3. Dashboard gồm 6 hàng chỉ số trực quan:
   * **1. Tổng quan Dịch vụ & Hệ thống:** Trạng thái Database (Connected), Nginx (Running), Tổng lượt HTTP Requests, Uptime.
   * **2. Nginx Reverse Proxy & Exporter:** Kết nối đang hoạt động, tần suất request/s, trạng thái Reading/Writing/Waiting.
   * **3. PostgreSQL Database Exporter:** Số kết nối active, tốc độ giao dịch commit/rollback mỗi giây, dung lượng DB tính bằng Bytes.
   * **4. cAdvisor Container Resources:** % CPU và dung lượng RAM tiêu thụ chi tiết từng container `pm_*`.
   * **5. Backend API Node.js Performance:** Lưu lượng HTTP theo route, độ trễ phản hồi P95, RAM heap used & CPU %.
   * **6. Nhật ký tập trung từ Loki:** Bảng stream log trực tiếp có thể lọc từ khóa.

---

## 9. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 9.1. Lỗi trùng cổng (Port is already allocated)
Nếu máy bạn đã chạy ứng dụng khác trên cổng `80` (như IIS, Apache) hoặc cổng `5050`:
1. Mở file `.env`.
2. Thay đổi giá trị các biến cổng:
   ```env
   NGINX_HTTP_PORT=8080
   PGADMIN_PORT=5051
   GRAFANA_PORT=3002
   ```
3. Chạy lại lệnh: `docker compose up -d`. Khi đó Web sẽ truy cập tại `http://localhost:8080`.

### 9.2. Container PostgreSQL báo trạng thái "Unhealthy"
Kiểm tra xem container database có gặp sự cố phân quyền volume hay không:
```powershell
docker compose logs postgres
```
Nếu cần khởi tạo lại database sạch:
```powershell
docker compose down -v
docker compose up -d
```

### 9.3. Backend báo lỗi không kết nối được Database
Nguyên nhân thường do backend khởi động trước khi PostgreSQL hoàn tất nạp dữ liệu.
Trong `docker-compose.yml`, dịch vụ `backend` đã được cấu hình phụ thuộc thông minh:
```yaml
depends_on:
  postgres:
    condition: service_healthy
```
Điều này đảm bảo Backend chỉ khởi động khi PostgreSQL đã trải qua bài kiểm tra `pg_isready` thành công.

---
*Tài liệu được biên soạn phục vụ đồ án môn học Triển khai & Quản trị Hệ thống Phần mềm - Đề tài 14.*
