---
name: database-data-flow
description: Trace and fix data problems through Prisma/MySQL in this CMS — wrong or missing counts, records that exist in the DB but not in the API, edits that do not persist, soft-delete/recycle-bin issues, slug collisions. Use when database state and what the UI shows disagree.
---

# Database & data-flow debugging

## Ground truth

- Prisma, provider **`mysql`** (`apps/backend/prisma/schema.prisma`). Ignore the
  PostgreSQL references in `docs/deploy-guide.md` and the stale `.env` `DATABASE_URL`.
- **Columns are `snake_case`; API fields are `camelCase`.** `mapPrismaToDto()` in
  `universal-content.service.ts` is the only translation point.
- `UniversalContent.content_type` is a **single string**, exposed as
  `contentTypes: string[]`. Only `contentTypes[0]` is stored.
- `UniversalContent.slug` has a **global UNIQUE** constraint.
- Soft delete = `deleted_at != null`. "Recycle Bin" is a view over that.

## Query the database directly

```bash
DB=.localdev/mariatmp/mariadb-11.4.5-winx64/bin/mariadb.exe
$DB -u root --port=3306 --protocol=tcp -e \
  "SELECT content_type, status, COUNT(*) FROM cms_db.UniversalContent
   WHERE deleted_at IS NULL GROUP BY content_type, status;"
```

If the database has rows and the API does not return them, the bug is in the `where`
clause or the request never succeeded — see the `backend-api-debugging` skill.

## The four recurring data bugs

### 1. Counts disagree with the table
The list query excludes soft-deleted rows; a count that omits `deleted_at: null`
will exceed it. Keep the same predicate on both sides. `getContentStats` uses
`active = { deleted_at: null }` everywhere except the dedicated `trash` figure.

### 2. Per-type counts
Use one `groupBy` and then seed **every** known type to 0, so a type with no rows still
renders `0` rather than a blank badge:

```ts
const counts: Record<string, number> = {};
SYSTEM_CONTENT_TYPES.forEach(t => { counts[t] = 0; });
grouped.forEach(r => { counts[r.content_type] = r._count._all; });
```

### 3. Edits that don't persist
`updateContent` builds `data` field-by-field. A field not explicitly copied is dropped
silently. When the editor gains a field, add it there. Guard the date semantics:
- publishing stamps `published_at` **only if not already set** (so edits don't bump it);
- unpublishing/archiving clears `published_at`;
- leaving `SCHEDULED` clears `scheduled_at`.

### 4. Slug collisions → 500
`ensureUniqueSlug(slug, tenantId, excludeId)` must check **both** `page` and
`universalContent`. Checking one table means duplicates are never detected and the
unique constraint throws on: a second item with the same title, and any repeat "Clone".
Pass `excludeId` on update so an item doesn't collide with itself.

## Sorting and filtering safety

Never interpolate a client value into `orderBy`/`where` keys. Map through a whitelist
and default safely (`UniversalContentService.SORTABLE_COLUMNS`). Clamp `page`/`limit`.

MySQL `contains` is case-insensitive under the default collation; do **not** add
Prisma's `mode: 'insensitive'` (unsupported on MySQL — it throws).

## Migrations

```bash
npx prisma generate --schema apps/backend/prisma/schema.prisma
npm --workspace=apps/backend run db:migrate     # prisma migrate dev
npm --workspace=apps/backend run db:seed
```

Always `prisma generate` after editing the schema, then rebuild the backend — the
running server uses the generated client and the compiled `dist`.

## Dates

Publication dates are rendered as dual Bikram Sambat / Gregorian via
`formatDualCalendarDate` in `@cms/utilities`. BS conversion uses a per-year
month-length table (BS 2000–2100); there is **no arithmetic shortcut**. Never hand-roll
a BS date or hardcode one as a fallback — omit the field when there is no real date.
