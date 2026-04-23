#!/usr/bin/env bash
# =====================================================
# setup.sh — configura VPS do zero (Ubuntu/Debian)
# Rode UMA VEZ após conectar na VPS por SSH
# =====================================================
set -e

echo "==> 1. Atualizando pacotes..."
apt update && apt upgrade -y

echo "==> 2. Instalando Node 22 (NodeSource)..."
if ! command -v node >/dev/null || [ "$(node -v | grep -oP '\d+' | head -1)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
node -v
npm -v

echo "==> 3. Instalando PM2 global..."
npm install -g pm2

echo "==> 4. Instalando Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx

echo "==> 5. Instalando PostgreSQL 16..."
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql

echo "==> 6. Instalando certbot (Let's Encrypt)..."
apt install -y certbot python3-certbot-nginx

echo "==> 7. Firewall (UFW)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo ""
echo "================================================"
echo " Setup base concluído."
echo ""
echo " Próximo: criar o DB postgres e o app user."
echo " Rode os comandos do DEPLOY.md seção '3. Postgres'."
echo "================================================"
