-- AlterTable
ALTER TABLE "Session" ADD COLUMN "revoked_at" DATETIME;

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "metadata" TEXT,
    "expires_at" DATETIME NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecoveryCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecoveryCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatar_url", "created_at", "email", "first_name", "id", "last_name", "password_hash", "status", "totp_enabled", "totp_secret", "updated_at") SELECT "avatar_url", "created_at", "email", "first_name", "id", "last_name", "password_hash", "status", "totp_enabled", "totp_secret", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_token_hash_key" ON "AuthToken"("token_hash");

-- CreateIndex
CREATE INDEX "AuthToken_user_id_purpose_idx" ON "AuthToken"("user_id", "purpose");

-- CreateIndex
CREATE INDEX "RecoveryCode_user_id_idx" ON "RecoveryCode"("user_id");

-- CreateIndex (idempotent: may already exist from earlier untracked schema drift)
CREATE INDEX IF NOT EXISTS "Page_slug_idx" ON "Page"("slug");

-- CreateIndex (idempotent: may already exist from earlier untracked schema drift)
CREATE INDEX IF NOT EXISTS "UniversalContent_status_idx" ON "UniversalContent"("status");

-- CreateIndex (idempotent: may already exist from earlier untracked schema drift)
CREATE INDEX IF NOT EXISTS "UniversalContent_content_type_idx" ON "UniversalContent"("content_type");

-- CreateIndex (idempotent: may already exist from earlier untracked schema drift)
CREATE INDEX IF NOT EXISTS "UniversalContent_locale_idx" ON "UniversalContent"("locale");

-- CreateIndex (idempotent: may already exist from earlier untracked schema drift)
CREATE INDEX IF NOT EXISTS "UniversalContent_published_at_idx" ON "UniversalContent"("published_at");

