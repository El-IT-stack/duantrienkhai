import os
import time
from playwright.sync_api import sync_playwright

os.makedirs('report_images', exist_ok=True)

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        context = browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = context.new_page()

        # 1. Login Page
        print("Capturing 1. Login...")
        page.goto('http://localhost/login', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='report_images/ui_01_login.png')

        # Perform Login
        print("Logging in...")
        try:
            page.fill('input[type="email"]', 'admin@pm.local')
            page.fill('input[type="password"]', 'Admin@123')
            page.click('button[type="submit"]')
            page.wait_for_timeout(2500)
        except Exception as e:
            print("Login fill error:", e)

        # 2. Dashboard
        print("Capturing 2. Dashboard...")
        page.goto('http://localhost/dashboard', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_02_dashboard.png')

        # 3. Projects
        print("Capturing 3. Projects...")
        page.goto('http://localhost/projects', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_03_projects.png')

        # 4. Tasks Kanban
        print("Capturing 4. Tasks...")
        page.goto('http://localhost/tasks', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_04_tasks_kanban.png')

        # 5. Members
        print("Capturing 5. Members...")
        page.goto('http://localhost/members', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_05_members.png')

        # 6. Profile
        print("Capturing 6. Profile...")
        page.goto('http://localhost/profile', wait_until='networkidle')
        page.wait_for_timeout(1500)
        page.screenshot(path='report_images/ui_06_profile.png')

        # 7. Swagger API
        print("Capturing 7. Swagger API...")
        page.goto('http://localhost/api/docs', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_07_swagger_api.png')

        # 8. Prometheus Targets
        print("Capturing 8. Prometheus Targets...")
        page.goto('http://localhost:9090/targets', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_08_prometheus_targets.png')

        # 9. cAdvisor
        print("Capturing 9. cAdvisor...")
        page.goto('http://localhost:8080/containers/', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='report_images/ui_09_cadvisor.png')

        # 10. Grafana
        print("Capturing 10. Grafana...")
        try:
            page.goto('http://localhost:3001/login', wait_until='networkidle')
            page.wait_for_timeout(1500)
            page.fill('input[name="user"]', 'admin')
            page.fill('input[name="password"]', 'Grafana@2026_Secure!')
            page.click('button[type="submit"]')
            page.wait_for_timeout(3000)
            # if prompt to change password, skip
            if page.locator('text="Skip"').is_visible():
                page.click('text="Skip"')
                page.wait_for_timeout(1500)
            page.screenshot(path='report_images/ui_10_grafana.png')
        except Exception as e:
            print("Grafana capture error:", e)
            page.screenshot(path='report_images/ui_10_grafana.png')

        # 11. pgAdmin
        print("Capturing 11. pgAdmin...")
        try:
            page.goto('http://localhost:5050/login', wait_until='networkidle')
            page.wait_for_timeout(2000)
            page.fill('input[name="email"]', 'admin@pm.com')
            page.fill('input[name="password"]', 'PgAdmin@2026_Secure!')
            page.click('button[type="submit"]')
            page.wait_for_timeout(4000)
            page.screenshot(path='report_images/ui_11_pgadmin.png')
        except Exception as e:
            print("pgAdmin capture error:", e)
            page.screenshot(path='report_images/ui_11_pgadmin.png')

        browser.close()
        print("ALL CAPTURED SUCCESSFULLY!")

if __name__ == '__main__':
    capture_all()
