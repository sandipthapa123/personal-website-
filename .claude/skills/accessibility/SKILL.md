---
name: accessibility
description: Apply and verify WCAG 2.2 AAA plus NVDA/keyboard accessibility for this platform, covering both the Next.js public site and the server-rendered NestJS admin console. Use whenever adding or changing UI, tables, dialogs, forms, status badges or async data rendering.
---

# Accessibility (WCAG 2.2 AAA + NVDA)

The target is **AAA**, not AA. Both surfaces are in scope: the Next.js public site and
the HTML-string admin console in `apps/backend/src/modules/admin/admin.controller.ts`.

## Non-negotiables

- **Contrast** 7:1 for body text, 4.5:1 for large (≥18.66px bold / ≥24px). Check against
  the actual rendered background, including badges and disabled states.
- **Never convey meaning by colour alone.** Status badges must carry text
  (`PUBLISHED`, `DRAFT`, `ARCHIVED`) as well as a colour class.
- **Keyboard**: every interactive element reachable in a logical order, with a visible
  focus indicator. No positive `tabindex`. No keyboard traps.
- **Accessible names**: icon-only buttons need `aria-label`. Emoji glyphs used as icons
  must be `aria-hidden="true"` so NVDA does not read "wastebasket" mid-sentence.
- **Target size** ≥ 44×44 CSS px (WCAG 2.2 AAA 2.5.5). The admin's `btn-xs` row actions
  are the usual offender.
- Honour `prefers-reduced-motion` and `prefers-color-scheme`.

## Async data must be announced

A table that silently repopulates is an AAA failure. Results, errors and counts go
through a live region — `useAnnounce` on the frontend, and on the admin side an element
with `role="status"` (polite) or `role="alert"` (errors, assertive).

Empty states must state *why*: "No content found — adjust filters or create new content"
rather than a bare icon.

## Tables

- Real `<th scope="col">`; a caption or `aria-label` naming the table.
- Sortable headers expose `aria-sort` and are `<button>`s, not click handlers on `<th>`.
- Row selection checkboxes need individual labels; "select all" needs its own name.
- Pagination: mark the current page with `aria-current="page"` (already done in
  `renderPagination`).

## Dialogs

`role="dialog"` + `aria-modal="true"` + a labelling `aria-labelledby`. Focus moves into
the dialog on open, is trapped while open (`useFocusTrap`), `Escape` closes, and focus
returns to the invoking control — the admin JS keeps `_lastFocused` for this.

## Forms

Every input has a real `<label for>`. Errors are programmatically associated
(`aria-describedby`, `aria-invalid`), not just coloured. Required fields use `required`,
not only an asterisk. Autocomplete tokens on credential fields
(`autocomplete="username" | "current-password" | "one-time-code"`).

## Language and dates

- Nepali (Devanagari) content must be inside an element with `lang="ne"` so NVDA uses
  the right voice — critical here, since titles and bodies are frequently Nepali.
- Dual BS/AD dates come from `formatDualCalendarDate`. Do not abbreviate a BS date into
  a form a screen reader will mangle; keep the full "2083 Shrawan 27, Wednesday".

## Verification

```bash
cd apps/frontend && npx tsc --noEmit
```

Then in the Browser pane:

```js
// unlabelled interactive elements
[...document.querySelectorAll('button,a,input,select,textarea')]
  .filter(el => !el.textContent.trim() && !el.getAttribute('aria-label')
                && !el.getAttribute('aria-labelledby') && el.type !== 'hidden')
  .map(el => el.outerHTML.slice(0, 90));
```

Also: tab through the page and confirm focus is always visible; confirm every image has
`alt` (decorative ⇒ `alt=""`); confirm headings form a single logical hierarchy with one
`<h1>`. Manual NVDA passes are still required for AAA sign-off — automated checks catch
roughly a third of issues.
