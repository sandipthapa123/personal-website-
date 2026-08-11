-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_text" TEXT NOT NULL,
    "source_lang" TEXT NOT NULL DEFAULT 'auto',
    "target_lang" TEXT NOT NULL DEFAULT 'en',
    "translated_text" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_source_text_key" ON "TranslationCache"("source_text");
