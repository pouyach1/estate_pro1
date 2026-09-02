# Astoria Elite Estates — Production Runbook

## Overview

Astoria runs as a single Express server with MongoDB. In production/staging, the built Vite output (`dist/`) is served by Express when `SERVE_STATIC=true`.

---

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Minimum 32 characters; must not be a known weak value |
| `PORT` | No | Default `5000` |
| `NODE_ENV` | Recommended | Set to `production` on staging/production |
| `SERVE_STATIC` | Staging/Prod | Set to `true` to serve `dist/` + API from one process |
| `CORS_ORIGIN` | Conditional | Required in production when `SERVE_STATIC` is not `true` |

### Example `.env` (staging)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://user:pass@host:27017/astoria_elite
JWT_SECRET=<long-random-string-at-least-32-chars>
SERVE_STATIC=true
```

When `SERVE_STATIC=true`, the frontend and API share the same origin — CORS is not required.

---

## Demo Seed (NOT for production startup)

Demo data reset **only** runs when explicitly enabled:

```bash
DEMO_SEED=true npm run seed
```

This **deletes and recreates** demo collections. Never set `DEMO_SEED=true` in production environment variables.

Demo credentials (after seed):
- Username: `admin@astoria.local`
- Password: `AstoriaDemo2026!`

---

## Build

From project root:

```bash
npm install
npm run build
```

Output: `dist/` (multi-page: homepage, property detail, admin, 404)

---

## Start Production / Staging

```bash
cd server
npm install
npm run start:prod
```

Or manually:

```bash
npm run build
cd server && NODE_ENV=production SERVE_STATIC=true node server.js
```

The server exits immediately if:
- `MONGODB_URI` or `JWT_SECRET` is missing
- `JWT_SECRET` is weak or shorter than 32 characters
- `SERVE_STATIC=true` but `dist/` does not exist

---

## Health Check

```bash
curl http://localhost:5000/api/health
```

Expected (healthy):

```json
{"status":"ok","database":"connected","version":"1.0.0","static":true}
```

---

## MongoDB Backup (recommended)

### Export

```bash
mongodump --uri="$MONGODB_URI" --out=./backup-$(date +%Y%m%d)
```

### Restore

```bash
mongorestore --uri="$MONGODB_URI" --drop ./backup-YYYYMMDD
```

Use `--drop` only when intentionally replacing data.

---

## Smoke Tests

### Development (Vite + API)

```bash
# Terminal 1
cd server && npm start

# Terminal 2
npm run dev

# Terminal 3
node scripts/production-smoke-qa.mjs
node scripts/intelligence-smoke-qa.mjs
node scripts/conversion-smoke-qa.mjs
```

### Staging / Production mode

```bash
npm run build
node scripts/staging-smoke-qa.mjs
```

---

## Routes (production with `SERVE_STATIC=true`)

| Path | Serves |
|------|--------|
| `/` | Homepage |
| `/property/` | Property detail |
| `/admin/` | Admin login |
| `/admin/dashboard.html` | Admin dashboard |
| `/api/*` | Express API |
| `/uploads/*` | Uploaded media |
| Unknown paths | Branded `404.html` |

---

## Security Notes

- Admin APIs require `Authorization: Bearer <token>`
- Public lead creation (`POST /api/customers`) returns only confirmation — no internal lead data
- Settings updates accept only allowlisted keys
- Uploads: image/video MIME + extension validation, 25MB max
- Production API errors do not expose stack traces or internal paths
