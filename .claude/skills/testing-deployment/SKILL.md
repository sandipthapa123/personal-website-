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

## Deployment (LiteSpeed Node on DirectAdmin)

The server is **not a git checkout** — it is an uploaded build tree. Deploy = build
locally, ship the built artifacts over SSH, restart.

- Host: `samanyay@dacloud.himalayan.host`, key `~/.ssh/thapasandip_deploy`
  (control panel is DirectAdmin on :2222 — a browser login is *not* needed to deploy).
- App root: `~/thapasandip-app`
- Runtime: LiteSpeed `lsnode` running `apps/backend/` and `apps/frontend/`.
  `apps/backend/app.js` → `require('./dist/main')`;
  `apps/frontend/app.js` → `next({ dev:false, dir:__dirname })` — i.e. the **regular**
  Next server, so `.next/` is what matters and `.next/standalone` is unused.
- Server DB is **MySQL**, and its `schema.prisma` is the `mysql` one — note this differs
  from the committed `postgresql` schema. Do not "fix" the server to match git.
- No `rsync` on the server; use `tar | ssh` or `scp` of a tarball.

### ⚠️ Build the frontend with the production API URL

`NEXT_PUBLIC_*` is **inlined at build time**, not read at runtime. Building without it
bakes in the `http://127.0.0.1:4000/api/v1` fallback, which nothing listens on in
production — every server-rendered page then silently falls back to the
"Loading backend render schema…" placeholder while still returning HTTP 200.

```bash
NEXT_PUBLIC_API_URL="https://api.thapasandip.com.np/api/v1" \
  npm --workspace=apps/frontend run build

# always confirm what got baked in:
grep -oE 'https://api\.thapasandip\.com\.np/api/v1|http://127\.0\.0\.1:4000/api/v1' \
  apps/frontend/.next/server/app/page.js
```

### Procedure

```bash
SSHK="-i $HOME/.ssh/thapasandip_deploy"
HOST=samanyay@dacloud.himalayan.host

# 0. back up what is live (restore = tar xzf it back into ~/thapasandip-app)
ssh $SSHK $HOST "cd ~/thapasandip-app && mkdir -p ~/deploy-backups && \
  tar czf ~/deploy-backups/pre-\$(date +%Y%m%d-%H%M%S).tar.gz \
  apps/backend/dist packages/utilities/dist apps/frontend/.next"

# 1. package (cache/trace/standalone are not needed and are ~65M of the 70M)
tar czf /tmp/deploy.tgz --exclude='.next/cache' --exclude='.next/trace' \
  --exclude='.next/standalone' \
  apps/backend/dist packages/utilities/dist apps/frontend/.next

# 2. ship + extract
scp $SSHK /tmp/deploy.tgz $HOST:~/deploy.tgz
ssh $SSHK $HOST "cd ~/thapasandip-app && tar xzf ~/deploy.tgz && rm ~/deploy.tgz"

# 3. restart both apps (LiteSpeed/Passenger restart hook)
ssh $SSHK $HOST "cd ~/thapasandip-app && touch apps/backend/tmp/restart.txt apps/frontend/tmp/restart.txt"
```

Only ship `packages/*/dist` for packages you actually changed. Schema changes
additionally need `npx prisma generate` + `npx prisma migrate deploy` on the server.

### Post-deploy verification (do not skip)

```bash
# backend really restarted, and reports the real engine
curl -s https://api.thapasandip.com.np/api/v1/health \
  | python -c "import sys,json;d=json.load(sys.stdin);print(d['services']['database']['engine'], d['systemMetrics']['uptimeSeconds'])"

# content API is authenticated (must be 401)
curl -s -o /dev/null -w '%{http_code}\n' https://api.thapasandip.com.np/api/v1/content

# homepage is dynamic AND actually rendered (not the placeholder)
curl -sD - -o /tmp/h.html https://thapasandip.com.np/ | grep -i 'x-nextjs-cache\|cache-control'
grep -c 'Loading backend render schema' /tmp/h.html   # must be 0
wc -c < /tmp/h.html                                   # ~56K when healthy, ~23K when falling back
```

A 200 response is not proof the page rendered — always check for the placeholder and
the byte size.

### Env

Backend: `DATABASE_URL` (mysql), `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`
(comma-separated, must include the public origin; wildcards are invalid with
`credentials: true`), `PORT`, `MAIL_*`.
Frontend: `NEXT_PUBLIC_API_URL` in `apps/frontend/.env.local` **and** exported for the
build (see above).

Never commit `.env`; it is gitignored and holds live mail credentials.
