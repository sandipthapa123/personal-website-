"use strict";
/**
 * @cms/constants - System Enums, Workflow States, and Permission Actions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_ACTIONS = exports.BlockTypes = exports.LayoutRegionKeys = exports.SystemRoles = exports.UserStatus = exports.ContentStatus = void 0;
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["PREVIEW"] = "PREVIEW";
    ContentStatus["REVIEW"] = "REVIEW";
    ContentStatus["APPROVED"] = "APPROVED";
    ContentStatus["SCHEDULED"] = "SCHEDULED";
    ContentStatus["PUBLISHED"] = "PUBLISHED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var SystemRoles;
(function (SystemRoles) {
    SystemRoles["SUPER_ADMIN"] = "SUPER_ADMIN";
    SystemRoles["TENANT_ADMIN"] = "TENANT_ADMIN";
    SystemRoles["EDITOR"] = "EDITOR";
    SystemRoles["AUTHOR"] = "AUTHOR";
    SystemRoles["VIEWER"] = "VIEWER";
})(SystemRoles || (exports.SystemRoles = SystemRoles = {}));
var LayoutRegionKeys;
(function (LayoutRegionKeys) {
    LayoutRegionKeys["HEADER"] = "header";
    LayoutRegionKeys["SIDEBAR"] = "sidebar";
    LayoutRegionKeys["MAIN"] = "main";
    LayoutRegionKeys["FOOTER"] = "footer";
})(LayoutRegionKeys || (exports.LayoutRegionKeys = LayoutRegionKeys = {}));
var BlockTypes;
(function (BlockTypes) {
    BlockTypes["HERO"] = "HERO";
    BlockTypes["TIMELINE"] = "TIMELINE";
    BlockTypes["PUBLICATION_LIST"] = "PUBLICATION_LIST";
    BlockTypes["RESEARCH_LIST"] = "RESEARCH_LIST";
    BlockTypes["FAQ"] = "FAQ";
    BlockTypes["CONTACT_FORM"] = "CONTACT_FORM";
    BlockTypes["CARD_GRID"] = "CARD_GRID";
    BlockTypes["STATS"] = "STATS";
    BlockTypes["TEXT_BLOCK"] = "TEXT_BLOCK";
    BlockTypes["GALLERY"] = "GALLERY";
})(BlockTypes || (exports.BlockTypes = BlockTypes = {}));
exports.PERMISSION_ACTIONS = {
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
};
//# sourceMappingURL=index.js.map