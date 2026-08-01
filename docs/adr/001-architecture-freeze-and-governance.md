# ADR 001: Architecture Freeze & Project Governance Rules

- **Status**: Approved
- **Date**: 2026-08-01
- **Deciders**: Software Architect & Project Lead

---

## Context

The architecture for the **Platform-Driven Multi-Tenant CMS Platform** (`thapasandip.com.np`) has reached a complete, 10/10 enterprise baseline comprising 14 core foundation engines, CQRS-lite, pluggable driver abstractions, a shared package monorepo layer, rendering contracts, and component manifests.

To preserve enterprise code quality, prevent scope creep, and ensure maintainability throughout implementation, strict governance rules must be enforced.

---

## Decisions & Governance Rules

### 1. Architecture Freeze Policy
The baseline architecture is frozen. Additions or modifications are permitted only if they fix a critical flaw, improve security, improve accessibility, improve scalability, or reduce unnecessary complexity.

### 2. Definition of Done (DoD)
Every engine phase is complete only when it contains:
- Complete implementation (zero placeholders or TODOs).
- Unit tests & Integration tests passing.
- Accessibility verification (WCAG 2.2 AAA standards).
- API & Developer documentation updated.
- Database migration scripts & Changelog entry.

### 3. Coding Standards
- Strict TypeScript (`"strict": true`, no explicit/implicit `any` types).
- Dependency injection across NestJS services.
- Shared Zod validation schemas across FE & BE via `packages/validation`.
- JSDoc/TSDoc on all public API methods.

### 4. Performance & Security Budgets
- **Frontend**: Lighthouse Performance ≥95, Accessibility = 100, Best Practices ≥95, SEO ≥95.
- **Backend**: API p95 response < 100ms for common endpoints.
- **Security**: Mandatory input validation, SQL injection prevention (Prisma), Helmet security headers, CSRF cookies, rate limiting, and audit logging.

### 5. Phase Gates
Phase N+1 cannot begin until Phase N passes implementation, testing, accessibility, security, and documentation gates.

---

## Consequences

- Prevents architectural erosion during development.
- Ensures all engines built are production-ready from day one.
