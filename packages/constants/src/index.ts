/**
 * @cms/constants - System Enums, Workflow States, and Permission Actions
 */

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PREVIEW = 'PREVIEW',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum SystemRoles {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  EDITOR = 'EDITOR',
  AUTHOR = 'AUTHOR',
  VIEWER = 'VIEWER',
}

export enum LayoutRegionKeys {
  HEADER = 'header',
  SIDEBAR = 'sidebar',
  MAIN = 'main',
  FOOTER = 'footer',
}

export enum BlockTypes {
  HERO = 'HERO',
  TIMELINE = 'TIMELINE',
  PUBLICATION_LIST = 'PUBLICATION_LIST',
  RESEARCH_LIST = 'RESEARCH_LIST',
  FAQ = 'FAQ',
  CONTACT_FORM = 'CONTACT_FORM',
  CARD_GRID = 'CARD_GRID',
  STATS = 'STATS',
  TEXT_BLOCK = 'TEXT_BLOCK',
  GALLERY = 'GALLERY',
}

export const PERMISSION_ACTIONS = {
  PAGES_READ: 'pages:read',
  PAGES_CREATE: 'pages:create',
  PAGES_EDIT: 'pages:edit',
  PAGES_PUBLISH: 'pages:publish',
  PAGES_DELETE: 'pages:delete',
  BLOCKS_MANAGE: 'blocks:manage',
  MEDIA_UPLOAD: 'media:upload',
  TOKENS_MANAGE: 'tokens:manage',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',
  AUDIT_READ: 'audit:read',
} as const;
