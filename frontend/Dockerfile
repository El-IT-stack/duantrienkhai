# ==============================================================================
# Multi-stage Dockerfile cho React + Vite Frontend
# Tiêu chuẩn bảo mật (Hardening): Multi-stage build & tối ưu kích thước image
# ==============================================================================

# STAGE 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm ci

# Copy source code and build config
COPY . .

# Build production bundle
RUN npm run build

# STAGE 2: Production runtime stage với Nginx Alpine siêu nhẹ
FROM nginx:1.25-alpine AS runner

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy cấu hình tùy biến của frontend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts từ builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Phân quyền chặt chẽ cho web root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
