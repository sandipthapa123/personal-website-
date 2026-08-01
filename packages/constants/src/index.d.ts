/**
 * @cms/constants - System Enums, Workflow States, and Permission Actions
 */
export declare enum ContentStatus {
    DRAFT = "DRAFT",
    PREVIEW = "PREVIEW",
    REVIEW = "REVIEW",
    APPROVED = "APPROVED",
    SCHEDULED = "SCHEDULED",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare enum SystemRoles {
    SUPER_ADMIN = "SUPER_ADMIN",
    TENANT_ADMIN = "TENANT_ADMIN",
    EDITOR = "EDITOR",
    AUTHOR = "AUTHOR",
    VIEWER = "VIEWER"
}
export declare enum LayoutRegionKeys {
    HEADER = "header",
    SIDEBAR = "sidebar",
    MAIN = "main",
    FOOTER = "footer"
}
export declare enum BlockTypes {
    HERO = "HERO",
    TIMELINE = "TIMELINE",
    PUBLICATION_LIST = "PUBLICATION_LIST",
    RESEARCH_LIST = "RESEARCH_LIST",
    FAQ = "FAQ",
    CONTACT_FORM = "CONTACT_FORM",
    CARD_GRID = "CARD_GRID",
    STATS = "STATS",
    TEXT_BLOCK = "TEXT_BLOCK",
    GALLERY = "GALLERY"
}
export declare const PERMISSION_ACTIONS: {
    readonly PAGES_READ: "pages:read";
    readonly PAGES_CREATE: "pages:create";
    readonly PAGES_EDIT: "pages:edit";
    readonly PAGES_PUBLISH: "pages:publish";
    readonly PAGES_DELETE: "pages:delete";
    readonly BLOCKS_MANAGE: "blocks:manage";
    readonly MEDIA_UPLOAD: "media:upload";
    readonly TOKENS_MANAGE: "tokens:manage";
    readonly SETTINGS_MANAGE: "settings:manage";
    readonly USERS_MANAGE: "users:manage";
    readonly AUDIT_READ: "audit:read";
};
//# sourceMappingURL=index.d.ts.map