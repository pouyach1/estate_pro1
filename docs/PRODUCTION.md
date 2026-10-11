# Astoria Elite Estates — Production Runbook

## Overview

Astoria runs as **one Node.js process**: Express serves the API, `/uploads`, and the Vite-built frontend from `dist/` when `SERVE_STATIC=true` (forced by `npm start` / `server/start-prod.js`).

- Frontend: Vite multi-page app under `public/` → build output `dist/`
- Backend: Express + Mongoose (MongoDB required)
- Frontend API calls already use same-origin relative paths (`/api/...`)

There is **no** JSON/file database adapter in this repository. The app cannot start without a reachable `MONGODB_URI`.

---

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | **Yes** | MongoDB connection string. Must **not** be `localhost` / `127.0.0.1` when `NODE_ENV=production`. |
| `JWT_SECRET` | **Yes** | ≥ 32 characters; must not be a known weak value |
| `PORT` | Usually yes on PaaS | Listen port (Parspack typically injects this) |
| `HOST` | No | Bind address; default `0.0.0.0` |
| `NODE_ENV` | Recommended | `production` on the host |
| `SERVE_STATIC` | Forced by `npm start` | `true` serves `dist/` + API from one process |
| `SITE_ORIGIN` | Recommended | Public origin, e.g. `https://your-domain.example` (no trailing slash) |
| `CORS_ORIGIN` | Conditional | Required in production only when `SERVE_STATIC` is **not** `true` |
| `DEMO_SEED` | **Must stay unset** | If `true` in production, startup fails (destructive seed) |

Secrets belong in the hosting panel or `server/.env` (gitignored). Never commit real values.

---

## Persistence limits (honest)

| Concern | Reality |
|---------|---------|
| Application data (properties, admins, leads, settings, agents) | **MongoDB only** — no file-based fallback in code |
| Running without an external/hosted MongoDB | **Not supported** by this codebase |
| Uploaded media (`server/uploads/`) | Stored on local disk; **may be lost on redeploy** unless the host provides persistent disk |
| In-memory storage | Not used (and must not be used) |

If Parspack (or another provider) does not give you a MongoDB URI, the production server will exit during startup. Do not set `DEMO_SEED=true` in production.

---

## Install / build / start (reproducible)

From the **repository root**:

```bash
# 1) Install root deps + server deps (postinstall runs: npm install --prefix server --omit=dev)
npm install

# 2) Build frontend into dist/
npm run build

# 3) Start single process (sets NODE_ENV default + SERVE_STATIC=true)
npm start
```

Equivalent:

```bash
npm install
npm run build
node server/start-prod.js
```

Development (two processes) remains available:

```bash
# Terminal A
npm run server:dev

# Terminal B
npm run dev
```

The server exits immediately if:

- `MONGODB_URI` or `JWT_SECRET` is missing / invalid
- `MONGODB_URI` points to localhost in production
- `DEMO_SEED=true` in production
- `SERVE_STATIC=true` but `dist/` does not exist

---

## Parspack Node.js panel — exact commands

Do **not** assume Parspack runs these automatically. Configure them explicitly:

| Panel field | Value |
|-------------|--------|
| **Install / setup** | `npm install` |
| **Build** | `npm run build` |
| **Start** | `npm start` |
| **Node version** | 18+ (LTS recommended) |
| **Application root** | Repository root (not `server/` alone) |

Notes for the install step:

- Root `npm install` also runs `postinstall` → `npm install --prefix server` so Express/Mongoose deps are installed.
- `vite` is listed under `dependencies` (not only `devDependencies`) so `npm run build` still works when the host sets `NODE_ENV=production` during install.
- If your panel offers a separate “install command”, keep it as `npm install` at the **repository root**.

Environment variables to set in the panel (names only):

1. `MONGODB_URI` — **mandatory** (real host URI from whatever MongoDB you have access to; not localhost)
2. `JWT_SECRET` — **mandatory** (long random string, ≥ 32 chars)
3. `NODE_ENV=production` — recommended
4. `SITE_ORIGIN=https://YOUR_DOMAIN` — recommended
5. `PORT` — usually injected by Parspack; do not hardcode if the panel provides it
6. Do **not** set `DEMO_SEED`

After deploy, health check:

```bash
curl https://YOUR_DOMAIN/api/health
```

Expected healthy shape:

```json
{"status":"ok","database":"connected","version":"1.0.0","static":true}
```

---

## Resource notes (~250 mCPU / 512 MB RAM)

- Do not run `vite` / `npm run dev` in production
- Production start uses a small MongoDB pool (`maxPoolSize: 5`)
- Avoid running seed scripts on the live process
- Prefer Node 18+ LTS

Optional (panel / process env), if the host allows:

```bash
NODE_OPTIONS=--max-old-space-size=384
```

---

## Demo Seed (local / staging only — NOT production startup)

```bash
DEMO_SEED=true npm run seed
```

This **deletes and recreates** demo collections. Never set `DEMO_SEED=true` in production environment variables.

---

## Health Check

```bash
curl http://127.0.0.1:$PORT/api/health
```

---

## SEO Endpoints

| Path | Description |
|------|-------------|
| `/api/site` | Public site metadata |
| `/sitemap.xml` | Dynamic sitemap |
| `/robots.txt` | Crawl rules + sitemap reference |

Set `SITE_ORIGIN` in production for correct canonical URLs.

---

## Routes (production with `SERVE_STATIC=true`)

| Path | Serves |
|------|--------|
| `/` | Homepage (`dist/index.html`) |
| `/property/` | Property detail |
| `/properties/` | Listings |
| `/admin/` | Admin login |
| `/admin/dashboard.html` | Admin dashboard |
| `/api/*` | Express API (JSON; never HTML fallback) |
| `/uploads/*` | Uploaded media |
| Unknown non-API paths | Branded `404.html` |

---

## Security Notes

- Admin APIs require `Authorization: Bearer <token>`
- Public lead creation (`POST /api/customers`) returns only confirmation
- Settings updates accept only allowlisted keys
- Uploads: image/video MIME + extension validation, 25MB max
- Production API errors do not expose stack traces
