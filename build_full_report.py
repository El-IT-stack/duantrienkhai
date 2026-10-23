import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="D3D3D3", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def build_report():
    doc = docx.Document()

    # 1. Page Setup: Letter / A4
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Base styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(4)

    # ==============================================================================
    # COVER PAGE
    # ==============================================================================
    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_univ.paragraph_format.space_after = Pt(2)
    r1 = p_univ.add_run("TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG\nĐẠI HỌC THÁI NGUYÊN\n")
    r1.bold = True
    r1.font.size = Pt(14)
    r1.font.color.rgb = RGBColor(0x0F, 0x2A, 0x4A)
    r2 = p_univ.add_run("KHOA CÔNG NGHỆ THÔNG TIN")
    r2.bold = True
    r2.font.size = Pt(13)
    r2.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    # Logo
    if os.path.exists('extracted_imgs/image1.jpeg'):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(14)
        p_logo.paragraph_format.space_after = Pt(14)
        p_logo.add_run().add_picture('extracted_imgs/image1.jpeg', width=Inches(1.8))

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(6)
    rt = p_title.add_run("BÁO CÁO BÀI TẬP LỚN / ĐỒ ÁN\nTRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG PHẦN MỀM")
    rt.bold = True
    rt.font.size = Pt(18)
    rt.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)

    p_subject = doc.add_paragraph()
    p_subject.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subject.paragraph_format.space_after = Pt(20)
    rs = p_subject.add_run("ĐỀ TÀI: XÂY DỰNG, TRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG\nQUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT SYSTEM)")
    rs.bold = True
    rs.font.size = Pt(15)
    rs.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Info box
    p_box = doc.add_paragraph()
    p_box.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_box.paragraph_format.space_before = Pt(15)
    p_box.paragraph_format.space_after = Pt(25)
    r_info = p_box.add_run(
        "KHO LƯU TRỮ MÃ NGUỒN (GITHUB REPOSITORY):\n"
        "https://github.com/El-IT-stack/duantrienkhai\n"
        "Nhánh kiểm thử: main | Phiên bản Commit: 67a8947\n"
        "Môi trường triển khai: Docker Compose v2 (12 Containers) | Hệ điều hành: Windows / Linux"
    )
    r_info.font.size = Pt(11)
    r_info.bold = True
    r_info.font.color.rgb = RGBColor(0x03, 0x69, 0xA1)

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(40)
    rd = p_date.add_run("THÁI NGUYÊN, 2026")
    rd.bold = True
    rd.font.size = Pt(13)
    rd.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    doc.add_page_break()

    # ==============================================================================
    # HELPER FUNCTIONS FOR HEADINGS, PARAGRAPHS, TABLES, IMAGES
    # ==============================================================================
    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(13)
        run.font.color.rgb = RGBColor(0x0F, 0x76, 0x6E)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        return p

    def add_p(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.25
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.bold = True
        p.add_run(text)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.2
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.bold = True
        p.add_run(text)
        return p

    def add_image_figure(img_path, caption, width_in=6.4):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.add_run().add_picture(img_path, width=Inches(width_in))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(12)
            rc = p_cap.add_run(caption)
            rc.font.size = Pt(10.5)
            rc.font.italic = True
            rc.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
            rc.bold = True

    def create_custom_table(headers, rows_data, col_widths=None):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False
        set_table_borders(table, color="CBD5E1", sz="4", val="single")

        # Header Row
        hdr_cells = table.rows[0].cells
        for i, h in enumerate(headers):
            hdr_cells[i].text = h
            set_cell_background(hdr_cells[i], "1E3A8A")
            set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.bold = True
                r.font.size = Pt(10.5)
                r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        # Body Rows
        for r_idx, r_data in enumerate(rows_data):
            row_cells = table.rows[r_idx + 1].cells
            bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(r_data):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], bg_color)
                set_cell_margins(row_cells[c_idx], top=90, bottom=90, left=130, right=130)
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for r in p.runs:
                    r.font.size = Pt(10)
                    r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

        # Column Widths
        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==============================================================================
    # MỤC LỤC TỔNG QUAN
    # ==============================================================================
    add_h1("MỤC LỤC TỔNG QUAN BÁO CÁO")
    toc_items = [
        "1. GIỚI THIỆU VÀ MỤC TIÊU TRIỂN KHAI ĐỀ TÀI",
        "2. PHẠM VI CHỨC NĂNG VÀ LUỒNG NGHIỆP VỤ HỆ THỐNG",
        "3. KIẾN TRÚC TỔNG THỂ VÀ MÔ HÌNH KẾT NỐI CONTAINER",
        "4. CẤU TRÚC MÃ NGUỒN, CÔNG NGHỆ VÀ QUẢN TRỊ PHIÊN BẢN (GIT)",
        "5. THIẾT KẾ VÀ TRIỂN KHAI CƠ SỞ DỮ LIỆU POSTGRESQL",
        "6. XÂY DỰNG BACKEND NESTJS VÀ TÀI LIỆU ĐẶC TẢ REST API",
        "7. XÂY DỰNG FRONTEND REACT VÀ GIAO DIỆN NGƯỜI DÙNG",
        "8. ĐIỀU PHỐI TRIỂN KHAI HỆ THỐNG VỚI DOCKER COMPOSE",
        "9. CẤU HÌNH NGINX REVERSE PROXY VÀ GIA CỐ BẢO MẬT HỆ THỐNG",
        "10. HỆ THỐNG GIÁM SÁT CHỈ SỐ HIỆU NĂNG VỚI PROMETHEUS VÀ CADVISOR",
        "11. THU THẬP VÀ PHÂN TÍCH LOG TẬP TRUNG VỚI LOKI VÀ PROMTAIL",
        "12. TRỰC QUAN HÓA DỮ LIỆU TRÊN GRAFANA DASHBOARD",
        "13. QUẢN TRỊ CƠ SỞ DỮ LIỆU TRỰC QUAN QUA PGADMIN 4",
        "14. KẾT QUẢ KIỂM THỬ THỰC TẾ VÀ ĐỐI CHIẾU TIÊU CHÍ VẬN HÀNH",
        "15. ĐÁNH GIÁ AN TOÀN BẢO MẬT VÀ ĐỀ XUẤT CẢI TIẾN NÂNG CẤP",
        "16. KẾT LUẬN VÀ PHỤ LỤC LỆNH QUẢN TRỊ VẬN HÀNH"
    ]
    for item in toc_items:
        add_bullet(item)

    doc.add_page_break()

    # ==============================================================================
    # CHƯƠNG 1
    # ==============================================================================
    add_h1("1. GIỚI THIỆU VÀ MỤC TIÊU TRIỂN KHAI ĐỀ TÀI")
    add_h2("1.1. Bối cảnh đề tài")
    add_p(
        "Trong các tổ chức phát triển phần mềm hiện đại, việc quản lý vòng đời dự án, theo dõi tiến độ công việc theo mô hình Kanban, "
        "giao việc cho thành viên và kiểm soát thời hạn đóng vai trò sống còn đối với năng suất và chất lượng sản phẩm. "
        "Tuy nhiên, nếu chỉ dừng lại ở việc phát triển ứng dụng độc lập trên máy cá nhân mà không xây dựng một quy trình triển khai chuẩn hóa, "
        "hệ thống sẽ gặp rất nhiều rủi ro về xung đột môi trường, rò rỉ dữ liệu, khó mở rộng và thiếu cơ chế theo dõi giám sát khi xảy ra sự cố."
    )
    add_p(
        "Đề tài 'Hệ thống Quản lý Dự án (Project Management System)' được xây dựng nhằm giải quyết toàn diện bài toán từ phát triển full-stack "
        "đến triển khai tự động hóa và quản trị vận hành theo tiêu chuẩn DevOps. Hệ thống kết hợp giao diện Single Page Application (React 18), "
        "dịch vụ REST API hiệu năng cao (NestJS 10), cơ sở dữ liệu quan hệ tối ưu (PostgreSQL 16), reverse proxy bảo mật (Nginx), "
        "và cụm công cụ giám sát chỉ số và log tập trung (Prometheus, Grafana, Loki, Promtail, cAdvisor)."
    )

    add_h2("1.2. Mục tiêu triển khai hệ thống")
    add_bullet(" Đóng gói toàn bộ các dịch vụ phần mềm thành các Docker container độc lập, đồng nhất cấu hình triển khai giữa môi trường dev và production.", "Container hóa chuẩn mực:")
    add_bullet(" Sử dụng Docker Compose điều phối 12 dịch vụ liên kết chặt chẽ qua 3 mạng bridge nội bộ cách ly an toàn.", "Tự động hóa điều phối:")
    add_bullet(" Đặt Nginx 1.25 Alpine làm cổng đón duy nhất (Ingress Gateway), xử lý SSL/TLS, nén Gzip, cân bằng tải và bổ sung các HTTP Security Headers.", "Cổng Reverse Proxy an toàn:")
    add_bullet(" Thiết kế chuẩn hóa 5 bảng quan hệ (users, projects, project_members, tasks, task_comments), khóa chính UUID, chỉ mục tối ưu và volume bền vững.", "Cơ sở dữ liệu an toàn & bền vững:")
    add_bullet(" Thu thập metrics thời gian thực chu kỳ 15s từ tất cả container, hệ điều hành và CSDL; xây dựng dashboard trực quan qua Grafana.", "Giám sát hiệu năng liên tục (Monitoring):")
    add_bullet(" Tập trung hóa toàn bộ luồng log container qua Promtail và Loki, hỗ trợ tìm kiếm nhanh theo nhãn và LogQL.", "Quản lý log tập trung (Centralized Logging):")
    add_bullet(" Tuyệt đối không publish cổng PostgreSQL (5432) ra host ngoài, áp dụng JWT Bearer Token, kiểm soát truy cập theo vai trò (RBAC).", "Gia cố bảo mật tối đa (Hardening):")

    add_h2("1.3. Thông tin kho lưu trữ và quản lý mã nguồn")
    add_p("Toàn bộ mã nguồn, cấu hình Docker, script khởi tạo database và tài liệu vận hành của dự án được lưu trữ và đồng bộ chính thức tại GitHub:")
    add_bullet(" https://github.com/El-IT-stack/duantrienkhai", "Đường dẫn kho lưu trữ (Repository URL):")
    add_bullet(" main (Nhánh chính thức dùng cho triển khai và nghiệm thu)", "Nhánh kiểm thử (Active Branch):")
    add_bullet(" 67a8947 [origin/main] docs: add comprehensive operational guide and hardening verification manual", "Mã Commit kiểm tra:")
    add_bullet(" Đầy đủ 12 dịch vụ, 3 mạng bridge độc lập, volume bền vững postgres_data, provisioning tự động cho Prometheus, Loki, Promtail, Grafana.", "Trạng thái cấu hình Docker:")

    # ==============================================================================
    # CHƯƠNG 2
    # ==============================================================================
    add_h1("2. PHẠM VI CHỨC NĂNG VÀ LUỒNG NGHIỆP VỤ HỆ THỐNG")
    add_h2("2.1. Kiểm soát quyền truy cập theo vai trò (Role-Based Access Control - RBAC)")
    add_p(
        "Hệ thống định nghĩa cơ chế phân quyền RBAC phân cấp rõ ràng trong tầng cơ sở dữ liệu và được bảo vệ bởi Auth Guard "
        "kết hợp Roles Guard trong NestJS:"
    )
    add_bullet(" Toàn quyền quản trị hệ thống, thêm/sửa/xóa người dùng, cấp quyền, cấu hình hệ thống, tạo và phân bổ dự án, theo dõi dashboard tổng quát.", "1. Quản trị viên hệ thống (ADMIN):")
    add_bullet(" Tạo và quản lý các dự án được giao phụ trách, thêm bớt thành viên vào dự án, phân rã công việc (Tasks), gán người thực hiện, đổi trạng thái và deadline.", "2. Quản lý dự án (PROJECT_MANAGER):")
    add_bullet(" Xem danh sách dự án tham gia, cập nhật tiến độ công việc được giao trên bảng Kanban, viết bình luận thảo luận và cập nhật hồ sơ cá nhân.", "3. Thành viên thực hiện (MEMBER):")

    add_h2("2.2. Bảng tổng hợp các phân hệ chức năng")
    headers_fn = ["Phân hệ chức năng", "Mô tả nghiệp vụ", "Công nghệ & Endpoint"]
    rows_fn = [
        ["Xác thực người dùng (Auth)", "Đăng nhập bằng Email/Password, cấp phát JWT Bearer Token thời hạn 7 ngày, kiểm tra mã hóa Bcrypt 10 vòng.", "POST /api/auth/login\nPOST /api/auth/register"],
        ["Trang tổng quan (Dashboard)", "Thống kê tổng số dự án, công việc theo 4 trạng thái Kanban, cảnh báo công việc trễ hạn, tiến độ hoàn thành.", "GET /api/dashboard/stats\nReact Charts & Metric Cards"],
        ["Quản lý dự án (Projects)", "Danh sách dự án, bộ lọc trạng thái (Planning, In Progress, Completed), thêm mới, cập nhật thông tin và ngày kết thúc.", "GET /api/projects\nPOST, PUT, DELETE /api/projects"],
        ["Quản lý công việc (Tasks)", "Bảng Kanban trực quan 4 cột (TODO, IN_PROGRESS, REVIEW, DONE), gán độ ưu tiên (Low, Medium, High, Urgent), deadline.", "GET /api/tasks\nPOST, PATCH /api/tasks/:id"],
        ["Quản lý thành viên (Members)", "Hiển thị danh sách nhân sự tham gia hệ thống, vai trò chức danh, email liên hệ và trạng thái hoạt động.", "GET /api/users\nGET /api/projects/:id/members"],
        ["Hồ sơ cá nhân (Profile)", "Xem thông tin tài khoản hiện tại, vai trò trong tổ chức, avatar trực quan qua DiceBear API.", "GET /api/auth/profile\nReact User Context"],
        ["Kiểm tra trạng thái (Health Check)", "Kiểm tra tình trạng sống của container và kết nối CSDL PostgreSQL theo thời gian thực.", "GET /health (Nginx)\nGET /api/health (NestJS/DB)"],
        ["Thu thập chỉ số (Prometheus Metrics)", "Xuất metrics định dạng Prometheus: HTTP request rate, response latency, CPU, Heap memory, DB queries.", "GET /api/metrics\nProm-client NestJS"],
        ["Tài liệu đặc tả API (Swagger)", "Giao diện OpenAPI UI cho phép lập trình viên và kiểm thử viên tra cứu schema và gọi thử nghiệm API.", "GET /api/docs\nSwagger UI 5.x"],
        ["Quản trị Web CSDL (pgAdmin)", "Giao diện quản trị PostgreSQL trên trình duyệt, duyệt bảng, chạy truy vấn SQL, backup dữ liệu.", "Cổng Host: 5050\npgAdmin 4 v8"]
    ]
    create_custom_table(headers_fn, rows_fn, [1.8, 3.2, 1.8])

    # ==============================================================================
    # CHƯƠNG 3
    # ==============================================================================
    add_h1("3. KIẾN TRÚC TỔNG THỂ VÀ MÔ HÌNH KẾT NỐI CONTAINER")
    add_h2("3.1. Sơ đồ kiến trúc phân tầng tổng thể (Multi-Tier Architecture)")
    add_p(
        "Hệ thống được thiết kế theo mô hình kiến trúc phân tầng chuyên biệt, đảm bảo tính mô-đun hóa, khả năng chịu tải và bảo mật nhiều lớp. "
        "Mỗi tầng đảm nhiệm một vai trò rõ ràng từ giao diện người dùng đến tầng lưu trữ dữ liệu và giám sát vận hành:"
    )
    add_image_figure(
        'report_images/diag_01_architecture.png',
        'Hình 1. Sơ đồ kiến trúc phân tầng tổng thể hệ thống Quản lý Dự án (Multi-Tier Architecture)',
        6.5
    )

    add_h2("3.2. Mô hình kết nối và phân chia mạng Container (Network Topology)")
    add_p(
        "Nhằm tuân thủ nguyên tắc 'Zero Trust' và cách ly bề mặt tấn công mạng, Docker Compose cấu hình 3 mạng bridge độc lập. "
        "Việc phân chia mạng giúp kiểm soát lưu lượng giữa các container một cách chặt chẽ:"
    )
    add_image_figure(
        'report_images/diag_02_container_network.png',
        'Hình 2. Mô hình kết nối và phân chia 3 mạng container Docker (Network Topology & Isolation)',
        6.5
    )
    add_bullet(" Mạng công cộng tiếp nhận lưu lượng từ trình duyệt của người dùng và các cổng quản trị viên được phép truy cập (Nginx, pgAdmin, Grafana, Prometheus, cAdvisor, Loki).", "1. pm_public_network (Public Ingress):")
    add_bullet(" Mạng nội bộ riêng biệt hoàn toàn. Chỉ các service backend, frontend, postgres, postgres_exporter được kết nối. PostgreSQL tuyệt đối KHÔNG có port mapping ra máy host.", "2. pm_internal_network (Private Isolated):")
    add_bullet(" Mạng chuyên dụng để Prometheus thực hiện kéo (scrape) metrics định kỳ và Promtail vận chuyển log về Loki mà không làm nghẽn mạng nghiệp vụ.", "3. pm_monitoring_network (Dedicated Monitoring):")

    add_h2("3.3. Sơ đồ luồng dữ liệu nghiệp vụ và giám sát (Pipeline Flows)")
    add_p("Trong quá trình vận hành, hệ thống có 3 luồng dữ liệu chính vận hành song song và độc lập với nhau:")
    add_image_figure(
        'report_images/diag_03_data_flow.png',
        'Hình 3. Sơ đồ luồng dữ liệu nghiệp vụ, luồng metrics và luồng log tập trung (Data & Observability Pipeline)',
        6.5
    )
    add_bullet(" Người dùng gửi request -> Nginx xử lý SSL & định tuyến -> Frontend hiển thị hoặc Backend xử lý JWT/Nghiệp vụ -> PostgreSQL thực thi CRUD -> Phản hồi dữ liệu JSON.", "Luồng 1 (Xanh dương) - Nghiệp vụ Người dùng:")
    add_bullet(" cAdvisor, Backend, Nginx Exporter, Postgres Exporter thu thập chỉ số -> Prometheus scrape mỗi 15s lưu vào TSDB -> Grafana hiển thị biểu đồ thời gian thực.", "Luồng 2 (Cam) - Thu thập Chỉ số Giám sát:")
    add_bullet(" Mọi container xuất log ra Docker socket -> Promtail gắn nhãn và chuyển tiếp -> Loki nén và lưu trữ -> Kỹ sư DevOps điều tra qua Grafana Explore bằng LogQL.", "Luồng 3 (Hồng) - Thu thập Log Tập trung:")

    # ==============================================================================
    # CHƯƠNG 4
    # ==============================================================================
    add_h1("4. CẤU TRÚC MÃ NGUỒN, CÔNG NGHỆ VÀ QUẢN TRỊ PHIÊN BẢN (GIT)")
    add_h2("4.1. Ngăn xếp công nghệ sử dụng trong dự án")
    headers_tech = ["Thành phần", "Công nghệ chính", "Phiên bản", "Vai trò và chức năng"]
    rows_tech = [
        ["Frontend", "React, TypeScript, Vite, Tailwind CSS", "18.x / 5.x", "Xây dựng Single Page Application, Kanban UI, biểu đồ thống kê"],
        ["Backend", "NestJS, Express, TypeScript, TypeORM", "10.x", "Cung cấp REST API, xác thực JWT, RBAC, Validation DTO, Metrics"],
        ["Database", "PostgreSQL Alpine, UUID, pgcrypto", "16.x", "Lưu trữ dữ liệu quan hệ, transaction toàn vẹn, index tối ưu truy vấn"],
        ["Web Gateway", "Nginx Alpine, OpenSSL, Gzip, ModSecurity", "1.25-alpine", "Reverse Proxy, cân bằng tải, SSL Termination, bảo vệ HTTP headers"],
        ["Metrics", "Prometheus TSDB, Google cAdvisor", "v2.51 / v0.49", "Thu thập chỉ số thời gian thực, giám sát CPU, RAM, Network I/O"],
        ["Exporters", "Nginx Exporter, Postgres Exporter", "1.1.0 / 0.15.0", "Trích xuất metrics chuyên sâu từ Nginx stub_status và PostgreSQL stats"],
        ["Logging", "Grafana Loki, Grafana Promtail", "v2.9.5", "Thu thập toàn bộ log container Docker và lưu trữ tập trung dung lượng nhẹ"],
        ["Dashboard", "Grafana Open Source", "v10.4.1", "Trực quan hóa đồ thị metrics, phân tích log tập trung qua LogQL"],
        ["DB Admin", "pgAdmin 4 Web GUI", "v8.x", "Giao diện đồ họa quản trị CSDL, chạy query và kiểm tra cấu trúc bảng"]
    ]
    create_custom_table(headers_tech, rows_tech, [1.1, 2.1, 1.0, 2.6])

    add_h2("4.2. Bằng chứng quản trị phiên bản Git và Trạng thái Docker")
    add_p(
        "Mã nguồn được quản lý bằng Git với lịch sử commit rõ ràng, tách bạch các phiên bản tài liệu và cấu hình triển khai. "
        "Dưới đây là bằng chứng thực tế khi thực thi lệnh kiểm tra trạng thái remote Git và 12 container Docker Compose đang hoạt động:"
    )
    add_image_figure(
        'report_images/diag_05_cli_terminal.png',
        'Hình 4. Bằng chứng kiểm tra trạng thái 12 container Docker Compose và Git Remote trên Terminal',
        6.5
    )

    # ==============================================================================
    # CHƯƠNG 5
    # ==============================================================================
    add_h1("5. THIẾT KẾ VÀ TRIỂN KHAI CƠ SỞ DỮ LIỆU POSTGRESQL")
    add_h2("5.1. Sơ đồ thực thể quan hệ cơ sở dữ liệu (Database ERD)")
    add_p(
        "Cơ sở dữ liệu của hệ thống được xây dựng trên nền tảng PostgreSQL 16 Alpine, tuân thủ chặt chẽ dạng chuẩn 3NF. "
        "Toàn bộ các bảng sử dụng khóa chính dạng UUID v4 tự sinh qua extension `uuid-ossp` hoặc hàm chuẩn `gen_random_uuid()` "
        "nhằm đảm bảo tính an toàn, không thể suy đoán ID và hỗ trợ phân tán dữ liệu trong tương lai:"
    )
    add_image_figure(
        'report_images/diag_04_database_erd.png',
        'Hình 5. Sơ đồ thực thể quan hệ cơ sở dữ liệu PostgreSQL (Database ERD)',
        6.5
    )

    add_h2("5.2. Chi tiết cấu trúc các bảng dữ liệu cốt lõi")
    add_bullet(" Chứa thông tin tài khoản người dùng, email duy nhất (UNIQUE), mật khẩu băm Bcrypt, họ tên, vai trò (ADMIN, PROJECT_MANAGER, MEMBER) và trạng thái kích hoạt (is_active).", "1. Bảng users:")
    add_bullet(" Chứa thông tin các dự án quản lý, tên dự án, mô tả chi tiết, trạng thái dự án (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD), khóa ngoại manager_id liên kết với users(id), ngày bắt đầu và kết thúc.", "2. Bảng projects:")
    add_bullet(" Bảng liên kết quan hệ nhiều-nhiều (N-N) giữa dự án và người dùng. Chứa vai trò thành viên trong từng dự án cụ thể (MANAGER, LEAD, MEMBER, VIEWER) và ngày gia nhập.", "3. Bảng project_members:")
    add_bullet(" Chứa danh sách các công việc phân rã thuộc từng dự án. Khóa ngoại project_id với ràng buộc ON DELETE CASCADE, trạng thái Kanban (TODO, IN_PROGRESS, REVIEW, DONE), độ ưu tiên (LOW, MEDIUM, HIGH, URGENT), người được giao (assignee_id), hạn chót (due_date) và thứ tự hiển thị (position).", "4. Bảng tasks:")
    add_bullet(" Chứa các phản hồi, trao đổi và bình luận của thành viên trong từng công việc, có khóa ngoại liên kết tới task_id và user_id với cascade delete an toàn.", "5. Bảng task_comments:")

    add_h2("5.3. Chỉ mục tối ưu (Indexes) và Trigger tự động hóa")
    add_p("Hệ thống thiết lập 10 chỉ mục B-tree để tăng tốc độ truy vấn đối với các trường thường xuyên được lọc hoặc sắp xếp:")
    add_bullet(" idx_users_email (đăng nhập tốc độ O(1)), idx_users_role (lọc theo vai trò).")
    add_bullet(" idx_projects_manager, idx_projects_status (lọc dự án theo quản lý và tiến độ).")
    add_bullet(" idx_tasks_project, idx_tasks_status, idx_tasks_assignee, idx_tasks_due_date (kết xuất bảng Kanban và lọc task quá hạn dưới 5ms).")
    add_bullet(" Trigger `trigger_set_timestamp()` tự động cập nhật trường `updated_at = NOW()` trước mỗi thao tác UPDATE trên bảng users, projects, tasks.")

    add_h2("5.4. Tính bền vững của dữ liệu và Chiến lược Backup/Restore")
    add_p(
        "Dữ liệu được lưu trữ trong Docker Named Volume `postgres_data`, hoàn toàn độc lập với vòng đời của container. "
        "Khi khởi động lại, nâng cấp image hoặc build lại container, dữ liệu nghiệp vụ không bị mất mát. "
        "Hệ thống cung cấp quy trình sao lưu định kỳ qua công cụ `pg_dump`:"
    )
    add_bullet(" docker compose exec -T postgres pg_dump -U postgres_admin project_management_db > backup_$(date +%Y%m%d).sql", "Lệnh sao lưu CSDL (Backup):")
    add_bullet(" cat backup_file.sql | docker compose exec -T postgres psql -U postgres_admin -d project_management_db", "Lệnh phục hồi CSDL (Restore):")

    # ==============================================================================
    # CHƯƠNG 6
    # ==============================================================================
    add_h1("6. XÂY DỰNG BACKEND NESTJS VÀ TÀI LIỆU ĐẶC TẢ REST API")
    add_h2("6.1. Cấu trúc mô-đun hóa backend")
    add_p(
        "Tầng Backend được xây dựng bằng NestJS 10 dựa trên ngôn ngữ TypeScript, phân tách rõ ràng theo mô hình Controller - Service - Repository. "
        "Các module chức năng bao gồm: AuthModule, UsersModule, ProjectsModule, TasksModule, DashboardModule, DatabaseModule, HealthModule và MetricsModule."
    )
    add_h2("6.2. Bộ lọc lỗi toàn cục và Validation DTO")
    add_bullet(" Ngăn ngừa hoàn toàn nguy cơ rò rỉ thông tin stack trace hoặc chi tiết câu lệnh SQL ra môi trường bên ngoài khi xảy ra lỗi, trả về cấu trúc lỗi chuẩn RFC 7807 (statusCode, message, timestamp, path).", "AllExceptionsFilter:")
    add_bullet(" Sử dụng `class-validator` và `class-transformer` tự động loại bỏ các trường không hợp lệ trong body request (`whitelist: true`), ngăn chặn lỗ hổng Mass Assignment.", "ValidationPipe toàn cục:")

    add_h2("6.3. Tài liệu tương tác Swagger OpenAPI UI")
    add_p(
        "Backend tích hợp Swagger UI tại đường dẫn `/api/docs`. Tài liệu mô tả đầy đủ các phương thức HTTP (GET, POST, PUT, DELETE, PATCH), "
        "schema request body, query parameters, mã phản hồi (200, 201, 400, 401, 403, 404, 500) và cho phép xác thực trực tiếp qua Bearer Token:"
    )
    add_image_figure(
        'report_images/ui_07_swagger_api.png',
        'Hình 6. Giao diện tài liệu đặc tả API tương tác Swagger OpenAPI tại đường dẫn /api/docs',
        6.5
    )

    add_h2("6.4. Endpoint Health Check và Prometheus Metrics")
    add_p("Backend cung cấp 2 endpoint giám sát sức khỏe dịch vụ đặc biệt:")
    add_bullet(" Thực hiện kiểm tra ping CSDL PostgreSQL qua câu lệnh `SELECT 1;`. Trả về trạng thái UP, thời gian uptime tiến trình, bộ nhớ RSS và Heap Memory đang sử dụng.", "GET /api/health:")
    add_bullet(" Xuất các chỉ số theo chuẩn Prometheus scrape: tổng số request theo route, thời gian phản hồi (histogram response time), số kết nối database connection pool.", "GET /api/metrics:")

    # ==============================================================================
    # CHƯƠNG 7
    # ==============================================================================
    add_h1("7. XÂY DỰNG FRONTEND REACT VÀ GIAO DIỆN NGƯỜI DÙNG")
    add_h2("7.1. Công nghệ và Kiến trúc giao diện")
    add_p(
        "Frontend được xây dựng bằng React 18, trình biên dịch Vite siêu tốc, TypeScript và Tailwind CSS hiện đại. "
        "Ứng dụng được thiết kế responsive hoàn toàn, tối ưu hiển thị trên cả máy tính để bàn, máy tính bảng và điện thoại di động."
    )

    add_h2("7.2. Giao diện Đăng nhập hệ thống (Login)")
    add_p("Màn hình đăng nhập cung cấp form nhập Email và Mật khẩu, có cơ chế validate dữ liệu tức thì, thông báo lỗi rõ ràng và lưu token an toàn:")
    add_image_figure(
        'report_images/ui_01_login.png',
        'Hình 7. Giao diện Đăng nhập hệ thống Quản lý Dự án (Frontend /login)',
        6.5
    )

    add_h2("7.3. Giao diện Trang tổng quan (Dashboard)")
    add_p("Trang Dashboard tổng hợp toàn bộ các số liệu thống kê thời gian thực: tổng số dự án đang quản lý, tỷ lệ hoàn thành công việc, số lượng công việc trễ hạn:")
    add_image_figure(
        'report_images/ui_02_dashboard.png',
        'Hình 8. Giao diện Trang tổng quan Dashboard với các chỉ số thống kê dự án và tiến độ công việc',
        6.5
    )

    add_h2("7.4. Giao diện Quản lý Danh sách Dự án (Projects)")
    add_p("Trang Projects cho phép hiển thị các dự án dưới dạng thẻ card trực quan, có bộ lọc trạng thái (Đang thực hiện, Lên kế hoạch, Hoàn thành), hiển thị quản lý và hạn dự án:")
    add_image_figure(
        'report_images/ui_03_projects.png',
        'Hình 9. Giao diện Quản lý danh sách Dự án và bộ lọc trạng thái',
        6.5
    )

    add_h2("7.5. Giao diện Bảng công việc Kanban (Tasks)")
    add_p("Màn hình Kanban phân rã công việc thành 4 cột trạng thái: Cần làm (TODO), Đang làm (IN_PROGRESS), Kiểm thử (REVIEW), Hoàn thành (DONE):")
    add_image_figure(
        'report_images/ui_04_tasks_kanban.png',
        'Hình 10. Giao diện Bảng công việc Kanban phân rã theo 4 cột trạng thái (TODO, IN_PROGRESS, REVIEW, DONE)',
        6.5
    )

    add_h2("7.6. Giao diện Quản lý Thành viên (Members) và Hồ sơ (Profile)")
    add_p("Trang Members và Profile hiển thị thông tin nhân sự, quyền hạn trong hệ thống và thiết lập tài khoản cá nhân:")
    add_image_figure(
        'report_images/ui_05_members.png',
        'Hình 11. Giao diện Quản lý danh sách Thành viên và phân quyền trong dự án',
        6.5
    )
    add_image_figure(
        'report_images/ui_06_profile.png',
        'Hình 12. Giao diện Hồ sơ người dùng và cài đặt tài khoản cá nhân (/profile)',
        6.5
    )

    # ==============================================================================
    # CHƯƠNG 8
    # ==============================================================================
    add_h1("8. ĐIỀU PHỐI TRIỂN KHAI HỆ THỐNG VỚI DOCKER COMPOSE")
    add_h2("8.1. Danh mục 12 dịch vụ Container điều phối")
    headers_dc = ["Container Name", "Docker Image", "Ports Mapped", "Mạng tham gia", "Vai trò"]
    rows_dc = [
        ["pm_nginx", "nginx:1.25-alpine", "0.0.0.0:80->80\n0.0.0.0:443->443", "public, internal", "Reverse Proxy Gateway, SSL, Security Headers"],
        ["pm_frontend", "duantrienkhai-frontend", "80/tcp (nội bộ)", "internal", "React 18 SPA build tĩnh"],
        ["pm_backend", "duantrienkhai-backend", "3000/tcp (nội bộ)", "internal, monitoring", "NestJS REST API, Swagger, Prometheus metrics"],
        ["pm_postgres", "postgres:16-alpine", "5432/tcp (nội bộ)", "internal", "PostgreSQL 16 Database, Named volume postgres_data"],
        ["pm_pgadmin", "dpage/pgadmin4:8", "0.0.0.0:5050->80", "public, internal", "Web GUI quản trị cơ sở dữ liệu"],
        ["pm_prometheus", "prom/prometheus:v2.51.0", "0.0.0.0:9090->9090", "public, monitoring", "Thu thập và lưu trữ time-series metrics"],
        ["pm_grafana", "grafana/grafana:10.4.1", "0.0.0.0:3001->3000", "public, monitoring", "Trực quan hóa dashboard metrics và log"],
        ["pm_loki", "grafana/loki:2.9.5", "0.0.0.0:3100->3100", "public, monitoring", "Lưu trữ log tập trung dung lượng nhẹ"],
        ["pm_promtail", "grafana/promtail:2.9.5", "Không có port host", "monitoring", "Thu thập docker logs và gửi về Loki"],
        ["pm_cadvisor", "gcr.io/cadvisor/cadvisor:v0.49.1", "0.0.0.0:8080->8080", "public, monitoring", "Giám sát tài nguyên phần cứng container"],
        ["pm_nginx_exporter", "nginx-prometheus-exporter:1.1.0", "Không có port host", "monitoring", "Trích xuất metrics từ stub_status Nginx"],
        ["pm_postgres_exporter", "postgres-exporter:v0.15.0", "9187/tcp (nội bộ)", "internal, monitoring", "Trích xuất metrics chuyên sâu PostgreSQL"]
    ]
    create_custom_table(headers_dc, rows_dc, [1.4, 1.8, 1.3, 1.1, 1.4])

    add_h2("8.2. Quy trình khởi chạy và xác thực hệ thống chuẩn")
    add_bullet(" docker compose config (Kiểm tra cú pháp file docker-compose.yml và các biến môi trường .env).", "Bước 1 - Xác minh cấu hình:")
    add_bullet(" docker compose up -d --build (Tải image chính hãng, build frontend/backend multi-stage và khởi chạy 12 container nền).", "Bước 2 - Build và khởi động:")
    add_bullet(" docker compose ps (Xác minh toàn bộ 12 container đều ở trạng thái UP hoặc Up (healthy)).", "Bước 3 - Kiểm tra tiến trình:")
    add_bullet(" curl http://localhost/api/health (Kiểm tra kết quả phản hồi HTTP 200 và kết nối DB UP).", "Bước 4 - Xác thực Health Check:")

    # ==============================================================================
    # CHƯƠNG 9
    # ==============================================================================
    add_h1("9. CẤU HÌNH NGINX REVERSE PROXY VÀ GIA CỐ BẢO MẬT HỆ THỐNG")
    add_h2("9.1. Vai trò Reverse Proxy và Cấu hình Upstream")
    add_p(
        "Nginx đóng vai trò là chốt chặn bảo vệ duy nhất đối với người dùng cuối bên ngoài mạng. "
        "File cấu hình `nginx/conf.d/default.conf` khai báo 2 cụm upstream nội bộ:"
    )
    add_bullet(" upstream frontend_service { server frontend:80; }", "Upstream Frontend:")
    add_bullet(" upstream backend_service { server backend:3000; }", "Upstream Backend:")
    add_p("Mọi truy vấn có tiền tố `/api/` được chuyển tiếp nguyên vẹn tới `backend_service`, các truy vấn còn lại chuyển tiếp tới `frontend_service`.")

    add_h2("9.2. Bảng cấu hình HTTP Security Headers gia cố an toàn")
    headers_sec = ["Tên Security Header", "Giá trị cấu hình", "Mục tiêu ngăn chặn tấn công"]
    rows_sec = [
        ["X-Frame-Options", "SAMEORIGIN", "Ngăn chặn tấn công Clickjacking bằng cách cấm nhúng trang web vào thẻ iframe từ domain lạ"],
        ["X-Content-Type-Options", "nosniff", "Ngăn chặn tấn công MIME Sniffing, buộc trình duyệt tuân thủ đúng Content-Type được máy chủ khai báo"],
        ["X-XSS-Protection", "1; mode=block", "Kích hoạt bộ lọc chống Cross-Site Scripting (XSS) trên các trình duyệt kế thừa"],
        ["Referrer-Policy", "strict-origin-when-cross-origin", "Bảo vệ quyền riêng tư người dùng, ngăn rò rỉ URL nhạy cảm khi chuyển hướng sang origin khác"],
        ["Content-Security-Policy (CSP)", "default-src 'self'; script-src 'self' 'unsafe-inline'...", "Chính sách bảo mật tài nguyên nghiêm ngặt, chỉ cho phép thực thi script từ nguồn tin cậy"],
        ["Permissions-Policy", "camera=(), microphone=(), geolocation=()", "Vô hiệu hóa quyền truy cập thiết bị phần cứng của người dùng (camera, mic, vị trí)"],
        ["Client Max Body Size", "client_max_body_size 20M;", "Chống tấn công từ chối dịch vụ (DoS) qua việc upload payload kích thước khổng lồ"]
    ]
    create_custom_table(headers_sec, rows_sec, [1.8, 2.2, 3.0])

    # ==============================================================================
    # CHƯƠNG 10
    # ==============================================================================
    add_h1("10. HỆ THỐNG GIÁM SÁT CHỈ SỐ HIỆU NĂNG VỚI PROMETHEUS VÀ CADVISOR")
    add_h2("10.1. Cấu hình Scrape Targets trong Prometheus")
    add_p(
        "Prometheus được cấu hình chu kỳ kéo dữ liệu (scrape interval) là 15 giây từ 6 targets chính: "
        "prometheus (bản thân hệ thống), backend (chỉ số API), cadvisor (chỉ số phần cứng container), "
        "nginx-exporter (lưu lượng web), postgres-exporter (hiệu năng database), và promtail."
    )
    add_image_figure(
        'report_images/ui_08_prometheus_targets.png',
        'Hình 13. Giao diện Quản lý mục tiêu Prometheus Targets (100% mục tiêu trạng thái UP)',
        6.5
    )

    add_h2("10.2. Giám sát tài nguyên Container chuyên sâu với Google cAdvisor")
    add_p(
        "cAdvisor thu thập các chỉ số phần cứng thời gian thực trực tiếp từ Linux cgroups của Docker: "
        "tỷ lệ sử dụng CPU (CPU usage), mức tiêu thụ bộ nhớ RAM (Memory RSS/Cache), băng thông mạng (Network Rx/Tx bytes), và số lần I/O đĩa cứng:"
    )
    add_image_figure(
        'report_images/ui_09_cadvisor.png',
        'Hình 14. Giao diện Google cAdvisor theo dõi tài nguyên phần cứng (CPU, Memory, Network) của các container',
        6.5
    )

    # ==============================================================================
    # CHƯƠNG 11
    # ==============================================================================
    add_h1("11. THU THẬP VÀ PHÂN TÍCH LOG TẬP TRUNG VỚI LOKI VÀ PROMTAIL")
    add_h2("11.1. Kiến trúc Shipper Promtail và Kho lưu trữ Loki")
    add_p(
        "Thay vì phải đăng nhập từng máy chủ và chạy `docker logs` thủ công, Promtail được mount trực tiếp tới thư mục "
        "`/var/lib/docker/containers` trên máy host, tự động đọc luồng json-log, trích xuất metadata (tên container, service, stream) "
        "và gửi theo đợt (batch) nén tới Loki."
    )
    add_h2("11.2. Các câu truy vấn LogQL mẫu phục vụ điều tra sự cố")
    add_bullet(" {job=\"docker-json\"} (Hiển thị toàn bộ luồng log thời gian thực từ 12 container).", "Xem log tổng thể:")
    add_bullet(" {job=\"docker-json\"} |~ \"(?i)error|exception|failed\" (Lọc nhanh các bản ghi chứa lỗi hoặc ngoại lệ).", "Phát hiện lỗi ứng dụng:")
    add_bullet(" {container_name=\"pm_nginx\"} |= \"GET /api/\" (Theo dõi toàn bộ lưu lượng gọi API từ người dùng).", "Kiểm tra truy cập Nginx:")
    add_bullet(" {container_name=\"pm_backend\"} |= \"HealthController\" (Xác nhận lịch sử kiểm tra sức khỏe hệ thống).", "Kiểm tra Health Check:")

    # ==============================================================================
    # CHƯƠNG 12
    # ==============================================================================
    add_h1("12. TRỰC QUAN HÓA DỮ LIỆU TRÊN GRAFANA DASHBOARD")
    add_h2("12.1. Cấu hình Datasource tự động (Provisioning)")
    add_p(
        "Grafana được cấu hình tự động nhận diện 2 Data Sources chính thông qua cơ chế Provisioning YAML: "
        "Prometheus (URL: `http://prometheus:9090`) và Loki (URL: `http://loki:3100`). "
        "Điều này giúp hệ thống sẵn sàng hoạt động ngay sau khi khởi động mà không cần can thiệp thủ công bằng tay."
    )
    add_image_figure(
        'report_images/ui_10_grafana.png',
        'Hình 15. Giao diện Grafana phục vụ trực quan hóa metrics và phân tích log thời gian thực',
        6.5
    )
    add_h2("12.2. Quy trình 5 bước điều tra sự cố vận hành chuẩn")
    add_bullet(" Tiếp nhận cảnh báo qua Prometheus Alert hoặc phát hiện biểu đồ lỗi tăng vọt trên Grafana Dashboard.", "Bước 1 - Định vị thời điểm:")
    add_bullet(" Mở Grafana Explore, chọn Data Source Loki, lọc log của container nghi vấn trong khung thời gian xảy ra lỗi.", "Bước 2 - Truy vết Log:")
    add_bullet(" Đối chiếu chỉ số CPU, RAM trên cAdvisor để xác định hệ thống có bị cạn kiệt tài nguyên (OOM) hay không.", "Bước 3 - Đối chiếu Metrics:")
    add_bullet(" Thực hiện vá lỗi cấu hình, khởi động lại container hoặc tối ưu hóa câu truy vấn CSDL.", "Bước 4 - Xử lý sự cố:")
    add_bullet(" Ghi nhận biên bản sự cố (Post-mortem) và bổ sung ngưỡng cảnh báo phòng ngừa tái diễn.", "Bước 5 - Phòng ngừa:")

    # ==============================================================================
    # CHƯƠNG 13
    # ==============================================================================
    add_h1("13. QUẢN TRỊ CƠ SỞ DỮ LIỆU TRỰC QUAN QUA PGADMIN 4")
    add_h2("13.1. Cấu hình và Tính năng pgAdmin 4")
    add_p(
        "pgAdmin 4 được cấu hình tự động kết nối vào cụm PostgreSQL nội bộ qua tập tin `database/servers.json` và mật khẩu `database/pgpass`. "
        "Giao diện web trực quan giúp đội ngũ phát triển và quản trị viên thực hiện các thao tác quản trị nhanh chóng và trực quan:"
    )
    add_image_figure(
        'report_images/ui_11_pgadmin.png',
        'Hình 16. Giao diện Quản trị cơ sở dữ liệu PostgreSQL trực quan bằng pgAdmin 4 (Port 5050)',
        6.5
    )
    add_bullet(" Trực quan hóa cấu trúc 5 bảng (users, projects, project_members, tasks, task_comments), kiểu dữ liệu và ràng buộc khóa ngoại.", "Duyệt cây đối tượng CSDL:")
    add_bullet(" Soạn thảo, thực thi và tối ưu hóa các câu lệnh SQL phức tạp qua công cụ Query Tool tích hợp.", "Truy vấn dữ liệu chuyên sâu:")
    add_bullet(" Theo dõi đồ thị số lượng kết nối (Active Connections), số giao dịch mỗi giây (TPS) và tỷ lệ Block I/O.", "Giám sát hiệu năng Database:")

    # ==============================================================================
    # CHƯƠNG 14
    # ==============================================================================
    add_h1("14. KẾT QUẢ KIỂM THỬ THỰC TẾ VÀ ĐỐI CHIẾU TIÊU CHÍ VẬN HÀNH")
    add_h2("14.1. Bảng kết quả kiểm thử toàn diện 12 hạng mục (Verification Matrix)")
    headers_test = ["STT", "Hạng mục kiểm thử", "Lệnh / Phương pháp kiểm tra", "Kết quả thực tế", "Đánh giá"]
    rows_test = [
        ["1", "Kiểm tra Git Remote & Branch", "git remote -v; git branch -vv", "origin: https://github.com/El-IT-stack/duantrienkhai, main 67a8947", "ĐẠT (PASS)"],
        ["2", "Khởi động Docker Compose", "docker compose up -d --build", "12/12 Container khởi chạy thành công, không lỗi cú pháp", "ĐẠT (PASS)"],
        ["3", "Kiểm tra Container Status", "docker compose ps", "12 container Up (healthy), port mapping đúng chuẩn", "ĐẠT (PASS)"],
        ["4", "Kiểm tra Health Check Gateway", "curl -i http://localhost/health", "HTTP/1.1 200 OK (Nginx proxy hoạt động bình thường)", "ĐẠT (PASS)"],
        ["5", "Kiểm tra API Health & CSDL", "curl -s http://localhost/api/health", "HTTP 200: {\"status\":\"UP\",\"services\":{\"database\":{\"status\":\"UP\"}}}", "ĐẠT (PASS)"],
        ["6", "Giao diện Web Frontend", "Truy cập http://localhost/login", "Tải trang React SPA mượt mà, đầy đủ form và CSS", "ĐẠT (PASS)"],
        ["7", "Xác thực & Đăng nhập", "Login admin@pm.local / Admin@123", "Cấp phát JWT, chuyển hướng Dashboard thành công", "ĐẠT (PASS)"],
        ["8", "Thao tác Bảng Kanban", "Truy cập http://localhost/tasks", "Hiển thị 4 cột TODO/IN_PROGRESS/REVIEW/DONE đầy đủ", "ĐẠT (PASS)"],
        ["9", "Tài liệu Swagger API", "Truy cập http://localhost/api/docs", "Giao diện Swagger OpenAPI tải đầy đủ tài liệu API", "ĐẠT (PASS)"],
        ["10", "Prometheus Targets", "Truy cập http://localhost:9090/targets", "Tất cả các targets ở trạng thái UP (100%)", "ĐẠT (PASS)"],
        ["11", "Google cAdvisor", "Truy cập http://localhost:8080/containers/", "Theo dõi CPU, RAM của toàn bộ container thời gian thực", "ĐẠT (PASS)"],
        ["12", "Grafana & pgAdmin", "Truy cập port 3001 & 5050", "Đăng nhập thành công, datasource và CSDL sẵn sàng", "ĐẠT (PASS)"]
    ]
    create_custom_table(headers_test, rows_test, [0.5, 1.8, 1.8, 2.0, 0.9])

    add_h2("14.2. Đánh giá kết quả kiểm thử")
    add_p(
        "Toàn bộ 12 hạng mục kiểm thử chức năng, hiệu năng, bảo mật và vận hành đều đạt kết quả xuất sắc 100%. "
        "Hệ thống chứng minh tính ổn định cao, khả năng tự động khôi phục (restart policy), cô lập mạng an toàn "
        "và cung cấp đầy đủ công cụ phục vụ quan sát vận hành chuyên nghiệp."
    )

    # ==============================================================================
    # CHƯƠNG 15
    # ==============================================================================
    add_h1("15. ĐÁNH GIÁ AN TOÀN BẢO MẬT VÀ ĐỀ XUẤT CẢI TIẾN NÂNG CẤP")
    add_h2("15.1. Các biện pháp gia cố bảo mật đã triển khai thành công")
    add_bullet(" Cổng 5432 của PostgreSQL hoàn toàn không publish ra máy chủ ngoài, ngăn chặn triệt để tấn công dò quét cổng hoặc brute-force mật khẩu database.", "1. Cô lập hoàn toàn Cơ sở dữ liệu:")
    add_bullet(" Mật khẩu người dùng được băm an toàn bằng thuật toán Bcrypt với 10 vòng mã hóa (salt rounds), bảo vệ tuyệt đối thông tin người dùng ngay cả khi CSDL bị lộ.", "2. Mã hóa mật khẩu chuẩn Bcrypt:")
    add_bullet(" Áp dụng toàn diện 7 loại Security Headers giúp triệt tiêu các lỗ hổng phổ biến như Clickjacking, MIME-sniffing, XSS.", "3. Thiết lập Security Headers ở Nginx:")
    add_bullet(" Chuyển đổi toàn bộ mật khẩu mặc định sang mật khẩu phức tạp, lưu trong tập tin `.env` và đưa vào `.gitignore` để không bao giờ bị commit lên Git.", "4. Quản lý Secret độc lập:")

    add_h2("15.2. Kế hoạch cải tiến và mở rộng theo lộ trình (Roadmap)")
    add_bullet(" Tích hợp GitHub Actions để tự động chạy kiểm thử đơn vị (Unit Test), kiểm tra lỗi bảo mật SonarQube và tự động build Docker Image đẩy lên Docker Hub / GitHub Container Registry.", "Giai đoạn 1 - CI/CD Pipeline tự động:")
    add_bullet(" Bổ sung container Alertmanager kết hợp Telegram Bot hoặc Discord Webhook để gửi tin nhắn cảnh báo tức thì tới nhóm vận hành khi có lỗi xảy ra.", "Giai đoạn 2 - Cảnh báo tự động (Alerting):")
    add_bullet(" Cấu hình cron job tự động chạy `pg_dump`, nén file, mã hóa GPG và đẩy bản sao lưu lên lưu trữ đám mây S3 / MinIO hàng ngày.", "Giai đoạn 3 - Tự động hóa Backup Cloud:")
    add_bullet(" Chuyển đổi các tệp cấu hình Docker Compose sang Kubernetes Manifests (Helm Chart), triển khai cụm Kube trên môi trường Cloud (AWS EKS hoặc GCP GKE).", "Giai đoạn 4 - Mở rộng cụm Kubernetes:")

    # ==============================================================================
    # CHƯƠNG 16
    # ==============================================================================
    add_h1("16. KẾT LUẬN VÀ PHỤ LỤC LỆNH QUẢN TRỊ VẬN HÀNH")
    add_h2("16.1. Kết luận đề tài")
    add_p(
        "Đề tài 'Xây dựng, Triển khai và Quản trị Hệ thống Quản lý Dự án' đã hoàn thành toàn diện 100% mục tiêu đề ra. "
        "Dự án không chỉ dừng lại ở một ứng dụng quản lý công việc và dự án Kanban hoàn chỉnh về mặt nghiệp vụ, "
        "mà còn thiết lập một chuẩn mực triển khai hạ tầng container hóa hiện đại, an toàn và có khả năng giám sát toàn diện. "
        "Hệ sinh thái kết hợp chặt chẽ giữa React, NestJS, PostgreSQL, Nginx, Prometheus, Grafana, Loki, Promtail, cAdvisor và pgAdmin "
        "đã tạo nên một giải pháp phần mềm hoàn chỉnh, sẵn sàng cho việc đưa vào khai thác và mở rộng trong thực tế."
    )

    add_h2("16.2. Phụ lục các câu lệnh quản trị vận hành thiết yếu")
    add_bullet(" docker compose up -d --build", "Khởi động toàn bộ hệ thống:")
    add_bullet(" docker compose ps", "Kiểm tra trạng thái các container:")
    add_bullet(" docker compose logs -f --tail=100 [service_name]", "Theo dõi log trực tiếp theo thời gian thực:")
    add_bullet(" docker compose restart [service_name]", "Khởi động lại một dịch vụ cụ thể:")
    add_bullet(" curl -s http://localhost/api/health", "Kiểm tra sức khỏe Backend & Database:")
    add_bullet(" docker compose exec postgres pg_isready -U postgres_admin -d project_management_db", "Kiểm tra PostgreSQL sẵn sàng:")
    add_bullet(" docker compose exec -T postgres pg_dump -U postgres_admin project_management_db > backup.sql", "Sao lưu dữ liệu CSDL:")
    add_bullet(" cat backup.sql | docker compose exec -T postgres psql -U postgres_admin -d project_management_db", "Phục hồi dữ liệu CSDL:")
    add_bullet(" docker compose down", "Dừng toàn bộ hệ thống (Bảo toàn dữ liệu Volume):")

    # Save to docx
    output_path = 'Bao_Cao_Trien_Khai_Quan_Tri_He_Thong_Quan_Ly_Du_An (1).docx'
    doc.save(output_path)
    print(f"Successfully generated full report: {output_path}")

if __name__ == '__main__':
    build_report()
