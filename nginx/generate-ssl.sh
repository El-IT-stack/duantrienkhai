#!/usr/bin/env bash
# Script tạo chứng chỉ SSL tự ký (Self-Signed Certificate) cho Nginx
set -e

SSL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/ssl" && pwd)"
mkdir -p "$SSL_DIR"

echo "🔐 Khởi tạo chứng chỉ SSL tự ký cho domain localhost..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/server.key" \
  -out "$SSL_DIR/server.crt" \
  -subj "/C=VN/ST=ThaiNguyen/L=ThaiNguyen/O=ICTU/OU=DTC245200226/CN=localhost"

echo "✅ Tạo thành công:"
echo "   - Khóa bí mật: $SSL_DIR/server.key"
echo "   - Chứng chỉ : $SSL_DIR/server.crt"
