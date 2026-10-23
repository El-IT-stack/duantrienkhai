-- ==============================================================================
-- HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT) - DATABASE INITIALIZATION
-- Database Engine: PostgreSQL 16
-- Mục đích: Khởi tạo cấu trúc bảng, ràng buộc, chỉ mục và dữ liệu mẫu (Seed Data)
-- ==============================================================================

-- Bật extension tạo UUID và pgcrypto nếu cần
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TẠO CÁC BẢNG DỮ LIỆU CHÍNH (TABLES)
-- ==============================================================================

-- 1.1. Bảng USERS: Quản lý người dùng, phân quyền RBAC
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'PROJECT_MANAGER', 'MEMBER')),
    avatar_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.2. Bảng PROJECTS: Quản lý thông tin dự án
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.3. Bảng PROJECT_MEMBERS: Quan hệ nhiều-nhiều (N-N) giữa Dự án và Thành viên
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_in_project VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role_in_project IN ('MANAGER', 'LEAD', 'MEMBER', 'VIEWER')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);

-- 1.4. Bảng TASKS: Quản lý công việc thuộc từng dự án (Kanban, Deadline, Priority)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1.5. Bảng TASK_COMMENTS: Bình luận và trao đổi trong từng công việc
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. TẠO CÁC CHỈ MỤC (INDEXES) ĐỂ TỐI ƯU HIỆU NĂNG TRUY VẤN
-- ==============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_task_comments_task ON task_comments(task_id);

-- ==============================================================================
-- 3. TRIGGER TỰ ĐỘNG CẬP NHẬT TRƯỜNG UPDATED_AT
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_projects
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tasks
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ==============================================================================
-- 4. DỮ LIỆU MẪU (SEED DATA)
-- Mật khẩu mặc định cho toàn bộ tài khoản mẫu: Admin@123
-- Hash Bcrypt chuẩn 10 vòng: $2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO
-- ==============================================================================

-- 4.1. Thêm Người dùng mẫu (Admin, PMs, Members)
INSERT INTO users (id, email, password_hash, full_name, role, avatar_url, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Nguyễn Quản Trị (Admin)', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', true),
('22222222-2222-2222-2222-222222222222', 'pm.minh@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Trần Quang Minh (PM Lead)', 'PROJECT_MANAGER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh', true),
('33333333-3333-3333-3333-333333333333', 'pm.huong@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Lê Thị Thu Hương (PM Senior)', 'PROJECT_MANAGER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huong', true),
('44444444-4444-4444-4444-444444444444', 'dev.tuan@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Phạm Anh Tuấn (Backend Dev)', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan', true),
('55555555-5555-5555-5555-555555555555', 'dev.linh@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Hoàng Thùy Linh (Frontend Dev)', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh', true),
('66666666-6666-6666-6666-666666666666', 'qa.nam@pm.local', '$2b$10$Z0j7JJFlw2RdfTDoq/U2g.rzKqABNMx0STAZi86AMyc86X4BtXaGO', 'Đỗ Hải Nam (QA/Tester)', 'MEMBER', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nam', true);

-- 4.2. Thêm Dự án mẫu (Các trạng thái khác nhau)
INSERT INTO projects (id, name, description, status, manager_id, start_date, end_date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hệ thống Quản lý Khách sạn Cloud (PMS)', 'Giải pháp số hóa toàn diện quản lý phòng, đặt phòng online và tự động hóa hóa đơn VAT điện tử.', 'IN_PROGRESS', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '45 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Cổng Thanh toán Trực tuyến Đa kênh', 'Hệ thống kết nối API cổng thanh toán ngân hàng, Napas, ví điện tử MoMo, ZaloPay với độ trễ thấp.', 'PLANNING', '33333333-3333-3333-3333-333333333333', CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ứng dụng Di động E-Commerce Tiện ích', 'App mua sắm trực tuyến hỗ trợ livestream bán hàng, cá nhân hóa gợi ý sản phẩm bằng AI.', 'COMPLETED', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE - INTERVAL '10 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hạ tầng Microservices & DevOps Monitoring', 'Thiết lập cụm Kubernetes, tích hợp Prometheus, Grafana, Loki và chuẩn hóa quy trình CI/CD.', 'IN_PROGRESS', '33333333-3333-3333-3333-333333333333', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days');

-- 4.3. Gán Thành viên vào Dự án (Project Members)
INSERT INTO project_members (project_id, user_id, role_in_project) VALUES
-- Dự án Khách sạn (Project A)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'MANAGER'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'LEAD'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'MEMBER'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'MEMBER'),
-- Dự án Cổng thanh toán (Project B)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'MANAGER'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'MEMBER'),
-- Dự án DevOps (Project D)
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'MANAGER'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'LEAD'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'MEMBER');

-- 4.4. Thêm Công việc mẫu (Tasks - Đầy đủ 4 cột Kanban + Quá hạn + Độ ưu tiên)
INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, creator_id, due_date, position) VALUES
-- Cột TODO
('71111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Thiết kế schema dữ liệu Đặt phòng & Báo cáo', 'Định nghĩa chi tiết các thực thể Booking, Room, RoomType và PriceRate trong PostgreSQL.', 'TODO', 'HIGH', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '5 days', 0),
('72222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Xây dựng UI Bộ lọc trạng thái phòng Realtime', 'Thiết kế giao diện sơ đồ phòng với màu sắc trực quan (Trống, Đang ở, Cần dọn dẹp).', 'TODO', 'MEDIUM', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '8 days', 1),

-- Cột IN_PROGRESS
('73333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lập trình REST API xác thực JWT & Phân quyền', 'Viết các Guards, Strategies trong NestJS để phân quyền Admin, PM và Staff.', 'IN_PROGRESS', 'URGENT', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '2 days', 0),
('74444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tích hợp Frontend React với Tailwind CSS', 'Dựng bố cục Layout Dashboard, Navbar điều hướng và Sidebar co giãn responsive.', 'IN_PROGRESS', 'HIGH', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', CURRENT_DATE + INTERVAL '3 days', 1),

-- Cột REVIEW
('75555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kiểm thử tải hiệu năng API với k6 / Jmeter', 'Chạy kịch bản 1000 VU đồng thời gửi request tra cứu phòng để đo response time.', 'REVIEW', 'MEDIUM', '66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', CURRENT_DATE + INTERVAL '1 days', 0),

-- Cột DONE
('76666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Khảo sát và đặc tả yêu cầu nghiệp vụ phần mềm', 'Hoàn thành tài liệu SRS và nhận biên bản bàn giao thống nhất yêu cầu với các bên.', 'DONE', 'LOW', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '10 days', 0),
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cài đặt cụm Docker Compose môi trường Dev', 'Cấu hình hoàn thiện PostgreSQL 16, pgAdmin 4 và mạng bridge nội bộ.', 'DONE', 'HIGH', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '7 days', 1),

-- Task QUÁ HẠN (Overdue task để Dashboard thể hiện rõ tính năng cảnh báo)
('78888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '[CẢNH BÁO] Kiểm toán an toàn dữ liệu khách hàng', 'Rà soát các lỗ hổng OWASP Top 10 và kiểm tra mã hóa mật khẩu người dùng.', 'TODO', 'URGENT', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '3 days', 2);

-- 4.5. Thêm Bình luận mẫu (Task Comments)
INSERT INTO task_comments (task_id, user_id, content) VALUES
('73333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Chú ý cấu hình thời gian hết hạn Access Token và Refresh Token hợp lý nhé Tuấn.'),
('73333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Dạ anh Minh, em đã cấu hình JWT expiration qua biến môi trường .env đầy đủ rồi ạ.'),
('75555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'Em đã chạy test tải với 500 CCU, độ trễ trung bình đạt 45ms rất tốt!'),
('78888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', 'Công việc này đã trễ hạn 3 ngày, Nam ưu tiên xử lý gấp trong ngày mai nhé!');
