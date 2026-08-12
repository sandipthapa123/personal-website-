# CLAUDE.md — thapasandip.com.np CMS Platform

Guidance for Claude Code working in this repository. Keep it current; prefer editing
this file and the skills in `.claude/skills/` over re-deriving the same facts.

---

## 1. Architecture (read this before searching the codebase)

npm-workspaces monorepo. Node >= 20.

```
apps/backend    NestJS (Express) — REST API *and* the server-rendered admin console
apps/frontend   Next.js 14 App Router (standalone output) — public site only
packages/*      constants, shared-types, ui-contracts, validation, design-tokens,
                accessibility, utilities, api-client  (built before either app)
```

**The single most surprising fact: the admin panel is not a React app.**
It is server-rendered HTML strings inside `apps/backend/src/modules/admin/admin.controller.ts`
(~2400 lines), with vanilla-JS `fetch()` calls embedded in `<script>` tags. There is
**no TanStack Query, no Redux, and no `/admin` route in Next.js**. Do not look for admin
UI under `apps/frontend`.

### Request paths

| Surface | URL | Served by |
|---|---|---|
| Public site | `https://thapasandip.com.np` | Next.js |
| REST API | `https://api.thapasandip.com.np/api/v1/*` | NestJS |
| Admin console | `https://api.thapasandip.com.np/admin/*` | NestJS (HTML) |

`main.ts` sets a global prefix `api/v1` and **excludes** `admin`, `admin/(.*)`, the
sitemaps, `robots.txt` and the feeds. Admin browser JS calls `/api/v1/...` as a
same-origin relative URL, so its session cookie is sent automatically.

### Frontend data flow

- `apps/frontend/src/app/page.tsx` — homepage; fetches `/renderer/page?slug=/`.
- `apps/frontend/src/app/[...slug]/page.tsx` — every other page, via `CmsApiClient`.
- The public site talks to **exactly one endpoint family**: `/api/v1/renderer/page`.
  It does **not** consume `/api/v1/content` over HTTP.
- `RendererService` composes block schemas server-side; `DynamicPageRenderer` +
  `BlockRegistry` map block `type` strings to React components.

### Database

- Prisma. **Provider is `mysql`** (`apps/backend/prisma/schema.prisma`). It was
  previously postgresql and then sqlite — ignore `docs/deploy-guide.md` where it says
  PostgreSQL, and ignore the `.env` `DATABASE_URL` which still shows a postgres URL.
- **All columns are `snake_case`; all DTO/API fields are `camelCase`.**
  `mapPrismaToDto()` in `universal-content.service.ts` is the only translation layer.
  This mismatch is the source of a whole class of bugs — see §3.
- `UniversalContent.content_type` is a **single string column**, but the DTO exposes
  `contentTypes: string[]`. Only `contentTypes[0]` is persisted.
- `UniversalContent.slug` carries a **global UNIQUE constraint**.
- Soft delete is `deleted_at != null` (the "Recycle Bin").

---

## 2. Conventions

- **Auth**: `@UseGuards(AuthGuard('jwt'), PolicyGuard)` + `@RequirePolicy(PERMISSION_ACTIONS.X)`.
  `PolicyGuard` is a **no-op when no `@RequirePolicy` is present**, so a class-level
  guard pair gives "must be logged in" and per-route decorators add permissions.
- The JWT strategy accepts **either** a bearer header **or** the `access_token` cookie
  (`jwt.strategy.ts`), which is what lets the cookie-based admin console call the API.
- `SUPER_ADMIN` / `TENANT_ADMIN` bypass all policy checks (`policy-evaluator.service.ts`).
- Every live token is also tracked in the `Session` table so it can be revoked before
  its JWT expiry. Signature validity alone is never sufficient.
- `ValidationPipe` runs with `whitelist` + `forbidNonWhitelisted: true`. Untyped
  `@Query()` params are fine; DTO-bound bodies reject unknown keys.
- Response envelope: `{ success, data, ... }`. Admin JS checks `d.success` and silently
  renders an empty state otherwise — so a 4xx/5xx looks like "no data", never an error.

---

## 3. Debugging rules (learned the hard way)

**A blank admin table almost never means an empty database.** The admin JS does
`.catch(function(){ renderRows([]); })`. Always reproduce the *exact* URL the UI sends
with curl before touching any UI code:

```bash
curl -s -w '\n[%{http_code}]' \
  'https://api.thapasandip.com.np/api/v1/content?page=1&limit=20&sortBy=updatedAt&sortOrder=desc&type=Article'
```

Rules:

1. **Never pass a client-supplied key straight into Prisma `orderBy`/`where`.** Map it
   through a whitelist (`UniversalContentService.SORTABLE_COLUMNS`). An unknown key
   throws and becomes a 500, which the UI renders as "No content found".
2. **camelCase in, snake_case out.** Anything crossing the API boundary needs explicit
   mapping. Check `mapPrismaToDto` and the `orderBy` whitelist first.
3. **When a save "does nothing", read the update method.** `updateContent` builds a
   partial `data` object field-by-field; a field that is not explicitly copied is
   silently dropped. Adding a field to the editor means adding it there too.
4. **Slug uniqueness must be checked against `universalContent` *and* `page`.**
   `SlugGeneratorService.ensureUniqueSlug` covers both; checking only one table causes
   unique-constraint 500s on duplicate titles and repeat "Clone".
5. **Distrust impressive numbers.** This codebase has repeatedly shipped hardcoded
   metrics (a 96/100 SEO score on an empty site, `views || 4890`). If a figure looks
   good on an empty database, grep for the literal.
6. **Verify against a real process.** On Windows, `pkill -f node` does **not** kill the
   server; use `taskkill //F //IM node.exe`. A stale process silently serves old code
   and makes a correct fix look broken.

### Local verification loop

```bash
# 1. MariaDB (portable, already provisioned)
.localdev/mariatmp/mariadb-11.4.5-winx64/bin/mariadbd.exe --defaults-file=.localdev/mariadata/my.ini --port=3306 &

# 2. build + run backend against it
npm run build:packages && npm --workspace=apps/backend run build
DATABASE_URL="mysql://root@127.0.0.1:3306/cms_db" JWT_SECRET=dev JWT_REFRESH_SECRET=dev \
  PORT=4000 node apps/backend/dist/main.js

# 3. authenticate (admin console uses a cookie, not a bearer token)
curl -s -c /tmp/c.txt -X POST -H 'Content-Type: application/json' \
  -d '{"email":"lafasandip15@gmail.com","password":"Sandip@123"}' \
  http://127.0.0.1:4000/admin/login

# 4. then curl any admin endpoint with -b /tmp/c.txt
```

Changing anything in `packages/*` requires `npm run build:packages` **and** a backend
rebuild+restart — the backend imports the built `dist`, not the source.

---

## 4. Accessibility (non-negotiable)

Target is **WCAG 2.2 AAA** with NVDA and keyboard-only operation.

- Contrast: 7:1 body text, 4.5:1 large text. Never signal state by colour alone.
- Every interactive element needs a visible focus indicator and an accessible name.
- Dialogs trap focus (`useFocusTrap`), close on `Escape`, and restore focus to the
  invoking element (`_lastFocused` in admin JS).
- Async results are announced via a live region (`useAnnounce`); a table that silently
  repopulates is a failure.
- Tables need real `<th scope>`; status must never be conveyed by badge colour alone —
  the badge also carries text (`PUBLISHED`, `DRAFT`).
- Keep `prefers-reduced-motion` and `prefers-color-scheme` honoured.
- Dual Bikram Sambat / Gregorian dates come from `formatDualCalendarDate` in
  `@cms/utilities` — never format BS dates by hand (see §5).

---

## 5. Known traps

- **BS date conversion** uses a per-year month-length table (`packages/utilities/src/date-converter.ts`),
  covering BS 2000–2100. There is no arithmetic shortcut; an earlier `year + 56`
  approximation was wrong by a year and several months. All three of AD/BS/NPT are
  rendered from the **Nepal-local** wall clock (UTC+05:45).
- `getRecycleBin` must filter in SQL (`status: 'RECYCLE_BIN'`), not by filtering a
  default-paginated page in JS.
- Redirects live **in memory** (`RedirectManagerService`), not in the database.
- `SearchIndex` is only written by explicit `indexEntity()` calls and is effectively
  empty; `SearchService` therefore falls back to querying `UniversalContent` directly.
- `next.config.mjs` uses `output: 'standalone'` and `experimental.cpus: 1`. The frontend
  build is slow; prefer `npx tsc --noEmit` in `apps/frontend` for a quick check.

### Next.js caching

Server-side fetches of admin-driven content **must** pass `cache: 'no-store'`.
Next 14 defaults to `force-cache`, which statically renders the route and serves it
with `s-maxage=31536000` — newly published content then never appears until a rebuild.
`CmsApiClient.getRenderPage` already does this; the homepage in `page.tsx` must too.

Confirm with:

```bash
curl -sD - -o /dev/null https://thapasandip.com.np/ | grep -i 'x-nextjs-cache\|cache-control'
```

`x-nextjs-cache: HIT` on a content page means the bug is back.

---

## 6. Production

- cPanel + Phusion Passenger, two Node apps (`apps/backend/app.js`, `apps/frontend/app.js`).
- Required backend env: `DATABASE_URL` (mysql), `JWT_SECRET`, `JWT_REFRESH_SECRET`,
  `CORS_ORIGINS`, `PORT`, `MAIL_*`.
- Required frontend env: `NEXT_PUBLIC_API_URL=https://api.thapasandip.com.np/api/v1`.
  `CmsApiClient` strips a trailing `/api/v1` and re-appends it, so both the bare origin
  and the prefixed form work — do not "fix" one of them into a double prefix.
- `CORS_ORIGINS` is comma-separated and must include the public origin;
  `credentials: true` is set, so a wildcard origin will not work.
- Deploy = `npm run build` (packages → backend → frontend) then restart both apps.

---

## 7. Working agreement — token and context preservation

The point is to avoid re-discovering what is already written down.

- **Read this file and the relevant skill first.** Do not re-explore the tree to
  rediscover facts recorded here.
- **Search, don't read.** Prefer `Grep`/`Glob` with a targeted pattern over opening
  whole files. `admin.controller.ts` is ~2400 lines — always read it by line range.
- **Reproduce before reading.** One curl against the failing endpoint usually localises
  a bug faster than reading a module.
- **Reuse findings within a session**; do not re-run an investigation already done.
- **Write new durable findings back here** (or into a skill) instead of leaving them in
  the conversation.
- Do not spawn subagents for work that fits in a couple of targeted searches.
- **Never trade correctness for brevity.** Always run the build, the tests and a real
  request against a running server before claiming something works.
