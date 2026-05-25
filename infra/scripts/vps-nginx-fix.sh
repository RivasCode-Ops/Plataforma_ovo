#!/bin/bash
# Blocos 1–3: certificado + nginx + testes (ver docs/RUNBOOK_HTTPS_VPS.md)
# Uso: bash /opt/Plataforma_ovo/infra/scripts/vps-nginx-fix.sh
set -eu

DOMAIN="${DOMAIN:-app.granjauniao.com.br}"
INFRA="${INFRA:-/opt/Plataforma_ovo/infra}"
CONF="/etc/nginx/sites-available/$DOMAIN"
LIVE="/etc/letsencrypt/live/$DOMAIN"
ARCHIVE="/etc/letsencrypt/archive/$DOMAIN"
EMAIL="${CERTBOT_EMAIL:-rivaldo@granjauniao.com.br}"

echo "=== DIAGNÓSTICO ==="
ls -la "$LIVE/" 2>/dev/null || echo "Live não existe"
ls -la "$ARCHIVE/" 2>/dev/null || echo "Archive não existe"

fix_cert_symlinks() {
  if [ ! -d "$ARCHIVE" ]; then
    echo "=== CRIANDO NOVO CERTIFICADO ==="
    cd "$INFRA"
    docker compose --env-file .env.prod -f docker-compose.prod.yml stop web
    certbot certonly --standalone -d "$DOMAIN" \
      --non-interactive --agree-tos -m "$EMAIL" \
      || {
        echo "ERRO certbot (rate limit?). Tente depois ou restaure archive."
        docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
        exit 1
      }
    docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
    return
  fi

  echo "=== REPARANDO CERTIFICADO ==="
  rm -f "$LIVE"/*.pem
  local n
  n=$(ls -1 "$ARCHIVE"/fullchain*.pem 2>/dev/null | sed 's/.*fullchain\([0-9]*\)\.pem/\1/' | sort -n | tail -1)
  n="${n:-1}"
  ln -sf "../../archive/$DOMAIN/fullchain${n}.pem" "$LIVE/fullchain.pem"
  ln -sf "../../archive/$DOMAIN/privkey${n}.pem" "$LIVE/privkey.pem"
  ln -sf "../../archive/$DOMAIN/cert${n}.pem" "$LIVE/cert.pem"
  ln -sf "../../archive/$DOMAIN/chain${n}.pem" "$LIVE/chain.pem"

  echo "=== VALIDAÇÃO ==="
  if ! openssl x509 -in "$LIVE/fullchain.pem" -noout -subject -dates; then
    echo "Certificado inválido — use: bash $INFRA/scripts/vps-https-recreate-cert.sh $EMAIL"
    exit 1
  fi
  issuer=$(openssl x509 -in "$LIVE/fullchain.pem" -noout -issuer 2>/dev/null || true)
  if echo "$issuer" | grep -q "CN=$DOMAIN" && ! echo "$issuer" | grep -qiE "let.s encrypt|R3|E7|ISRG"; then
    echo "ERRO: certificado autoassinado (issuer = subject). Rode:"
    echo "  bash $INFRA/scripts/vps-https-recreate-cert.sh $EMAIL"
    exit 1
  fi
  echo "Certificado OK — $issuer"
}

install_rate_limit_conf() {
  local src="$INFRA/nginx-host/meuzovo-rate-limit.conf"
  local dest="/etc/nginx/conf.d/meuzovo-rate-limit.conf"
  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "Rate limit: $dest"
  fi
}

write_nginx_config() {
  echo "=== NGINX ==="
  local template="$INFRA/nginx-host/app.granjauniao.com.br.conf"
  if [ -f "$template" ]; then
    cp "$template" "$CONF"
  else
    cat > "$CONF" << 'NGINX'
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
    ssl_prefer_server_ciphers off;
    client_max_body_size 10m;

    location = /api/pedido-site {
        limit_req zone=meuzovo_pedido_site burst=5 nodelay;
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
NGINX
  fi

  ln -sf "$CONF" "/etc/nginx/sites-enabled/$DOMAIN"
  rm -f /etc/nginx/sites-enabled/default
  install_rate_limit_conf
}

ensure_docker() {
  if [ ! -f "$INFRA/.env.prod" ]; then
    return
  fi
  if grep -q '^HTTP_PORT=80' "$INFRA/.env.prod"; then
    sed -i 's/^HTTP_PORT=80/HTTP_PORT=8080/' "$INFRA/.env.prod"
  fi
  cd "$INFRA"
  docker compose --env-file .env.prod -f docker-compose.prod.yml up -d web
}

start_nginx() {
  command -v ufw >/dev/null && { ufw allow 80/tcp >/dev/null 2>&1 || true; ufw allow 443/tcp >/dev/null 2>&1 || true; }
  echo "=== TESTE NGINX ==="
  nginx -t
  systemctl enable nginx
  systemctl restart nginx
  systemctl is-active nginx && echo "Nginx ativo"
}

run_tests() {
  echo "=== TESTES ==="
  curl -s "http://127.0.0.1:8080/api/health" || true
  echo ""
  curl -sk "https://127.0.0.1/api/health" -H "Host: $DOMAIN" || true
  echo ""
  curl -s "https://$DOMAIN/api/health" || true
  echo ""
  docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || true
}

fix_cert_symlinks
write_nginx_config
ensure_docker
start_nginx
run_tests

echo ""
echo "Fim. Abra: https://$DOMAIN"
