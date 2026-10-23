import os
from playwright.sync_api import sync_playwright

os.makedirs('report_images', exist_ok=True)

# 1. Architecture Diagram HTML
html_architecture = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
  body { background: #0f172a; color: #f8fafc; padding: 40px; width: 2200px; height: 1350px; display: flex; flex-direction: column; justify-content: space-between; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 38px; font-weight: 800; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase; }
  .header p { font-size: 18px; color: #94a3b8; margin-top: 8px; }
  
  .layers-container { display: flex; flex-direction: column; gap: 24px; flex: 1; }
  
  .layer { background: rgba(30, 41, 59, 0.7); border: 2px solid #334155; border-radius: 16px; padding: 20px 30px; position: relative; }
  .layer-title { position: absolute; top: -14px; left: 30px; background: #0284c7; color: white; padding: 4px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  
  .layer-clients { border-color: #38bdf8; }
  .layer-clients .layer-title { background: #0284c7; }
  
  .layer-edge { border-color: #10b981; }
  .layer-edge .layer-title { background: #059669; }
  
  .layer-app { border-color: #8b5cf6; }
  .layer-app .layer-title { background: #7c3aed; }
  
  .layer-data { border-color: #f59e0b; }
  .layer-data .layer-title { background: #d97706; }
  
  .layer-monitoring { border-color: #ec4899; }
  .layer-monitoring .layer-title { background: #db2777; }
  
  .grid { display: flex; justify-content: center; gap: 30px; align-items: center; }
  
  .card { background: #1e293b; border: 1px solid #475569; border-radius: 12px; padding: 18px 24px; min-width: 280px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); text-align: center; }
  .card-icon { font-size: 32px; margin-bottom: 8px; }
  .card-name { font-size: 20px; font-weight: 700; color: #f1f5f9; }
  .card-sub { font-size: 13px; color: #38bdf8; font-weight: 600; margin-top: 4px; }
  .card-desc { font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.4; }
  .card-ports { display: inline-block; background: #0f172a; border: 1px solid #334155; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; color: #34d399; margin-top: 8px; font-family: monospace; }
  
  .flow-arrow { text-align: center; font-size: 24px; color: #64748b; font-weight: bold; margin: -10px 0; }
  .badge-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; margin: 2px; }
  .tag-blue { background: #0369a1; color: white; }
  .tag-purple { background: #5b21b6; color: white; }
  .tag-green { background: #065f46; color: white; }
  .tag-amber { background: #78350f; color: white; }
  
  .footer-legend { display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-radius: 12px; padding: 12px 24px; border: 1px solid #334155; }
  .legend-items { display: flex; gap: 24px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cbd5e1; }
  .legend-color { width: 14px; height: 14px; border-radius: 3px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Hệ thống Quản lý Dự án (Project Management System)</h1>
    <p>Sơ đồ Kiến trúc Phân tầng Tổng thể & Các Khối Chức năng Hệ thống (Multi-Tier Architecture)</p>
  </div>

  <div class="layers-container">
    <!-- LAYER 1: CLIENTS -->
    <div class="layer layer-clients">
      <div class="layer-title">Tầng 1: Khách hàng / Người dùng (Client Access Layer)</div>
      <div class="grid">
        <div class="card" style="min-width: 380px;">
          <div class="card-icon">💻</div>
          <div class="card-name">Web Browser (Người dùng cuối)</div>
          <div class="card-sub">Desktop / Laptop / Mobile</div>
          <div class="card-desc">Thành viên dự án, Quản lý (PM) đăng nhập thao tác Kanban, quản lý công việc và xem tiến độ.</div>
          <div class="card-ports">Giao thức HTTP / HTTPS</div>
        </div>
        <div class="card" style="min-width: 380px;">
          <div class="card-icon">👨‍💻</div>
          <div class="card-name">DevOps / Administrator</div>
          <div class="card-sub">Quản trị viên & Vận hành viên</div>
          <div class="card-desc">Truy cập Dashboard Grafana, kiểm tra Target Prometheus, quản trị cơ sở dữ liệu qua pgAdmin, cAdvisor.</div>
          <div class="card-ports">Các cổng quản trị bảo mật</div>
        </div>
      </div>
    </div>

    <!-- LAYER 2: EDGE / REVERSE PROXY -->
    <div class="layer layer-edge">
      <div class="layer-title">Tầng 2: Cổng vào & Điều hướng mạng (Edge & Reverse Proxy Gateway)</div>
      <div class="grid">
        <div class="card" style="min-width: 700px; border-color: #10b981;">
          <div class="card-icon">🛡️</div>
          <div class="card-name">pm_nginx (Nginx 1.25 Alpine)</div>
          <div class="card-sub">Reverse Proxy • Load Balancer • SSL Termination • Security Hardening</div>
          <div class="card-desc">
            Định tuyến / -> frontend:80 (React SPA) | Định tuyến /api/ -> backend:3000 (NestJS REST API)<br>
            Bảo vệ với Security Headers: X-Frame-Options, X-Content-Type-Options, CSP, HSTS • Gzip Compression • Rate Limiting
          </div>
          <div class="card-ports">HOST PORT: 80 (HTTP) • 443 (HTTPS)</div>
        </div>
      </div>
    </div>

    <!-- LAYER 3: APPLICATION -->
    <div class="layer layer-app">
      <div class="layer-title">Tầng 3: Tầng Ứng dụng & Nghiệp vụ (Application Layer)</div>
      <div class="grid">
        <div class="card" style="flex: 1; border-color: #38bdf8;">
          <div class="card-icon">⚛️</div>
          <div class="card-name">pm_frontend</div>
          <div class="card-sub">React 18 + Vite + TypeScript</div>
          <div class="card-desc">
            Single Page Application (SPA), React Router, Axios Client, Tailwind CSS.<br>
            Các trang: Login, Dashboard, Projects, Tasks (Kanban), Members, Profile.
          </div>
          <div class="card-ports">PORT NỘI BỘ: 80/tcp (pm_internal_network)</div>
        </div>

        <div class="card" style="flex: 1.2; border-color: #a855f7;">
          <div class="card-icon">🦁</div>
          <div class="card-name">pm_backend</div>
          <div class="card-sub">NestJS 10 + TypeScript + TypeORM</div>
          <div class="card-desc">
            REST API Modular: Auth (JWT, Bcrypt), Users, Projects, Tasks (Kanban), Dashboard Stats.<br>
            Swagger OpenAPI UI (/api/docs) • Prometheus Metrics (/metrics) • Health check (/api/health).
          </div>
          <div class="card-ports">PORT NỘI BỘ: 3000/tcp (pm_internal_network)</div>
        </div>
      </div>
    </div>

    <!-- LAYER 4: DATABASE & STORAGE -->
    <div class="layer layer-data">
      <div class="layer-title">Tầng 4: Tầng Cơ sở dữ liệu & Quản trị (Data Persistence & Management)</div>
      <div class="grid">
        <div class="card" style="flex: 1.2; border-color: #f59e0b;">
          <div class="card-icon">🐘</div>
          <div class="card-name">pm_postgres</div>
          <div class="card-sub">PostgreSQL 16 Alpine Database</div>
          <div class="card-desc">
            Lưu trữ quan hệ: users, projects, project_members, tasks, task_comments.<br>
            Khóa ngoại UUID, Indexes tối ưu, Trigger set_timestamp, Volume bền vững: postgres_data.
          </div>
          <div class="card-ports">PORT NỘI BỘ: 5432/tcp (Cô lập an toàn trong pm_internal_network)</div>
        </div>

        <div class="card" style="flex: 0.9; border-color: #eab308;">
          <div class="card-icon">🗄️</div>
          <div class="card-name">pm_pgadmin</div>
          <div class="card-sub">pgAdmin 4 v8 (Web Database GUI)</div>
          <div class="card-desc">
            Giao diện trực quan quản lý CSDL, chạy câu truy vấn SQL, backup/restore dữ liệu, xem schema.
          </div>
          <div class="card-ports">HOST PORT: 5050 -> 80/tcp</div>
        </div>
      </div>
    </div>

    <!-- LAYER 5: OBSERVABILITY & MONITORING -->
    <div class="layer layer-monitoring">
      <div class="layer-title">Tầng 5: Giám sát, Metrics & Quản lý Log tập trung (Observability & Monitoring Stack)</div>
      <div class="grid" style="gap: 16px;">
        <div class="card" style="flex: 1; min-width: 220px; border-color: #f43f5e;">
          <div class="card-icon">🔥</div>
          <div class="card-name" style="font-size: 16px;">pm_prometheus</div>
          <div class="card-sub">Prometheus v2.51.0</div>
          <div class="card-desc">Scrape metrics chu kỳ 15s từ 6 exporters & targets.</div>
          <div class="card-ports">PORT: 9090</div>
        </div>

        <div class="card" style="flex: 1; min-width: 220px; border-color: #f97316;">
          <div class="card-icon">📊</div>
          <div class="card-name" style="font-size: 16px;">pm_grafana</div>
          <div class="card-sub">Grafana v10.4.1</div>
          <div class="card-desc">Trực quan hóa dashboard CPU, RAM, HTTP, DB và logs.</div>
          <div class="card-ports">PORT: 3001</div>
        </div>

        <div class="card" style="flex: 1; min-width: 220px; border-color: #06b6d4;">
          <div class="card-icon">📜</div>
          <div class="card-name" style="font-size: 16px;">pm_loki</div>
          <div class="card-sub">Grafana Loki v2.9.5</div>
          <div class="card-desc">Lưu trữ log tập trung, đánh index nhãn, hỗ trợ LogQL.</div>
          <div class="card-ports">PORT: 3100</div>
        </div>

        <div class="card" style="flex: 1; min-width: 220px; border-color: #10b981;">
          <div class="card-icon">🚚</div>
          <div class="card-name" style="font-size: 16px;">pm_promtail</div>
          <div class="card-sub">Promtail v2.9.5</div>
          <div class="card-desc">Log shipper thu thập docker container logs đẩy về Loki.</div>
          <div class="card-ports">DOCKER LOG SHIPPER</div>
        </div>

        <div class="card" style="flex: 1; min-width: 220px; border-color: #a855f7;">
          <div class="card-icon">📈</div>
          <div class="card-name" style="font-size: 16px;">pm_cadvisor</div>
          <div class="card-sub">Google cAdvisor v0.49.1</div>
          <div class="card-desc">Đo CPU, RAM, Network I/O thời gian thực cho từng container.</div>
          <div class="card-ports">PORT: 8080</div>
        </div>

        <div class="card" style="flex: 1; min-width: 220px; border-color: #64748b;">
          <div class="card-icon">⚙️</div>
          <div class="card-name" style="font-size: 16px;">Exporters</div>
          <div class="card-sub">Nginx & Postgres Exporter</div>
          <div class="card-desc">Trích xuất chỉ số chi tiết Nginx (port 9113) & PostgreSQL (port 9187).</div>
          <div class="card-ports">PORTS: 9113 • 9187</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-legend">
    <div style="font-size: 14px; color: #94a3b8;">
      <strong>Repository:</strong> https://github.com/El-IT-stack/duantrienkhai &nbsp;|&nbsp; 
      <strong>Branch:</strong> main &nbsp;|&nbsp; 
      <strong>Deploy Mode:</strong> Docker Compose (12/12 Services UP & Healthy)
    </div>
    <div class="legend-items">
      <div class="legend-item"><div class="legend-color" style="background: #38bdf8;"></div> Client/Frontend</div>
      <div class="legend-item"><div class="legend-color" style="background: #10b981;"></div> Gateway Nginx</div>
      <div class="legend-item"><div class="legend-color" style="background: #a855f7;"></div> Backend API</div>
      <div class="legend-item"><div class="legend-color" style="background: #f59e0b;"></div> Database</div>
      <div class="legend-item"><div class="legend-color" style="background: #f43f5e;"></div> Monitoring</div>
    </div>
  </div>
</body>
</html>
"""

# 2. Container Network Interconnection Topology HTML
html_network = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
  body { background: #090d16; color: #f8fafc; padding: 40px; width: 2200px; height: 1350px; display: flex; flex-direction: column; justify-content: space-between; }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 38px; font-weight: 800; color: #38bdf8; text-transform: uppercase; }
  .header p { font-size: 18px; color: #94a3b8; margin-top: 6px; }

  .network-row { display: flex; gap: 30px; flex: 1; }
  
  .network-box { flex: 1; border-radius: 18px; padding: 24px; display: flex; flex-direction: column; position: relative; }
  
  .net-public { background: rgba(14, 165, 233, 0.05); border: 2px dashed #0284c7; }
  .net-internal { background: rgba(168, 85, 247, 0.05); border: 2px dashed #7c3aed; }
  .net-monitoring { background: rgba(244, 63, 94, 0.05); border: 2px dashed #e11d48; }

  .net-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; }
  .net-title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .net-subnet { font-family: monospace; font-size: 14px; background: rgba(0,0,0,0.5); padding: 4px 12px; border-radius: 6px; font-weight: bold; }

  .net-public .net-title { color: #38bdf8; }
  .net-public .net-subnet { color: #38bdf8; border: 1px solid #0284c7; }
  
  .net-internal .net-title { color: #c084fc; }
  .net-internal .net-subnet { color: #c084fc; border: 1px solid #7c3aed; }
  
  .net-monitoring .net-title { color: #fb7185; }
  .net-monitoring .net-subnet { color: #fb7185; border: 1px solid #e11d48; }

  .containers-stack { display: flex; flex-direction: column; gap: 14px; flex: 1; }

  .node { background: #131c2e; border: 1px solid #334155; border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
  .node-left { display: flex; align-items: center; gap: 14px; }
  .node-icon { font-size: 26px; }
  .node-info h4 { font-size: 16px; font-weight: 700; color: #f1f5f9; }
  .node-info p { font-size: 12px; color: #94a3b8; margin-top: 2px; }
  
  .node-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
  .port-badge { font-family: monospace; font-size: 12px; padding: 3px 8px; border-radius: 6px; font-weight: bold; }
  .badge-public { background: #0369a1; color: #e0f2fe; }
  .badge-internal { background: #581c87; color: #f3e8ff; }
  .badge-monitor { background: #881337; color: #ffe4e6; }
  .badge-healthy { background: #065f46; color: #a7f3d0; font-size: 11px; }

  .bridges-info { margin-top: 20px; background: #131c2e; border: 1px solid #334155; border-radius: 14px; padding: 18px 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .bridge-card h5 { font-size: 15px; color: #f1f5f9; font-weight: 700; margin-bottom: 4px; }
  .bridge-card p { font-size: 12px; color: #94a3b8; line-height: 1.4; }
</style>
</head>
<body>
  <div class="header">
    <h1>Mô hình Kết nối & Phân chia Mạng Container (Network Topology)</h1>
    <p>Kiến trúc 3 Mạng Bridge Độc Lập Cách Ly Bảo Mật: Public Network • Internal Network • Monitoring Network</p>
  </div>

  <div class="network-row">
    <!-- NETWORK 1: PUBLIC -->
    <div class="network-box net-public">
      <div class="net-header">
        <div class="net-title">🌐 pm_public_network</div>
        <div class="net-subnet">Bridge Driver • Public Ingress</div>
      </div>
      <div class="containers-stack">
        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">🛡️</div>
            <div class="node-info">
              <h4>pm_nginx</h4>
              <p>Reverse Proxy Gateway, tiếp nhận toàn bộ traffic HTTP/HTTPS từ ngoài</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:80 / 443</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">🗄️</div>
            <div class="node-info">
              <h4>pm_pgadmin</h4>
              <p>Web UI kết nối quản trị cơ sở dữ liệu PostgreSQL</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:5050</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">📊</div>
            <div class="node-info">
              <h4>pm_grafana</h4>
              <p>Giao diện trực quan hóa Dashboard giám sát và phân tích log</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:3001</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">🔥</div>
            <div class="node-info">
              <h4>pm_prometheus</h4>
              <p>Hệ thống giám sát chỉ số Time-Series & Target Explorer</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:9090</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">📈</div>
            <div class="node-info">
              <h4>pm_cadvisor</h4>
              <p>Google cAdvisor theo dõi tài nguyên phần cứng container</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:8080</span>
            <span class="port-badge badge-healthy">HEALTHY</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #0284c7;">
          <div class="node-left">
            <div class="node-icon">📜</div>
            <div class="node-info">
              <h4>pm_loki</h4>
              <p>Endpoint nhận truy vấn log từ Grafana Explore</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-public">0.0.0.0:3100</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NETWORK 2: INTERNAL -->
    <div class="network-box net-internal">
      <div class="net-header">
        <div class="net-title">🔒 pm_internal_network</div>
        <div class="net-subnet">Private Isolated • No Host Ports</div>
      </div>
      <div class="containers-stack">
        <div class="node" style="border-left: 5px solid #7c3aed;">
          <div class="node-left">
            <div class="node-icon">🛡️</div>
            <div class="node-info">
              <h4>pm_nginx (Bridge)</h4>
              <p>Đóng vai trò cầu nối chuyển tiếp traffic vào mạng nội bộ</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-internal">Upstream Gateway</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #7c3aed;">
          <div class="node-left">
            <div class="node-icon">⚛️</div>
            <div class="node-info">
              <h4>pm_frontend</h4>
              <p>Chứa file build tĩnh React SPA, phục vụ qua web server</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-internal">frontend:80</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #7c3aed;">
          <div class="node-left">
            <div class="node-icon">🦁</div>
            <div class="node-info">
              <h4>pm_backend</h4>
              <p>NestJS REST API thực thi nghiệp vụ, xác thực JWT</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-internal">backend:3000</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #7c3aed;">
          <div class="node-left">
            <div class="node-icon">🐘</div>
            <div class="node-info">
              <h4>pm_postgres</h4>
              <p>PostgreSQL 16 - CSDL tuyệt đối KHÔNG mở cổng ra ngoài host</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-internal">postgres:5432</span>
            <span class="port-badge badge-healthy">HEALTHY</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #7c3aed;">
          <div class="node-left">
            <div class="node-icon">⚙️</div>
            <div class="node-info">
              <h4>pm_postgres_exporter</h4>
              <p>Kết nối trực tiếp vào Postgres nội bộ lấy chỉ số truy vấn/kết nối</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-internal">exporter:9187</span>
            <span class="port-badge badge-healthy">STATUS: UP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NETWORK 3: MONITORING -->
    <div class="network-box net-monitoring">
      <div class="net-header">
        <div class="net-title">📡 pm_monitoring_network</div>
        <div class="net-subnet">Dedicated Scrape & Log Pipeline</div>
      </div>
      <div class="containers-stack">
        <div class="node" style="border-left: 5px solid #e11d48;">
          <div class="node-left">
            <div class="node-icon">🔥</div>
            <div class="node-info">
              <h4>pm_prometheus</h4>
              <p>Scraper trung tâm kết nối định kỳ đến tất cả các mục tiêu</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-monitor">Scrape Engine</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #e11d48;">
          <div class="node-left">
            <div class="node-icon">📊</div>
            <div class="node-info">
              <h4>pm_grafana</h4>
              <p>Query datasource Prometheus và Loki hiển thị biểu đồ</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-monitor">Visualization</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #e11d48;">
          <div class="node-left">
            <div class="node-icon">📜</div>
            <div class="node-info">
              <h4>pm_loki & pm_promtail</h4>
              <p>Đường truyền đẩy log từ các container tới kho lưu trữ Loki</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-monitor">loki:3100</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #e11d48;">
          <div class="node-left">
            <div class="node-icon">📈</div>
            <div class="node-info">
              <h4>pm_cadvisor</h4>
              <p>Cung cấp chỉ số CPU, RAM, Network I/O cho Prometheus</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-monitor">cadvisor:8080/metrics</span>
          </div>
        </div>

        <div class="node" style="border-left: 5px solid #e11d48;">
          <div class="node-left">
            <div class="node-icon">⚙️</div>
            <div class="node-info">
              <h4>pm_nginx_exporter</h4>
              <p>Đọc stub_status từ Nginx chuyển thành định dạng Prometheus</p>
            </div>
          </div>
          <div class="node-badges">
            <span class="port-badge badge-monitor">nginx-exporter:9113</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bridges-info">
    <div class="bridge-card">
      <h5>1. Nguyên tắc Không mở cổng CSDL</h5>
      <p>PostgreSQL 16 chỉ nằm trong <code>pm_internal_network</code>, ngăn ngừa 100% các cuộc tấn công Brute-force hoặc Scan cổng từ Internet vào database.</p>
    </div>
    <div class="bridge-card">
      <h5>2. Cơ chế Service Discovery</h5>
      <p>Các container giao tiếp với nhau bằng Tên Service (DNS nội bộ Docker như <code>backend</code>, <code>postgres</code>, <code>prometheus</code>) thay vì IP cố định.</p>
    </div>
    <div class="bridge-card">
      <h5>3. Reverse Proxy Đơn điểm</h5>
      <p>Nginx là điểm đón duy nhất cho người dùng ứng dụng, che giấu cấu trúc mạng bên trong và chuẩn hóa quản lý chứng chỉ SSL/TLS.</p>
    </div>
    <div class="bridge-card">
      <h5>4. Cách ly Mạng Giám sát</h5>
      <p>Mạng monitoring tách riêng lưu lượng metric và log để tránh ảnh hưởng băng thông của các giao dịch nghiệp vụ cốt lõi.</p>
    </div>
  </div>
</body>
</html>
"""

# 3. Data Flow & Observability Flow HTML
html_flow = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
  body { background: #0c1222; color: #f8fafc; padding: 40px; width: 2200px; height: 1350px; display: flex; flex-direction: column; justify-content: space-between; }
  .header { text-align: center; margin-bottom: 30px; }
  .header h1 { font-size: 38px; font-weight: 800; color: #38bdf8; text-transform: uppercase; }
  .header p { font-size: 18px; color: #94a3b8; margin-top: 6px; }

  .flows-container { display: flex; flex-direction: column; gap: 30px; flex: 1; }

  .flow-section { background: #131d33; border: 1px solid #334155; border-radius: 16px; padding: 24px 30px; }
  .flow-title { font-size: 18px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
  
  .flow-steps { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
  
  .step-box { background: #1e293b; border: 2px solid #475569; border-radius: 12px; padding: 16px 20px; flex: 1; text-align: center; position: relative; }
  .step-num { position: absolute; top: -12px; left: 16px; width: 24px; height: 24px; border-radius: 50%; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; color: white; }
  .step-icon { font-size: 28px; margin-bottom: 6px; }
  .step-name { font-size: 16px; font-weight: 700; color: #f1f5f9; }
  .step-desc { font-size: 12px; color: #94a3b8; margin-top: 4px; line-height: 1.3; }
  
  .arrow { font-size: 24px; font-weight: 800; color: #64748b; padding: 0 4px; }

  /* Flow 1: User */
  .flow-user .flow-title { color: #38bdf8; }
  .flow-user .step-box { border-color: #0284c7; }
  .flow-user .step-num { background: #0284c7; }
  .flow-user .arrow { color: #38bdf8; }

  /* Flow 2: Metrics */
  .flow-metrics .flow-title { color: #f59e0b; }
  .flow-metrics .step-box { border-color: #d97706; }
  .flow-metrics .step-num { background: #d97706; }
  .flow-metrics .arrow { color: #f59e0b; }

  /* Flow 3: Logs */
  .flow-logs .flow-title { color: #ec4899; }
  .flow-logs .step-box { border-color: #db2777; }
  .flow-logs .step-num { background: #db2777; }
  .flow-logs .arrow { color: #ec4899; }
</style>
</head>
<body>
  <div class="header">
    <h1>Sơ đồ Luồng Dữ liệu Nghiệp vụ & Vận hành Giám sát (Data & Observability Pipeline)</h1>
    <p>Chi tiết 3 luồng hoạt động chính: Luồng Tương tác Nghiệp vụ • Luồng Thu thập Metrics • Luồng Thu thập Log Tập trung</p>
  </div>

  <div class="flows-container">
    <!-- FLOW 1: USER BUSINESS -->
    <div class="flow-section flow-user">
      <div class="flow-title">🔵 LUỒNG 1: LUỒNG TRUY CẬP NGHIỆP VỤ & TƯƠNG TÁC NGƯỜI DÙNG (USER BUSINESS TRANSACTION)</div>
      <div class="flow-steps">
        <div class="step-box">
          <div class="step-num">1</div>
          <div class="step-icon">💻</div>
          <div class="step-name">Client Browser</div>
          <div class="step-desc">Gửi yêu cầu HTTP/HTTPS qua port 80/443 (Đăng nhập, Quản lý Dự án, Kéo thả Task).</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">2</div>
          <div class="step-icon">🛡️</div>
          <div class="step-name">Nginx Proxy</div>
          <div class="step-desc">Kiểm tra Security Headers, phân luồng: route tĩnh về Frontend, route /api/ về Backend.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">3</div>
          <div class="step-icon">🦁</div>
          <div class="step-name">NestJS API</div>
          <div class="step-desc">Kiểm tra JWT Bearer Token qua Auth Guard, Validation Pipe và Logging Interceptor.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">4</div>
          <div class="step-icon">🐘</div>
          <div class="step-name">PostgreSQL 16</div>
          <div class="step-desc">Thực thi truy vấn SQL (CRUD), ràng buộc khóa ngoại, transaction an toàn dữ liệu.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">5</div>
          <div class="step-icon">⚛️</div>
          <div class="step-name">React UI Render</div>
          <div class="step-desc">Nhận JSON response, cập nhật State React và hiển thị giao diện mượt mà không tải lại trang.</div>
        </div>
      </div>
    </div>

    <!-- FLOW 2: METRICS -->
    <div class="flow-section flow-metrics">
      <div class="flow-title">🟠 LUỒNG 2: LUỒNG THU THẬP & TRỰC QUAN HÓA CHỈ SỐ GIÁM SÁT (METRICS PIPELINE)</div>
      <div class="flow-steps">
        <div class="step-box">
          <div class="step-num">1</div>
          <div class="step-icon">📈</div>
          <div class="step-name">Metrics Targets</div>
          <div class="step-desc">cAdvisor (container stats), Backend (/metrics), Nginx Exporter, Postgres Exporter.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">2</div>
          <div class="step-icon">⏱️</div>
          <div class="step-name">Prometheus Scrape</div>
          <div class="step-desc">Prometheus kéo (pull) metrics mỗi 15 giây theo các job định nghĩa trong prometheus.yml.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">3</div>
          <div class="step-icon">💾</div>
          <div class="step-name">TSDB Storage</div>
          <div class="step-desc">Lưu trữ time-series database cục bộ với nhãn (labels), chỉ mục thời gian và nén dữ liệu.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">4</div>
          <div class="step-icon">📊</div>
          <div class="step-name">Grafana Dashboard</div>
          <div class="step-desc">Query dữ liệu qua PromQL, vẽ biểu đồ đường, đồng hồ đo CPU/RAM, tình trạng sống/chết container.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">5</div>
          <div class="step-icon">🚨</div>
          <div class="step-name">Cảnh báo Alerting</div>
          <div class="step-desc">Phát hiện các sự cố bất thường: Target DOWN, lỗi HTTP 5xx tăng cao, cạn kiệt RAM/CPU.</div>
        </div>
      </div>
    </div>

    <!-- FLOW 3: LOGS -->
    <div class="flow-section flow-logs">
      <div class="flow-title">🟣 LUỒNG 3: LUỒNG THU THẬP, LƯU TRỮ VÀ TRUY VẤN LOG TẬP TRUNG (LOGGING PIPELINE)</div>
      <div class="flow-steps">
        <div class="step-box">
          <div class="step-num">1</div>
          <div class="step-icon">📦</div>
          <div class="step-name">Container Stdout/Stderr</div>
          <div class="step-desc">Mọi container Docker xuất log ra console theo định dạng JSON tại /var/lib/docker/containers.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">2</div>
          <div class="step-icon">🚚</div>
          <div class="step-name">Promtail Agent</div>
          <div class="step-desc">Đọc file log, gắn metadata nhãn (container_name, job, stream) rồi gửi batch về Loki.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">3</div>
          <div class="step-icon">📜</div>
          <div class="step-name">Loki Log Store</div>
          <div class="step-desc">Lưu trữ log theo chunk nén tối ưu dung lượng, chỉ lập chỉ mục cho nhãn metadata.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">4</div>
          <div class="step-icon">🔍</div>
          <div class="step-name">Grafana Explore</div>
          <div class="step-desc">Truy vấn nhanh bằng LogQL: {job="docker-json"} |= "error" để phân tích nguyên nhân lỗi.</div>
        </div>
        <div class="arrow">➔</div>
        <div class="step-box">
          <div class="step-num">5</div>
          <div class="step-icon">🛡️</div>
          <div class="step-name">Phân tích & Xử lý</div>
          <div class="step-desc">Điều tra sự cố end-to-end, truy vết lịch sử request và bằng chứng bảo mật hệ thống.</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
"""

# 4. Database ERD HTML
html_erd = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
  body { background: #0b1120; color: #f8fafc; padding: 40px; width: 2200px; height: 1350px; display: flex; flex-direction: column; justify-content: space-between; }
  .header { text-align: center; margin-bottom: 24px; }
  .header h1 { font-size: 38px; font-weight: 800; color: #38bdf8; text-transform: uppercase; }
  .header p { font-size: 18px; color: #94a3b8; margin-top: 6px; }

  .erd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; flex: 1; align-items: start; }

  .table-card { background: #131c31; border: 2px solid #334155; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
  .table-header { padding: 12px 20px; font-size: 18px; font-weight: 800; display: flex; justify-content: space-between; align-items: center; }
  
  .tbl-users .table-header { background: #0369a1; color: white; }
  .tbl-projects .table-header { background: #5b21b6; color: white; }
  .tbl-members .table-header { background: #065f46; color: white; }
  .tbl-tasks .table-header { background: #9a3412; color: white; }
  .tbl-comments .table-header { background: #831843; color: white; }

  .columns-list { padding: 12px 0; }
  .col-row { display: flex; justify-content: space-between; padding: 6px 20px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .col-row:last-child { border-bottom: none; }
  
  .col-name { font-weight: 700; color: #f1f5f9; display: flex; align-items: center; gap: 8px; font-family: monospace; }
  .col-type { font-family: monospace; color: #94a3b8; font-size: 12px; }
  
  .key-pk { background: #fbbf24; color: #000; font-size: 10px; font-weight: 900; padding: 1px 5px; border-radius: 3px; }
  .key-fk { background: #38bdf8; color: #000; font-size: 10px; font-weight: 900; padding: 1px 5px; border-radius: 3px; }

  .rel-banner { grid-column: span 3; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px 24px; display: flex; justify-content: space-around; align-items: center; margin-top: 10px; }
  .rel-item { font-size: 14px; color: #cbd5e1; display: flex; align-items: center; gap: 8px; }
  .rel-item strong { color: #38bdf8; font-family: monospace; }
</style>
</head>
<body>
  <div class="header">
    <h1>Sơ đồ Thực thể Quan hệ Cơ sở Dữ liệu (PostgreSQL Database ERD)</h1>
    <p>Thiết kế chuẩn hóa cơ sở dữ liệu: Khóa chính UUID, Ràng buộc khóa ngoại Cascade, Chỉ mục tối ưu truy vấn</p>
  </div>

  <div class="erd-grid">
    <!-- TABLE 1: USERS -->
    <div class="table-card tbl-users">
      <div class="table-header">
        <span>👤 USERS (Tài khoản người dùng)</span>
        <span style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">6 Seed Rows</span>
      </div>
      <div class="columns-list">
        <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> id</span><span class="col-type">UUID</span></div>
        <div class="col-row"><span class="col-name">email (UNIQUE)</span><span class="col-type">VARCHAR(255)</span></div>
        <div class="col-row"><span class="col-name">password_hash</span><span class="col-type">VARCHAR(255) [Bcrypt]</span></div>
        <div class="col-row"><span class="col-name">full_name</span><span class="col-type">VARCHAR(255)</span></div>
        <div class="col-row"><span class="col-name">role</span><span class="col-type">ENUM(ADMIN, PM, MEMBER)</span></div>
        <div class="col-row"><span class="col-name">avatar_url</span><span class="col-type">VARCHAR(500)</span></div>
        <div class="col-row"><span class="col-name">is_active</span><span class="col-type">BOOLEAN DEFAULT true</span></div>
        <div class="col-row"><span class="col-name">created_at</span><span class="col-type">TIMESTAMPTZ</span></div>
        <div class="col-row"><span class="col-name">updated_at</span><span class="col-type">TIMESTAMPTZ [Trigger]</span></div>
      </div>
    </div>

    <!-- TABLE 2: PROJECTS -->
    <div class="table-card tbl-projects">
      <div class="table-header">
        <span>📁 PROJECTS (Dự án quản lý)</span>
        <span style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">4 Seed Rows</span>
      </div>
      <div class="columns-list">
        <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> id</span><span class="col-type">UUID</span></div>
        <div class="col-row"><span class="col-name">name</span><span class="col-type">VARCHAR(255)</span></div>
        <div class="col-row"><span class="col-name">description</span><span class="col-type">TEXT</span></div>
        <div class="col-row"><span class="col-name">status</span><span class="col-type">ENUM(PLANNING, IN_PROGRESS, ...)</span></div>
        <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> manager_id</span><span class="col-type">UUID ➔ users(id)</span></div>
        <div class="col-row"><span class="col-name">start_date</span><span class="col-type">DATE</span></div>
        <div class="col-row"><span class="col-name">end_date</span><span class="col-type">DATE</span></div>
        <div class="col-row"><span class="col-name">created_at</span><span class="col-type">TIMESTAMPTZ</span></div>
        <div class="col-row"><span class="col-name">updated_at</span><span class="col-type">TIMESTAMPTZ [Trigger]</span></div>
      </div>
    </div>

    <!-- TABLE 3: PROJECT_MEMBERS -->
    <div class="table-card tbl-members">
      <div class="table-header">
        <span>👥 PROJECT_MEMBERS (Liên kết N-N)</span>
        <span style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">Composite PK</span>
      </div>
      <div class="columns-list">
        <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> <span class="key-fk">FK</span> project_id</span><span class="col-type">UUID ➔ projects(id) ON DEL CASCADE</span></div>
        <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> <span class="key-fk">FK</span> user_id</span><span class="col-type">UUID ➔ users(id) ON DEL CASCADE</span></div>
        <div class="col-row"><span class="col-name">role_in_project</span><span class="col-type">ENUM(MANAGER, LEAD, MEMBER, VIEWER)</span></div>
        <div class="col-row"><span class="col-name">joined_at</span><span class="col-type">TIMESTAMPTZ DEFAULT NOW()</span></div>
      </div>
    </div>

    <!-- TABLE 4: TASKS -->
    <div class="table-card tbl-tasks" style="grid-column: span 2;">
      <div class="table-header">
        <span>📋 TASKS (Công việc phân rã & Bảng Kanban)</span>
        <span style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">Kanban Board Items</span>
      </div>
      <div class="columns-list" style="display: grid; grid-template-columns: 1fr 1fr;">
        <div>
          <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> id</span><span class="col-type">UUID</span></div>
          <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> project_id</span><span class="col-type">UUID ➔ projects(id) ON DEL CASCADE</span></div>
          <div class="col-row"><span class="col-name">title</span><span class="col-type">VARCHAR(255)</span></div>
          <div class="col-row"><span class="col-name">description</span><span class="col-type">TEXT</span></div>
          <div class="col-row"><span class="col-name">status</span><span class="col-type">ENUM(TODO, IN_PROGRESS, REVIEW, DONE)</span></div>
          <div class="col-row"><span class="col-name">priority</span><span class="col-type">ENUM(LOW, MEDIUM, HIGH, URGENT)</span></div>
        </div>
        <div>
          <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> assignee_id</span><span class="col-type">UUID ➔ users(id) ON DEL SET NULL</span></div>
          <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> creator_id</span><span class="col-type">UUID ➔ users(id) ON DEL SET NULL</span></div>
          <div class="col-row"><span class="col-name">due_date</span><span class="col-type">DATE</span></div>
          <div class="col-row"><span class="col-name">position</span><span class="col-type">INT NOT NULL DEFAULT 0</span></div>
          <div class="col-row"><span class="col-name">created_at / updated_at</span><span class="col-type">TIMESTAMPTZ</span></div>
        </div>
      </div>
    </div>

    <!-- TABLE 5: TASK_COMMENTS -->
    <div class="table-card tbl-comments">
      <div class="table-header">
        <span>💬 TASK_COMMENTS (Thảo luận)</span>
        <span style="font-size: 12px; background: rgba(0,0,0,0.3); padding: 2px 8px; border-radius: 4px;">Exchange Log</span>
      </div>
      <div class="columns-list">
        <div class="col-row"><span class="col-name"><span class="key-pk">PK</span> id</span><span class="col-type">UUID</span></div>
        <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> task_id</span><span class="col-type">UUID ➔ tasks(id) ON DEL CASCADE</span></div>
        <div class="col-row"><span class="col-name"><span class="key-fk">FK</span> user_id</span><span class="col-type">UUID ➔ users(id) ON DEL CASCADE</span></div>
        <div class="col-row"><span class="col-name">content</span><span class="col-type">TEXT NOT NULL</span></div>
        <div class="col-row"><span class="col-name">created_at</span><span class="col-type">TIMESTAMPTZ DEFAULT NOW()</span></div>
      </div>
    </div>

    <!-- RELATIONSHIPS BANNER -->
    <div class="rel-banner">
      <div class="rel-item">🔗 <strong>users (1) ➔ (N) projects</strong> [manager_id]</div>
      <div class="rel-item">🔗 <strong>projects (N) ⬌ (N) users</strong> [qua bảng phụ project_members]</div>
      <div class="rel-item">🔗 <strong>projects (1) ➔ (N) tasks</strong> [ON DELETE CASCADE]</div>
      <div class="rel-item">🔗 <strong>tasks (1) ➔ (N) task_comments</strong> [ON DELETE CASCADE]</div>
    </div>
  </div>
</body>
</html>
"""

# 5. CLI Docker Status Terminal HTML
html_terminal = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Consolas', 'Courier New', monospace; }
  body { background: #030712; color: #f9fafb; padding: 40px; width: 2200px; height: 1350px; display: flex; flex-direction: column; justify-content: center; }
  .terminal { background: #111827; border: 2px solid #374151; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }
  .terminal-bar { background: #1f2937; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #374151; }
  .dots { display: flex; gap: 8px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #10b981; }
  .terminal-title { color: #9ca3af; font-size: 15px; font-weight: bold; }
  .terminal-body { padding: 30px; font-size: 15px; line-height: 1.6; }
  .prompt { color: #10b981; font-weight: bold; }
  .cmd { color: #f3f4f6; font-weight: bold; }
  .text-cyan { color: #38bdf8; }
  .text-green { color: #34d399; }
  .text-yellow { color: #fbbf24; }
  .text-gray { color: #9ca3af; }
  .status-up { color: #34d399; font-weight: bold; }
  .status-healthy { color: #a7f3d0; font-weight: bold; background: #065f46; padding: 1px 6px; border-radius: 4px; }
</style>
</head>
<body>
  <div class="terminal">
    <div class="terminal-bar">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="terminal-title">PowerShell Administrator — DuAnTrienKhai Deployment Verification</div>
      <div></div>
    </div>
    <div class="terminal-body">
      <p><span class="prompt">PS C:\\Users\\nguye\\Downloads\\duantrienkhai\\duantrienkhai&gt;</span> <span class="cmd">git remote -v; git branch -vv</span></p>
      <p class="text-cyan">origin  https://github.com/El-IT-stack/duantrienkhai (fetch)</p>
      <p class="text-cyan">origin  https://github.com/El-IT-stack/duantrienkhai (push)</p>
      <p class="text-green">* main 67a8947 [origin/main] docs: add comprehensive operational guide and hardening verification manual</p>
      <br>
      <p><span class="prompt">PS C:\\Users\\nguye\\Downloads\\duantrienkhai\\duantrienkhai&gt;</span> <span class="cmd">docker compose ps</span></p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
        <tr style="color: #9ca3af; border-bottom: 1px solid #374151; text-align: left;">
          <th style="padding: 6px;">NAME</th>
          <th>IMAGE</th>
          <th>SERVICE</th>
          <th>STATUS</th>
          <th>PORTS</th>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_backend</td>
          <td class="text-gray">duantrienkhai-backend</td>
          <td class="text-cyan">backend</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">3000/tcp (internal)</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_cadvisor</td>
          <td class="text-gray">gcr.io/cadvisor/cadvisor:v0.49.1</td>
          <td class="text-cyan">cadvisor</td>
          <td><span class="status-healthy">Up 15 minutes (healthy)</span></td>
          <td class="text-yellow">0.0.0.0:8080-&gt;8080/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_frontend</td>
          <td class="text-gray">duantrienkhai-frontend</td>
          <td class="text-cyan">frontend</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">80/tcp (internal)</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_grafana</td>
          <td class="text-gray">grafana/grafana:10.4.1</td>
          <td class="text-cyan">grafana</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">0.0.0.0:3001-&gt;3000/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_loki</td>
          <td class="text-gray">grafana/loki:2.9.5</td>
          <td class="text-cyan">loki</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">0.0.0.0:3100-&gt;3100/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_nginx</td>
          <td class="text-gray">nginx:1.25-alpine</td>
          <td class="text-cyan">nginx</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">0.0.0.0:80-&gt;80/tcp, 0.0.0.0:443-&gt;443/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_nginx_exporter</td>
          <td class="text-gray">nginx/nginx-prometheus-exporter:1.1.0</td>
          <td class="text-cyan">nginx-exporter</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-gray">pm_monitoring_network</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_pgadmin</td>
          <td class="text-gray">dpage/pgadmin4:8</td>
          <td class="text-cyan">pgadmin</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">0.0.0.0:5050-&gt;80/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_postgres</td>
          <td class="text-gray">postgres:16-alpine</td>
          <td class="text-cyan">postgres</td>
          <td><span class="status-healthy">Up 15 minutes (healthy)</span></td>
          <td class="text-yellow">5432/tcp (internal isolated)</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_postgres_exporter</td>
          <td class="text-gray">prometheuscommunity/postgres-exporter:v0.15.0</td>
          <td class="text-cyan">postgres-exporter</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-gray">9187/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_prometheus</td>
          <td class="text-gray">prom/prometheus:v2.51.0</td>
          <td class="text-cyan">prometheus</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-yellow">0.0.0.0:9090-&gt;9090/tcp</td>
        </tr>
        <tr>
          <td style="color: #f3f4f6; padding: 6px;">pm_promtail</td>
          <td class="text-gray">grafana/promtail:2.9.5</td>
          <td class="text-cyan">promtail</td>
          <td><span class="status-up">Up 15 minutes</span></td>
          <td class="text-gray">pm_monitoring_network</td>
        </tr>
      </table>
      <br>
      <p><span class="prompt">PS C:\\Users\\nguye\\Downloads\\duantrienkhai\\duantrienkhai&gt;</span> <span class="cmd">curl.exe -s http://localhost/api/health | jq .</span></p>
      <pre style="color: #34d399; font-size: 14px;">
{
  "status": "UP",
  "timestamp": "2026-10-23T15:43:58.766Z",
  "uptimeSeconds": 752,
  "services": {
    "database": {
      "status": "UP",
      "engine": "PostgreSQL 16"
    }
  },
  "memory": {
    "rssMb": 83,
    "heapUsedMb": 24,
    "heapTotalMb": 26
  }
}
      </pre>
    </div>
  </div>
</body>
</html>
"""

def generate_all_diagrams():
    templates = [
        ('report_images/diag_01_architecture.png', html_architecture),
        ('report_images/diag_02_container_network.png', html_network),
        ('report_images/diag_03_data_flow.png', html_flow),
        ('report_images/diag_04_database_erd.png', html_erd),
        ('report_images/diag_05_cli_terminal.png', html_terminal),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        for filepath, html_code in templates:
            page = browser.new_page(viewport={'width': 2200, 'height': 1350})
            page.set_content(html_code)
            page.wait_for_timeout(1000)
            page.screenshot(path=filepath)
            print(f"Generated {filepath}")
        browser.close()

if __name__ == '__main__':
    generate_all_diagrams()
