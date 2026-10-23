# ==============================================================================
# Multi-stage Dockerfile cho NestJS Backend
# Tiêu chuẩn bảo mật (Hardening): Chạy bằng Non-Root User (appuser)
# ==============================================================================

# STAGE 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json tsconfig*.json nest-cli.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

# STAGE 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Tạo group và user non-root để tăng cường bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /usr/src/app/dist ./dist

# Phân quyền thư mục cho user non-root và tạo thư mục logs
RUN mkdir -p /var/log/backend && \
    chown -R appuser:appgroup /usr/src/app /var/log/backend

USER appuser

EXPOSE 3000

CMD ["node", "dist/main.js"]
