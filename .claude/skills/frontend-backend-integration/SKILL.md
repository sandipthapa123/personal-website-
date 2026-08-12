---
name: frontend-backend-integration
description: Fix cases where backend content does not reach the public Next.js site — published articles not appearing, stale pages, wrong API base URL, CORS failures, or admin edits not showing. Use when the database and API are correct but the site shows old or missing content.
---

# Frontend ↔ backend integration

## Topology

The public site consumes **one endpoint family**: `/api/v1/renderer/page?slug=...`.
It does not call `/api/v1/content`. The admin console is served by NestJS, not Next.js.

- `apps/frontend/src/app/page.tsx` — homepage, plain `fetch`.
- `apps/frontend/src/app/[...slug]/page.tsx` — everything else, via `CmsApiClient`.

## 1. Stale content — check caching first

This is the usual cause of "I published it but the site doesn't show it".

```bash
curl -sD - -o /dev/null https://thapasandip.com.np/ | grep -i 'x-nextjs-cache\|cache-control'
```

- `x-nextjs-cache: HIT` + `s-maxage=31536000` → the route was statically rendered at
  build time and will never revalidate.
- `Cache-Control: private, no-store` → the route is dynamic; caching is not your bug.

**Fix:** every server-side fetch of admin-driven content must pass `cache: 'no-store'`.
Next 14 defaults to `force-cache`, which also forces the whole route static.

```ts
const res = await fetch(`${apiBase}/renderer/page?slug=/`, { cache: 'no-store' });
```

`CmsApiClient.getRenderPage` already sets it. Client components (`'use client'` +
`useEffect`, e.g. `HeaderNav`/`FooterNav`) fetch in the browser and are unaffected.

## 2. API base URL

`NEXT_PUBLIC_API_URL` is set to `https://api.thapasandip.com.np/api/v1`.
`CmsApiClient` **strips a trailing `/api/v1` and re-appends it**, so both the bare
origin and the prefixed form work. Do not "normalise" this into a double prefix.
Raw `fetch` call sites must append the path themselves — check whether the base already
carries `/api/v1` before adding it.

## 3. CORS

`main.ts` uses `origin: process.env.CORS_ORIGINS?.split(',')` with `credentials: true`.
A wildcard origin cannot work with credentials. The public origin must be listed
explicitly and comma-separated.

Browser symptom: the request succeeds in curl but fails in the browser with a CORS
message — check `CORS_ORIGINS` on the server, not the frontend.

## 4. Content is published but still absent

Walk the chain and stop at the first surprise:

```bash
# a) is it actually published and public?
curl -s -b /tmp/c.txt 'http://127.0.0.1:4000/api/v1/content?type=Article' \
  | python -c "import sys,json;[print(i['title'],i['status'],i['visibility']) for i in json.load(sys.stdin)['data']['items']]"

# b) does the renderer include it?
curl -s 'http://127.0.0.1:4000/api/v1/renderer/page?slug=/' | grep -c '<title>'
```

`RendererService` only includes `status === 'PUBLISHED'` items, and its detail route
requires the URL prefix to match `CONTENT_TYPE_PREFIX_MAP` (`articles/`, `poems/`, …).
An Article at `/poems/<slug>` will 404 by design.

## 5. Verifying in the browser

Use the Browser pane, not manual instructions to the user. Prefer text tools over
screenshots (screenshots need the pane visible):

- `read_page` for structure, `javascript_tool` to read computed values or table rows,
- `read_console_messages({onlyErrors:true})` and `read_network_requests` for failures.

## 6. After changing anything in `packages/*`

```bash
npm run build:packages          # both apps import the built dist, not the source
npm --workspace=apps/backend run build
cd apps/frontend && npx tsc --noEmit   # much faster than a full next build
```
