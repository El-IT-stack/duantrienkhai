# Đề tài 14 - Hệ thống Quản lý Dự án (Project Management)

**Môn học:** Triển khai & Quản trị Hệ thống Phần mềm  
**Đề tài:** Đề 14 - Hệ thống Quản lý Dự án, Công việc (Task) và Thành viên  
**GitHub Repository:** [https://github.com/El-IT-stack/duantrienkhai](https://github.com/El-IT-stack/duantrienkhai)

---

## Mục lục

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc & Công nghệ](#kiến-trúc--công-nghệ)
3. [Cấu trúc thư mục dự án](#cấu-trúc-thư-mục-dự-án)
4. [Yêu cầu môi trường & Cài đặt](#yêu-cầu-môi-trường--cài-đặt)
5. [Hướng dẫn khởi chạy hệ thống (Docker Compose)](#hướng-dẫn-khởi-chạy-hệ-thống-docker-compose)
6. [Bảng danh mục dịch vụ & Port Mapping](#bảng-danh-mục-dịch-vụ--port-mapping)
7. [Tài khoản demo đăng nhập](#tài-khoản-demo-đăng-nhập)
8. [Tài liệu API (Swagger UI)](#tài-liệu-api-swagger-ui)
9. [Hệ thống Giám sát Monitoring (Prometheus + Grafana + Exporters)](#hệ-thống-giám-sát-monitoring-prometheus--grafana--exporters)
10. [Hệ thống Thu thập Log tập trung (Loki + Promtail & LogQL)](#hệ-thống-thu-thập-log-tập-trung-loki--promtail--logql)
11. [Các biện pháp Hardening & An toàn hệ thống](#các-biện-pháp-hardening--an-toàn-hệ-thống)
12. [Xử lý sự cố thường gặp (Troubleshooting)](#xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## Tổng quan hệ thống

Hệ thống Quản lý Dự án là giải pháp Full-Stack containerized hoàn chỉnh, hỗ trợ các chức năng thực tế:

| Phân hệ chức năng | Mô tả chi tiết |
|---|---|
| **Xác thực & Phân quyền (RBAC)** | Đăng nhập, đăng xuất JWT Bearer, phân quyền chặt chẽ 3 cấp: **Admin**, **Project Manager**, **Member**. Mật khẩu mã hóa Bcrypt. |
| **Quản lý Dự án** | Tạo, sửa, xóa, tìm kiếm, lọc theo trạng thái (Planning, In Progress, Completed, Cancelled). Tính toán % tiến độ hoàn thành theo thời gian thực từ database. |
| **Quản lý Công việc (Task Kanban)** | Tạo task, gán assignee, deadline, độ ưu tiên (Low, Medium, High, Urgent), kéo thả/cập nhật trạng thái (TODO, IN_PROGRESS, REVIEW, DONE), lọc task quá hạn. |
| **Thảo luận & Bình luận (Comments)** | Bình luận theo từng công việc, trao đổi giữa thành viên trong nhóm. |
| **Trang Dashboard điều hành** | Dữ liệu KPIs thực từ PostgreSQL: tổng dự án, dự án đang chạy/hoàn thành, tổng task theo trạng thái/mức độ ưu tiên, cảnh báo trễ hạn. |
| **Reverse Proxy & SSL** | Nginx Reverse Proxy cân bằng tải, bảo vệ API, phục vụ HTTPS tự ký, chặn clickjacking và ép Security Headers. |
| **Monitoring & Metrics** | Prometheus thu thập metrics thời gian thực từ 4 nguồn: Container (cAdvisor), Nginx (Nginx Exporter), Database (Postgres Exporter), Backend API (Prom-client). Dashboard Grafana trực quan. |
| **Centralized Logging** | Loki + Promtail thu thập log Nginx (JSON access & error) và Backend application log có cấu trúc, hỗ trợ truy vấn LogQL mạnh mẽ. |

---

## Kiến trúc & Công nghệ

```
+-----------------------------------------------------------------------------------+
|                                CLIENT (Web Browser)                               |
+-----------------------------------------+-----------------------------------------+
                                          | Port 80 (HTTP) / Port 443 (HTTPS)
+-----------------------------------------v-----------------------------------------+
|                        NGINX REVERSE PROXY (pm_nginx)                             |
|  - Định tuyến /            -> Frontend React SPA                                  |
|  - Định tuyến /api/*       -> Backend NestJS REST API                             |
|  - Định tuyến /stub_status -> Nginx Prometheus Exporter                           |
|  - Security Headers: CSP, X-Frame-Options, X-Content-Type-Options, etc.           |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
+--------------------v----+                     +---------v-----------+
| FRONTEND SPA            |                     | BACKEND API (NestJS)|
| - React 18, TypeScript  |                     | - Node.js 20, Nest  |
| - Tailwind CSS, Lucide  |                     | - JWT Auth, Swagger |
| - Non-root container    |                     | - Non-root (appuser)|
+-------------------------+                     +----------+----------+
                                                           |
                                                +----------v----------+
                                                | POSTGRESQL 16 DB    |
                                                | - Internal port 5432|
                                                | - Named Volume Data |
                                                +----------+----------+
                                                           |
                      +------------------------------------+------------------------------------+
                      |                                                                         |
             +--------v---------+                                                      +--------v--------+
             | pgAdmin 4 GUI    |                                                      | Postgres Exporter|
             | Port 5050        |                                                      | Port 9187 (int) |
             +------------------+                                                      +--------+--------+
                                                                                                |
============================= MONITORING & LOGGING STACK =======================================|
                                                                                                |
 +------------------+     +-------------------+     +------------------+                        |
 | cAdvisor         |     | Nginx Exporter    |     | Backend Metrics  |                        |
 | (Resource Metrics|     | (Active Conns/Req)|     | (HTTP/Process)   |                        |
 | Port 8080        |     | Port 9113 (int)   |     | Port 3000 (int)  |                        |
 +--------+---------+     +---------+---------+     +--------+---------+                        |
          |                         |                        |                                  |
          +-------------------------+------------------------+----------------------------------+
                                    |
                             +------v------+
                             | PROMETHEUS  | <===== Scrape định kỳ mỗi 10s
                             | Port 9090   |
                             +------+------+
                                    |
                             +------v------+
                             |   GRAFANA   | <===== Dashboard tổng hợp hiển thị đồng thời
                             |  Port 3001  |        Metrics (Prometheus) & Realtime Logs (Loki)
                             +------^------+
                                    |
                             +------+------+
                             |    LOKI     |
                             |  Port 3100  |
                             +------^------+
                                    |
                             +------+------+
                             |  PROMTAIL   | <===== Thu thập JSON Logs từ Nginx (/var/log/nginx)
                             | (Log Shipper|        và Backend (/var/log/backend/app.log)
                             +-------------+
```

### Công nghệ sử dụng

| Tầng kiến trúc | Công nghệ chính | Phiên bản |
|---|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios | React 18, Vite 5 |
| **Backend** | NestJS, TypeScript, Passport JWT, Bcrypt, Prom-client, Swagger | NestJS 10, Node 20 Alpine |
| **Database** | PostgreSQL, pgAdmin 4 | Postgres 16 Alpine, pgAdmin 8 |
| **Web Server** | Nginx Reverse Proxy, OpenSSL Self-signed Cert | Nginx 1.25 Alpine |
| **Monitoring** | Prometheus, Grafana, cAdvisor, Nginx Exporter, Postgres Exporter | Prometheus 2.51, Grafana 10.4 |
| **Logging** | Loki, Promtail (Structured JSON Logs) | Loki 2.9.5, Promtail 2.9.5 |
| **Orchestration** | Docker, Docker Compose | Compose v2 / v5 |

---

## Cấu trúc thư mục dự án

```
duantrienkhai/
├── .env                          # File cấu hình biến môi trường (được bảo vệ, không commit Git)
├── .env.example                  # File mẫu biến môi trường chuẩn
├── .gitignore                    # Loại trừ node_modules, dist, .env, *.key private keys
├── docker-compose.yml            # File điều phối 12 dịch vụ Docker Compose hoàn chỉnh
├── Makefile                      # Makefile rút gọn các lệnh make, make clean, make logs
├── README.md                     # Tài liệu hướng dẫn kỹ thuật chi tiết
│
├── backend/                      # Mã nguồn NestJS REST API
│   ├── Dockerfile                # Multi-stage build, chạy non-root user (appuser)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── auth/                 # Xác thực JWT, đăng ký, đăng nhập, RolesGuard
│       ├── users/                # Quản lý tài khoản và thành viên
│       ├── projects/             # Quản lý dự án, thành viên dự án, tiến độ
│       ├── tasks/                # Quản lý công việc Kanban, priority, hạn chót, comments
│       ├── dashboard/            # Tổng hợp thống kê KPIs thời gian thực
│       ├── database/             # Kết nối PostgreSQL connection pool
│       ├── metrics/              # Prom-client exporter (/api/metrics)
│       └── common/               # Filters xử lý lỗi và LoggingInterceptor xuất JSON log
│
├── frontend/                     # Mã nguồn React SPA
│   ├── Dockerfile                # Multi-stage build & Nginx runtime
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── components/           # Navbar, Sidebar, Layout dùng chung
│       ├── pages/                # DashboardPage, ProjectsPage, TasksPage, MembersPage, LoginPage
│       ├── services/             # Axios API client kết nối Backend
│       └── types/                # TypeScript interface định kiểu dữ liệu
│
├── database/
│   └── init.sql                  # Script tạo Schema, Trigger cập nhật, Chỉ mục Index, Seed Data mẫu
│
├── nginx/
│   ├── conf.d/
│   │   └── default.conf          # Định tuyến reverse proxy, Security Headers, JSON log format, /stub_status
│   └── ssl/                      # Chứng chỉ SSL và script tạo chứng chỉ tự ký
│       ├── generate-ssl.sh
│       └── generate-ssl.ps1
│
├── prometheus/
│   └── prometheus.yml            # Scrape config cho 5 targets (backend, cadvisor, nginx, postgres, prometheus)
│
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasources.yml   # Auto-provision Prometheus & Loki datasources
│       └── dashboards/
│           ├── dashboards.yml
│           └── json/             # Dashboard JSON hoàn chỉnh giám sát hệ thống
│
├── loki/
│   └── loki-config.yml           # Cấu hình lưu trữ tsdb / filesystem cho Loki
│
└── promtail/
    └── promtail-config.yml       # Cấu hình thu thập Nginx JSON access log, error log, và backend app log
```

---

## Yêu cầu môi trường & Cài đặt

Trước khi triển khai, máy chủ hoặc máy phát triển cần cài đặt sẵn:
- **Docker Desktop** (hoặc Docker Engine trên Linux) phiên bản 20.10 trở lên.
- **Docker Compose** v2 trở lên (tích hợp sẵn trong lệnh `docker compose`).
- Đảm bảo các cổng mặc định sau chưa bị chiếm dụng: `80`, `443`, `3001`, `5050`, `8080`, `9090`. (Nếu bị trùng, có thể điều chỉnh trong file `.env`).

---

## Hướng dẫn khởi chạy hệ thống (Docker Compose)

### Bước 1: Chuẩn bị file môi trường `.env`
Sao chép từ file mẫu `.env.example`:
```bash
# Trên Windows PowerShell
Copy-Item .env.example .env

# Trên Linux / macOS
cp .env.example .env
```

### Bước 2: Khởi động toàn bộ cụm dịch vụ bằng 1 lệnh duy nhất
```bash
docker compose up -d --build
```
*Hoặc sử dụng các script hỗ trợ:*
- **Windows:** Chạy file `start.bat` (hoặc `run.bat`).
- **Linux/macOS:** Chạy lệnh `./start.sh` (hoặc `make`).

### Bước 3: Kiểm tra trạng thái hoạt động của các container
```bash
docker compose ps
```
Toàn bộ 12 container phải ở trạng thái `Up` (và `healthy` đối với database/cadvisor):
- `pm_nginx`
- `pm_frontend`
- `pm_backend`
- `pm_postgres`
- `pm_pgadmin`
- `pm_prometheus`
- `pm_grafana`
- `pm_cadvisor`
- `pm_nginx_exporter`
- `pm_postgres_exporter`
- `pm_loki`
- `pm_promtail`

### Bước 4: Xem log thời gian thực khi cần kiểm tra
```bash
docker compose logs -f
# Hoặc xem riêng từng dịch vụ:
docker compose logs -f backend
docker compose logs -f nginx
docker compose logs -f promtail
```

### Bước 5: Dừng hệ thống khi không sử dụng
```bash
docker compose down
# Hoặc xóa toàn bộ volumes dữ liệu để reset về ban đầu:
docker compose down -v
```

---

## Bảng danh mục dịch vụ & Port Mapping

| Dịch vụ | Địa chỉ URL | Giao thức / Port | Mục đích sử dụng |
|---|---|---|---|
| **Giao diện Web (Frontend)** | [http://localhost](http://localhost) | HTTP (80) | Giao diện chính quản lý dự án, công việc, thành viên |
| **Giao diện Web Bảo mật (HTTPS)** | [https://localhost](https://localhost) | HTTPS (443) | Giao diện Web chạy qua SSL tự ký |
| **Backend REST API** | [http://localhost/api](http://localhost/api) | HTTP (80 qua Nginx) | Cổng API backend cho mọi chức năng |
| **API Documentation (Swagger)** | [http://localhost/api/docs](http://localhost/api/docs) | HTTP (80 qua Nginx) | Thử nghiệm và xem đặc tả toàn bộ REST API |
| **API Health Check** | [http://localhost/api/health](http://localhost/api/health) | HTTP (80 qua Nginx) | Kiểm tra trạng thái Database và tài nguyên bộ nhớ |
| **pgAdmin 4** | [http://localhost:5050](http://localhost:5050) | HTTP (5050) | Công cụ trực quan quản trị cơ sở dữ liệu PostgreSQL |
| **Grafana Dashboard** | [http://localhost:3001](http://localhost:3001) | HTTP (3001) | Bảng điều khiển giám sát toàn diện Metrics & Logs |
| **Prometheus Web UI** | [http://localhost:9090](http://localhost:9090) | HTTP (9090) | Tra cứu và kiểm tra trạng thái các Target Scrape |
| **cAdvisor Container Metrics** | [http://localhost:8080](http://localhost:8080) | HTTP (8080) | Xem chi tiết CPU, RAM từng container Docker |
| **Loki Engine** | [http://localhost:3100](http://localhost:3100) | HTTP (3100) | Endpoint máy chủ lưu trữ và truy vấn Log tập trung |

---

## Tài khoản demo đăng nhập

### 1. Đăng nhập ứng dụng Web Project Management
Mật khẩu chung cho toàn bộ tài khoản demo: **`Admin@123`**

| Vai trò | Email đăng nhập | Quyền hạn trong hệ thống |
|---|---|---|
| **Admin (Quản trị viên)** | `admin@pm.local` | Toàn quyền quản trị hệ thống, quản lý người dùng, tạo/xóa dự án |
| **Project Manager 1** | `pm.minh@pm.local` | Quản lý dự án PMS, giao task, phân công thành viên, cập nhật tiến độ |
| **Project Manager 2** | `pm.huong@pm.local` | Quản lý dự án Cổng thanh toán và dự án DevOps |
| **Thành viên Dev** | `dev.tuan@pm.local` | Lập trình viên Backend, cập nhật tiến độ công việc Kanban |
| **Thành viên Frontend** | `dev.linh@pm.local` | Lập trình viên Frontend |
| **Thành viên QA/Tester** | `qa.nam@pm.local` | Kiểm thử viên, phụ trách task kiểm toán an toàn và kiểm thử tải |

### 2. Đăng nhập pgAdmin 4
- **URL:** [http://localhost:5050](http://localhost:5050)
- **Tài khoản:** `admin@pm.com`
- **Mật khẩu:** `PgAdmin@2026_Secure!`
- **Thông số kết nối Database Server trong pgAdmin:**
  - Host name: `postgres`
  - Port: `5432`
  - Maintenance database: `project_management_db`
  - Username: `postgres_admin`
  - Password: `StrongP@ssw0rd_2026_Secure!`

### 3. Đăng nhập Grafana
- **URL:** [http://localhost:3001](http://localhost:3001)
- **Username:** `admin`
- **Password:** `Grafana@2026_Secure!`

---

## Tài liệu API (Swagger UI)

Toàn bộ tài liệu OpenAPI 3.0 được tích hợp tại: **`http://localhost/api/docs`**

### Cách kiểm thử API có xác thực trên Swagger:
1. Gửi request `POST /api/auth/login` với body:
   ```json
   {
     "email": "admin@pm.local",
     "password": "Admin@123"
   }
   ```
2. Copy chuỗi `accessToken` trả về.
3. Bấm nút **Authorize** (ổ khóa màu xanh ở góc phải trên Swagger UI).
4. Dán token vào ô `Value` và bấm **Authorize**. Mọi thao tác gọi API sau đó sẽ tự động đính kèm token.

---

## Hệ thống Giám sát Monitoring (Prometheus + Grafana + Exporters)

### 1. Các Exporter thu thập chỉ số
Hệ thống tích hợp đầy đủ các Exporter chuyên dụng theo yêu cầu:
1. **cAdvisor (`pm_cadvisor:8080`):** Đo lường CPU, RAM, Network I/O, trạng thái của từng container trong stack.
2. **Nginx Prometheus Exporter (`pm_nginx_exporter:9113`):** Cào dữ liệu từ endpoint `/stub_status` của Nginx (Active connections, Reading, Writing, Waiting, tổng lượt request).
3. **PostgreSQL Exporter (`pm_postgres_exporter:9187`):** Thu thập số kết nối active đến database, tốc độ commit/rollback transactions, locks, dung lượng database.
4. **Backend Prom-client (`pm_backend:3000/api/metrics`):** Thu thập metrics tiến trình Node.js (RSS, Heap memory, CPU) và metrics tùy biến (`http_requests_total`, `http_request_duration_seconds`, `pm_database_connected`).

### 2. Kiểm tra trạng thái Prometheus Targets
Truy cập **`http://localhost:9090/targets`**, toàn bộ 5 targets đều đạt trạng thái **UP**:
- `backend` (UP)
- `cadvisor` (UP)
- `nginx-exporter` (UP)
- `postgres-exporter` (UP)
- `prometheus` (UP)

### 3. Dashboard Grafana tự động nạp (Provisioning)
Grafana được cấu hình nạp sẵn dashboard: **`Project Management - Giám Sát Toàn Diện (Đề Tài 14)`** gồm 6 hàng panels trực quan:
- **Hàng 1: Tổng quan Dịch vụ & Database:** Trạng thái Postgres (Connected/Disconnected), Nginx (Running/Down), Tổng lượt HTTP Requests, Thời gian Uptime.
- **Hàng 2: Nginx Reverse Proxy:** Kết nối đang hoạt động (Active Connections), biểu đồ tần suất request theo thời gian, trạng thái kết nối Reading/Writing/Waiting.
- **Hàng 3: PostgreSQL Database Exporter:** Số kết nối active, tốc độ giao dịch (Transactions Commit/Rollback per second), Dung lượng DB tính bằng Bytes.
- **Hàng 4: cAdvisor Container Resources:** Biểu đồ % CPU và dung lượng RAM tiêu thụ chi tiết theo từng container `pm_*`.
- **Hàng 5: Backend API Performance:** Tần suất request theo Route và HTTP Status, Độ trễ phản hồi P95 Latency, Bộ nhớ RAM (RSS, Heap Used) và % CPU Node.js.
- **Hàng 6: Nhật ký tập trung từ Loki:** Bảng log stream thời gian thực từ Backend và Nginx.

---

## Hệ thống Thu thập Log tập trung (Loki + Promtail & LogQL)

Promtail đọc các log file có cấu trúc và đẩy về Loki Engine:
- **Nginx Access Log:** Được Nginx xuất dưới định dạng JSON (`json_analytics`) tại `/var/log/nginx/pm_access.log` (gắn nhãn `job="nginx_access"`).
- **Nginx Error Log:** Ghi nhận lỗi Nginx tại `/var/log/nginx/pm_error.log` (gắn nhãn `job="nginx_error"`).
- **Backend Application Log:** Do `LoggingInterceptor` xuất dưới định dạng JSON tại `/var/log/backend/app.log` (gắn nhãn `job="app"`).

### Ba truy vấn LogQL đã được kiểm chứng hoạt động thực tế

Mở **Grafana** -> Vào mục **Explore** (`http://localhost:3001/explore`) -> Chọn Datasource **Loki**:

#### Truy vấn 1: Xem toàn bộ Log Nginx Access
```logql
{job="nginx_access"}
```
> **Ý nghĩa:** Liệt kê toàn bộ các lượt truy cập đi qua cổng Nginx Reverse Proxy kèm đầy đủ thông tin: IP, phương thức HTTP, URI, status code, thời gian xử lý và user-agent.

#### Truy vấn 2: Lọc các request Nginx có mã trạng thái lỗi từ 400 trở lên (Client Error & Server Error)
```logql
{job="nginx_access"} | json | status >= 400
```
> **Ý nghĩa:** Trích xuất trường `status` từ JSON log và lọc những request bị lỗi (400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error) để phát hiện sự cố bảo mật hoặc endpoint hỏng.

#### Truy vấn 3: Tìm log lỗi ứng dụng Backend
```logql
{job="app"} | json | level="error"
```
> **Ý nghĩa:** Phân tích log ứng dụng backend và lọc ra những sự kiện có mức độ `level="error"`, hiển thị chi tiết thông báo lỗi (Error Message), route bị lỗi và stack trace phục vụ điều tra nguyên nhân gốc rễ.

---

## Các biện pháp Hardening & An toàn hệ thống

1. **Chạy ứng dụng bằng Non-Root User:**
   - Container Backend chạy dưới quyền user `appuser` (UID non-root, thuộc group `appgroup`), không có quyền root trên container hoặc host.
   - Container Frontend chạy dưới quyền user `nginx`.
2. **Ngăn chặn leo thang đặc quyền (No New Privileges):**
   - Áp dụng cấu hình `security_opt: [no-new-privileges:true]` cho toàn bộ các container trong Docker Compose.
3. **Phân tách mạng nội bộ (Network Segmentation):**
   - `pm_public_network`: Chỉ chứa Nginx, Frontend, pgAdmin và Grafana.
   - `pm_internal_network`: Mạng cô lập dành riêng cho giao tiếp giữa Nginx, Backend API, PostgreSQL và pgAdmin. Cổng 5432 của PostgreSQL **không bao giờ công khai ra ngoài host** hay internet.
   - `pm_monitoring_network`: Mạng cô lập dành cho Prometheus cào metrics từ các exporter và Promtail chuyển log sang Loki.
4. **Bảo mật Nginx Reverse Proxy (Security Headers):**
   - `X-Frame-Options: SAMEORIGIN` (Chống Clickjacking).
   - `X-Content-Type-Options: nosniff` (Chống MIME-type sniffing).
   - `X-XSS-Protection: 1; mode=block` (Chống tấn công XSS).
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
   - `Content-Security-Policy`: Giới hạn nguồn nạp script, style, font, image và websocket an toàn.
   - Hỗ trợ SSL/TLSv1.2, TLSv1.3 với bộ mã hóa mạnh (`HIGH:!aNULL:!MD5`).
5. **Bảo vệ Secrets & Khóa riêng:**
   - Khóa bí mật SSL (`*.key`, `nginx/ssl/*.key`) và file môi trường `.env` được cấu hình loại trừ tuyệt đối trong `.gitignore`.
   - Mật khẩu quản trị (Postgres, pgAdmin, Grafana, JWT Secret) được truyền qua biến môi trường.
6. **Bảo toàn dữ liệu (Data Persistence):**
   - Toàn bộ dữ liệu PostgreSQL được lưu trữ trên Named Volume `pm_postgres_data`. Dữ liệu vẫn được bảo toàn nguyên vẹn sau khi khởi động lại (`restart`) hoặc tái tạo container.
   - Logs được lưu trữ trên named volumes (`pm_nginx_logs`, `pm_backend_logs`).

---

## Xử lý sự cố thường gặp (Troubleshooting)

### 1. Trùng cổng mạng (Port already in use)
Nếu gặp lỗi `bind: address already in use` trên cổng 80 hoặc 5050:
- Mở file `.env`.
- Thay đổi giá trị cổng:
  ```env
  NGINX_HTTP_PORT=8080
  PGADMIN_PORT=5051
  GRAFANA_PORT=3002
  ```
- Khởi động lại: `docker compose up -d`

### 2. Kiểm tra container bị Restart hoặc không khởi động được
```bash
# Xem 50 dòng log gần nhất của container có vấn đề
docker compose logs --tail=50 <service_name>

# Ví dụ kiểm tra backend:
docker compose logs --tail=50 backend

# Ví dụ kiểm tra database:
docker compose logs --tail=50 postgres
```

### 3. Reset toàn bộ dữ liệu mẫu và khởi tạo lại sạch sẽ
```bash
docker compose down -v
docker compose up -d --build
```
Script `init.sql` sẽ tự động khởi tạo lại cấu trúc bảng, ràng buộc khóa ngoại, trigger và dữ liệu mẫu chuẩn ban đầu.
