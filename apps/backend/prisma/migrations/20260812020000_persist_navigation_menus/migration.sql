-- DropForeignKey
ALTER TABLE `NavigationMenuItem` DROP FOREIGN KEY `NavigationMenuItem_parent_id_fkey`;

-- AlterTable
ALTER TABLE `NavigationMenu` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `version` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `NavigationMenuItem` ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `badge_color` VARCHAR(191) NULL,
    ADD COLUMN `badge_text` VARCHAR(191) NULL,
    ADD COLUMN `css_class` VARCHAR(191) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `rel` VARCHAR(191) NULL,
    ADD COLUMN `scheduled_publish_at` DATETIME(3) NULL,
    ADD COLUMN `target_id` VARCHAR(191) NULL,
    ADD COLUMN `target_type` VARCHAR(191) NULL,
    ADD COLUMN `tooltip` VARCHAR(191) NULL,
    ADD COLUMN `visibility_rules` TEXT NULL;

-- AddForeignKey
ALTER TABLE `NavigationMenuItem` ADD CONSTRAINT `NavigationMenuItem_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `NavigationMenuItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
