#!/bin/bash
# Corrige VPS: HTTP_PORT, Docker, certificado (sem force-renewal), Nginx HTTPS
# Uso na VPS: bash /opt/Plataforma_ovo/infra/scripts/vps-corrigir-tudo.sh
set -eu

DOMAIN="${DOMAIN:-app.granjauniao.com.br}"
INFRA="${INFRA:-/opt/Plataforma_ovo/infra}"
ENV="$INFRA/.env.prod"
LIVE="/etc/letsencrypt/live/$DOMAIN"
ARCHIVE="/etc/letsencrypt/archive/$DOMAIN"

echo "=== 1. HTTP_PORT no .env.prod ==="
if [ -f "$ENV" ]; then
  sed -i 's/^HTTP_PORT=808080/HTTP_PORT=8080/' "$ENV"
  sed -i 's/^HTTP_PORT=80$/HTTP_PORT=8080/' "$ENV"
  grep '^HTTP_PORT=' "$ENV" || echo 'HTTP_PORT=8080' >> "$ENV"
else
  echo "AVISO: $ENV nao encontrado"
fi

echo "=== 2. Docker ==="
cd "$INFRA"
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

echo "=== 3. Certificado (symlinks, sem renovar) ==="
if [ -d "$ARCHIVE" ]; then
  mkdir -p "$LIVE"
  rm -f "$LIVE"/*.pem
  n=$(ls -1 "$ARCHIVE"/fullchain*.pem 2>/dev/null | sed 's/.*fullchain\([0-9]*\)\.pem/\1/' | sort -n | tail -1)
  n="${n:-1}"
  ln -sf "../../archive/$DOMAIN/fullchain${n}.pem" "$LIVE/fullchain.pem"
  ln -sf "../../archive/$DOMAIN/privkey${n}.pem" "$LIVE/privkey.pem"
  ln -sf "../../archive/$DOMAIN/cert${n}.pem" "$LIVE/cert.pem"
  ln -sf "../../archive/$DOMAIN/chain${n}.pem" "$LIVE/chain.pem"
  openssl x509 -in "$LIVE/fullchain.pem" -noout -issuer -subject 2>/dev/null || true
else
  echo "AVISO: archive vazio — HTTPS depois do rate limit Let's Encrypt"
fi

echo "=== 4. Nginx ==="
if [ -f "$LIVE/fullchain.pem" ] && [ -f "$LIVE/privkey.pem" ]; then
  issuer=$(openssl x509 -in "$LIVE/fullchain.pem" -noout -issuer 2>/dev/null || true)
  if echo "$issuer" | grep -q "CN=$DOMAIN" && ! echo "$issuer" | grep -qiE "let.s encrypt|R3|E7|ISRG"; then
    echo "Cert autoassinado — Nginx so HTTP por enquanto"
    cat > "/etc/nginx/sites-available/$DOMAIN" << 'NGINX_HTTP'
server {
    listen 80;
    server_name app.granjauniao.com.br;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_HTTP
  else
    cat > "/etc/nginx/sites-available/$DOMAIN" << 'NGINX_HTTPS'
server {
    listen 80;
    server_name app.granjauniao.com.br;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name app.granjauniao.com.br;
    ssl_certificate     /etc/letsencrypt/live/app.granjauniao.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.granjauniao.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 10m;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
NGINX_HTTPS
  fi
else
  cat > "/etc/nginx/sites-available/$DOMAIN" << 'NGINX_HTTP'
server {
    listen 80;
    server_name app.granjauniao.com.br;
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_HTTP
fi

ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "=== 5. Testes ==="
curl -s "http://127.0.0.1:8080/api/health" || true
echo ""
curl -s "http://$DOMAIN/api/health" || true
echo ""
curl -sk "https://$DOMAIN/api/health" 2>/dev/null || echo "(HTTPS ainda indisponivel)"
echo ""
echo "Painel: http://$DOMAIN"
echo "Login: admin (senha em $ENV)"
