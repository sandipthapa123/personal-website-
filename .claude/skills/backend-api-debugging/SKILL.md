---
name: backend-api-debugging
description: Diagnose failing or empty NestJS API endpoints in this CMS (500s, 401s, blank admin tables, wrong counts). Use when an admin screen shows no data, an endpoint returns an error, or a figure looks wrong. Covers reproducing with curl against a cookie session, the Prisma snake_case/camelCase trap, and guard/ValidationPipe behaviour.
---

# Backend / API debugging

## Rule zero

**An empty admin table is a failed request until proven otherwise.** The admin JS ends
every fetch with `.catch(function(){ renderRows([]); })` and gates on `d.success`, so a
500, a 401 and a genuinely empty result all render identically. Reproduce the exact URL
before reading any code.

## 1. Get a session

The admin console authenticates with an **httpOnly cookie**, not a bearer token.

```bash
curl -s -c /tmp/c.txt -X POST -H 'Content-Type: application/json' \
  -d '{"email":"<admin-email>","password":"<password>"}' \
  http://127.0.0.1:4000/admin/login
```

Then pass `-b /tmp/c.txt` on every subsequent call. `jwt.strategy.ts` reads
`Authorization: Bearer` **or** `cookies.access_token`, so either works.

## 2. Reproduce the exact request

Copy the URL the UI builds (search `admin.controller.ts` for the `fetch(` call), don't
approximate it. The default admin list request is:

```bash
curl -s -b /tmp/c.txt -w '\n[%{http_code}]' \
  'http://127.0.0.1:4000/api/v1/content?page=1&limit=20&sortBy=updatedAt&sortOrder=desc&type=Article'
```

Interpreting the status:

| Status | Look at |
|---|---|
| 500 | Prisma rejected something — check the server log for `Invalid ... invocation` |
| 401 | Missing/expired cookie, or a revoked row in `Session` |
| 403 | `PolicyGuard` — the route's `@RequirePolicy` vs the user's roles/permissions |
| 400 | `ValidationPipe` (`forbidNonWhitelisted`) rejected an unknown body key |
| 200 + `[]` | genuinely empty, or a `where` clause that is too narrow |

## 3. The recurring root causes

1. **Client key passed straight to Prisma.** `orderBy: { [sortBy]: order }` throws on any
   key that is not a column. Columns are `snake_case`; the UI sends `camelCase`. Always
   map through a whitelist and fall back to a safe default — see
   `UniversalContentService.SORTABLE_COLUMNS`.
2. **Field silently dropped on update.** `updateContent` copies fields one by one into a
   `data` object. Anything not explicitly copied is not saved, with no error.
3. **Unique-constraint 500.** `UniversalContent.slug` is globally unique.
   `ensureUniqueSlug` must check `universalContent` *and* `page`.
4. **Hardcoded values.** Before believing a metric, grep for the literal
   (`grep -rn "totalArticles: 0\|views ||\|seoHealthScore: 9" apps/backend/src`).
5. **Counts that disagree with the table.** The list excludes `deleted_at != null`; make
   sure the matching count does too.

## 4. Read the server log

```bash
tail -40 /tmp/backend.log | grep -iE 'error|constraint|invocation'
```

Prisma reports the offending model and constraint by name — that usually names the bug.

## 5. Verify the fix for real

Rebuild, **fully stop the old process**, restart, re-run the curl.

```bash
npm --workspace=apps/backend run build
taskkill //F //IM node.exe        # Windows: pkill -f node does NOT work
```

A stale process serving old code is the most common reason a correct fix "doesn't work".
Confirm the restart via `uptimeSeconds` in `/api/v1/health`.
