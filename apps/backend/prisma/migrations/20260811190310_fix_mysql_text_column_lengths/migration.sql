-- AlterTable
ALTER TABLE `AuditLog` MODIFY `payload` TEXT NULL;

-- AlterTable
ALTER TABLE `AuthToken` MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `Block` MODIFY `json_config` LONGTEXT NOT NULL,
    MODIFY `style_config` LONGTEXT NULL,
    MODIFY `visibility_config` TEXT NULL,
    MODIFY `permission_rules` TEXT NULL,
    MODIFY `animations_config` TEXT NULL,
    MODIFY `responsive_config` TEXT NULL;

-- AlterTable
ALTER TABLE `BlockDefinition` MODIFY `prop_schema` LONGTEXT NOT NULL,
    MODIFY `default_props` LONGTEXT NOT NULL,
    MODIFY `allowed_regions` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `BlockVersion` MODIFY `json_config` LONGTEXT NOT NULL,
    MODIFY `style_config` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Category` MODIFY `description` TEXT NULL,
    MODIFY `seo_description` TEXT NULL;

-- AlterTable
ALTER TABLE `ContactTicket` MODIFY `message` TEXT NOT NULL,
    MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `ContentRevision` MODIFY `content` LONGTEXT NOT NULL,
    MODIFY `snapshot_json` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `DesignToken` MODIFY `token_value` TEXT NOT NULL,
    MODIFY `dark_value` TEXT NULL;

-- AlterTable
ALTER TABLE `FeatureFlag` MODIFY `rules_json` TEXT NULL;

-- AlterTable
ALTER TABLE `MediaFile` MODIFY `variants_json` TEXT NULL,
    MODIFY `caption` TEXT NULL;

-- AlterTable
ALTER TABLE `NewsletterCampaign` MODIFY `html_content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `NewsletterSubscriber` MODIFY `metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `Page` MODIFY `seo_metadata` TEXT NULL;

-- AlterTable
ALTER TABLE `PageVersion` MODIFY `layout_json` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Plugin` MODIFY `config_json` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `SearchIndex` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `TenantSetting` MODIFY `value` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `TicketMessage` MODIFY `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `TranslationCache` MODIFY `source_text` VARCHAR(768) NOT NULL,
    MODIFY `translated_text` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `UniversalContent` MODIFY `summary` TEXT NULL,
    MODIFY `content` LONGTEXT NOT NULL,
    MODIFY `seo_metadata` TEXT NULL,
    MODIFY `custom_fields` TEXT NULL,
    MODIFY `accessibility_status` TEXT NULL;

-- AlterTable
ALTER TABLE `WorkflowDefinition` MODIFY `states_json` LONGTEXT NOT NULL;
