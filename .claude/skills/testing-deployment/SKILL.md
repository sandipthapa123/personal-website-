---
name: testing-deployment
description: Build, typecheck, test and verify this monorepo, run a local backend against the bundled MariaDB, exercise the full content workflow end to end, and deploy to cPanel. Use before claiming a change works and when preparing or diagnosing a production release.
---

# Testing, verification & deployment

## Build order (it matters)

Both apps import the **built** `packages/*/dist`, not the source.

```bash
npm run build:packages                     # constants → shared-types → … → api-client
npx prisma generate --schema apps/backend/prisma/schema.prisma
npm --workspace=apps/backend run build     # nest build
cd apps/frontend && npx tsc --noEmit       # far faster than a full `next build`
```

`npm run build` at the root does packages → backend → frontend. The frontend build is
slow (`experimental.cpus: 1`); prefer the typecheck during iteration.

## Tests

```bash
npm --workspace=apps/backend run test
```

Jest + ts-jest, `*.spec.ts` under `apps/backend/src`. The `allowJs` warnings about
`packages/utilities/dist/*.js` are pre-existing noise.

Regression coverage worth preserving: `universal-content.service.spec.ts` pins the
`sortBy` whitelist (an unmapped key must fall back to `updated_at`, never reach Prisma)
and the shape of `getContentStats` (per-type badges must include zero-count types).

## Local end-to-end verification

```bash
# 1. portable MariaDB (already provisioned; data in .localdev/mariadata)
.localdev/mariatmp/mariadb-11.4.5-winx64/bin/mariadbd.exe \
  --defaults-file=.localdev/mariadata/my.ini --port=3306 &

# 2. backend against it
DATABASE_URL="mysql://root@127.0.0.1:3306/cms_db" JWT_SECRET=dev JWT_REFRESH_SECRET=dev \
  PORT=4000 NODE_ENV=development node apps/backend/dist/main.js > /tmp/backend.log 2>&1 &

# 3. confirm it really restarted
curl -s http://127.0.0.1:4000/api/v1/health   # check uptimeSeconds is small
```

**Windows:** `pkill -f node` does not kill the server — use `taskkill //F //IM node.exe`.
A surviving old process silently serves stale code and makes a correct fix look broken.
Always confirm via `uptimeSeconds`.

## The workflow that must pass before shipping content changes

Authenticate first (the admin console uses a **cookie**):

```bash
curl -s -c /tmp/c.txt -X POST -H 'Content-Type: application/json' \
  -d '{"email":"<admin>","password":"<pw>"}' http://127.0.0.1:4000/admin/login
```

Then walk the chain, checking the observable effect at each step:

| Step | Call | Expect |
|---|---|---|
| Create | `POST /api/v1/content` | 200, slug generated |
| Same title again | `POST /api/v1/content` | 200 with `-1` suffix, **not** a 500 |
| Admin table | `GET /api/v1/content?...&sortBy=updatedAt&...` | 200, item listed |
| Counts | `GET /api/v1/content/stats` | `byType.Article` increments |
| Edit | `PUT /api/v1/content/:id` | type/locale/visibility actually persist |
| Publish | `POST /api/v1/content/:id/publish` | `publishedAt` set |
| Frontend | `GET /api/v1/renderer/page?slug=/` | item present, real dates/views |
| Unpublish | `POST /api/v1/content/:id/unpublish` | gone from renderer, `publishedAt` cleared |
| Delete | `DELETE /api/v1/content/:id` | appears in `/content/recycle-bin`, `trash` count up |
| Restore | `POST /api/v1/content/:id/restore` | back in the list |

Also confirm an unauthenticated `GET`/`POST` to `/api/v1/content` returns **401**.

Clean up afterwards if you used a shared database.

## Verifying the deployed site

```bash
curl -s https://api.thapasandip.com.np/api/v1/health          # engine should match the real DB
curl -sD - -o /dev/null https://thapasandip.com.np/ | grep -i 'x-nextjs-cache'
```

`x-nextjs-cache: HIT` on a content page means a server fetch lost its `cache: 'no-store'`
and the page is frozen at build time.

## Deployment (cPanel + Passenger)

Two Node apps: `apps/backend/app.js` (api subdomain) and `apps/frontend/app.js`.

1. Pull/upload code, `npm install`.
2. `npm run build` (packages → backend → frontend).
3. `npx prisma migrate deploy` for schema changes.
4. Restart **both** applications in cPanel.

Required env — backend: `DATABASE_URL` (mysql), `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`CORS_ORIGINS` (comma-separated, must include the public origin; wildcards are invalid
with `credentials: true`), `PORT`, `MAIL_*`.
Frontend: `NEXT_PUBLIC_API_URL=https://api.thapasandip.com.np/api/v1`.

Never commit `.env`; it is gitignored and contains live mail credentials.
