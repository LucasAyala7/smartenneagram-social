# Deploy — SmartEnneagram Social Factory

Fluxo completo pra subir o app na VPS Hostinger com domínio **sslip.io** (grátis, sem registro) + SSL Let's Encrypt.

---

## 0. Pré-requisitos

- VPS Hostinger com Ubuntu 22/24 (ou Debian)
- Acesso SSH (root ou sudo)
- IP público fixo da VPS
- GitHub repo privado com o código (ou você sobe via SFTP)

**Seu domínio sslip.io será:** `se-social.IP-COM-HIFENS.sslip.io`
Exemplo: VPS IP `123.45.67.89` → domínio `se-social.123-45-67-89.sslip.io`

---

## 1. Setup inicial da VPS (1x)

SSH na VPS como root:

```bash
ssh root@SEU_IP
```

Clona o repo (ou sobe via SFTP pra `/opt/smartenneagram`):

```bash
cd /opt
git clone https://github.com/SEU-USER/smartenneagram-social.git smartenneagram
cd smartenneagram
```

Roda o setup base (Node 22 + PM2 + Nginx + Postgres + Certbot + UFW):

```bash
chmod +x deploy/setup.sh
./deploy/setup.sh
```

---

## 2. Cria pasta de logs

```bash
mkdir -p /opt/smartenneagram/logs
```

---

## 3. Postgres — cria DB e user

```bash
sudo -u postgres psql
```

Dentro do psql:

```sql
CREATE DATABASE smartenneagram;
CREATE USER seapp WITH ENCRYPTED PASSWORD 'TROQUE_ESSA_SENHA';
GRANT ALL PRIVILEGES ON DATABASE smartenneagram TO seapp;
ALTER DATABASE smartenneagram OWNER TO seapp;
\c smartenneagram
GRANT ALL ON SCHEMA public TO seapp;
\q
```

Testa conexão:
```bash
psql -h 127.0.0.1 -U seapp -d smartenneagram
# digite a senha; \q pra sair
```

---

## 4. Configura .env de produção

```bash
cp .env.example .env
nano .env
```

Preenche:

```env
DATABASE_URL="postgresql://seapp:TROQUE_ESSA_SENHA@127.0.0.1:5432/smartenneagram"
ACERVO_PATH="/opt/smartenneagram/acervo"   # veja passo 5

JWT_SECRET="<cole aqui o hash gerado>"
# Gere rodando: npx tsx scripts/generate_jwt_secret.ts

LUCAS_EMAIL="lucasayalla@gmail.com"
LUCAS_PASSWORD_HASH="<hash bcrypt da sua senha>"
LUCAS_NAME="Lucas"

SAMARA_EMAIL="samara@exemplo.com"
SAMARA_PASSWORD_HASH="<hash bcrypt da senha dela>"
SAMARA_NAME="Samara"

ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
AI_PROVIDER_DEFAULT="hybrid"
AI_MODEL_CLAUDE="claude-opus-4-7"
AI_MODEL_GPT="gpt-4o"
```

**Gerar JWT_SECRET:**
```bash
cd /opt/smartenneagram
npx tsx scripts/generate_jwt_secret.ts
```

**Gerar hash de senha:**
```bash
npx tsx scripts/hash_password.ts "senha-do-lucas"
npx tsx scripts/hash_password.ts "senha-da-samara"
```

> ⚠️ **Importante:** o hash começa com `$2a$...`. No `.env` do Next, **escape cada `$` com `\$`** dentro de aspas duplas:
> ```env
> LUCAS_PASSWORD_HASH="\$2a\$10\$..."
> ```
> O script `hash_password.ts` já imprime a versão escapada pronta pra colar.

---

## 5. Acervo de citações (9 JSONs)

O acervo local tá em `C:\Users\lucas 1\Desktop\LUCAS\lps\acervo enneagram\output\`.

Sobe pra VPS:

```bash
# Do seu PC (git-bash ou powershell):
scp -r "C:\Users\lucas 1\Desktop\LUCAS\lps\acervo enneagram\output" root@SEU_IP:/opt/smartenneagram/acervo
```

Confere que tem 9 arquivos:
```bash
ls /opt/smartenneagram/acervo/*.json | wc -l   # deve ser 9
```

---

## 6. Primeiro deploy

```bash
cd /opt/smartenneagram
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

Se tudo deu certo, o app tá rodando em `http://localhost:3030` dentro da VPS.

Seed das citações (1ª vez):
```bash
npx tsx prisma/seed.ts
```

**Opcional — migrar dados locais pro Postgres:**
Se você quiser preservar os posts/configs que já criou localmente:
```bash
# Copia o dev.db do seu PC pra VPS:
# scp "C:\Users\lucas 1\Desktop\LUCAS\lps\social_media\smartenneagram\prisma\dev.db" root@SEU_IP:/opt/smartenneagram/prisma/dev.db

# Roda a migração:
SOURCE_SQLITE_URL="file:./prisma/dev.db" \
TARGET_POSTGRES_URL="$DATABASE_URL" \
npx tsx scripts/migrate_sqlite_to_postgres.ts
```

---

## 7. Nginx + SSL

Substitui `SERVER_NAME` no conf pelo seu sslip.io:

```bash
SERVER_NAME="se-social.123-45-67-89.sslip.io"   # troque pro seu IP com hífens
sed "s/SERVER_NAME/$SERVER_NAME/g" deploy/nginx.conf.example > /etc/nginx/sites-available/smartenneagram-social
ln -sf /etc/nginx/sites-available/smartenneagram-social /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Emite certificado SSL Let's Encrypt:

```bash
certbot --nginx -d $SERVER_NAME --non-interactive --agree-tos --email lucasayalla@gmail.com --redirect
```

Certbot vai reconfigurar o nginx pra HTTPS automaticamente.

---

## 8. PM2 startup

Pra o PM2 iniciar sozinho no boot da VPS:

```bash
pm2 save
pm2 startup systemd
# cola o comando que o PM2 te mostra e executa
```

---

## 9. Testa

Do seu navegador:
```
https://se-social.123-45-67-89.sslip.io
```

Vai redirecionar pra `/login`. Loga com suas credenciais.

---

## 10. Updates futuros

Cada vez que editar código no seu PC:

```bash
# no PC:
git add . && git commit -m "update" && git push

# na VPS:
ssh root@SEU_IP "cd /opt/smartenneagram && ./deploy/deploy.sh"
```

Só isso.

---

## Troubleshooting

| Problema | Fix |
|---|---|
| `502 Bad Gateway` | `pm2 logs smartenneagram-social` — ver se o app subiu |
| Login não funciona | Checar `JWT_SECRET` no `.env` (mínimo 32 chars) + hash das senhas |
| `nginx: [emerg]` | `nginx -t` e ler o erro; ssl_certificate path pode estar errado |
| Certbot falha | Verifica que DNS do sslip.io aponta pro IP (`dig se-social.IP.sslip.io`). Firewall tem que permitir 80/443 |
| Prisma `P1001` | Postgres não acessível. `systemctl status postgresql` |
| Seed falha | `ACERVO_PATH` no `.env` + existência dos 9 arquivos JSON |
| Samara não consegue acessar | Verifica que a senha está bcrypt hash no `.env` (começa com `$2a$`) |

---

## Comandos úteis

```bash
pm2 status                          # status apps
pm2 logs smartenneagram-social      # logs ao vivo
pm2 restart smartenneagram-social
pm2 stop smartenneagram-social
pm2 monit                           # CPU/mem em tempo real

systemctl status nginx postgresql   # status serviços
nginx -t && systemctl reload nginx

# renovação SSL (auto via cron — só checar)
certbot renew --dry-run
```
