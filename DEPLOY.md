# Deploy Viral Engine Views on a Linode VPS

## Root cause that kept it offline

The repo was still documented for Vercel deployment, but the VPS had no active process manager entry, no nginx vhost pointing at the app, and nothing listening for traffic. There was also no clean production PM2 config checked in for a server deploy path.

## Runtime requirements

- Node.js 20+
- PM2 installed on the VPS
- nginx vhost/proxy configured to forward to the app port
- A reachable Supabase Postgres database
- Environment variables present in `/home/deployer/apps/viral-engine/.env`

## Required environment variables

See `.env.example` for the full list with notes. The app **will not boot without `JWT_SECRET`** (it throws on startup).

```bash
# Supabase: prefer the session/direct connection on port 5432 (the pg adapter
# can break against the transaction pooler on 6543 with pgbouncer=true).
DATABASE_URL=postgresql://postgres.<project-ref>:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
JWT_SECRET=          # REQUIRED — generate with: openssl rand -base64 48
VEV_ACCESS_CODE=     # only if keeping the legacy access-code gate
OPENAI_API_KEY=sk-...
FIRECRAWL_API_KEY=fc-...
NEXT_PUBLIC_APP_NAME=Viral Engine Views
PORT=3001
HOSTNAME=0.0.0.0
```

## App build and process setup

Run from `/home/deployer/apps/viral-engine`:

```bash
npm install
npx prisma migrate deploy   # provisions/updates the Supabase schema (required on first deploy)
npm run build
pm2 start ecosystem.config.js --update-env
pm2 save
```

> **First deploy:** without `prisma migrate deploy` the database has no tables and
> the app silently runs on empty in-memory fallbacks (nothing persists). Run it
> again after any schema change. (`npx prisma db push` is an alternative for
> environments without migration history.)

## Recommended nginx site

Point the live hostname to the Next.js app on port `3001`:

```nginx
server {
    server_name viralengineviews.com www.viralengineviews.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

After the site file is added:

```bash
sudo ln -s /etc/nginx/sites-available/viral-engine /etc/nginx/sites-enabled/viral-engine
sudo nginx -t
sudo systemctl reload nginx
```

## Verification

```bash
curl http://127.0.0.1:3001/api/health
curl -I https://viralengineviews.com
pm2 status viral-engine
```

Expected app health response:

```json
{"status":"ok","timestamp":"...","service":"viral-content-miner"}
```

## Troubleshooting

- Build fails: run `npm install` and re-run `npm run build`
- Lint fails: run `npm run lint` and fix reported issues
- App won't start / 500 on every request: ensure `JWT_SECRET` is set in `.env`
- Prisma/runtime issues: verify `DATABASE_URL` in `.env` and that `prisma migrate deploy` has been run
- Data never persists (always empty): the schema was never applied — run `npx prisma migrate deploy`
- Site still not public: nginx vhost or DNS is still missing/mispointed
