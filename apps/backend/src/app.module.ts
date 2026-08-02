import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { TenantConfigModule } from './modules/config/tenant-config.module';
import { FeatureFlagsModule } from './modules/feature-flags/feature-flags.module';
import { DesignTokensModule } from './modules/tokens/design-tokens.module';
import { RendererModule } from './modules/renderer/renderer.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { MediaPipelineModule } from './modules/media/media-pipeline.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AccessibilityBackendModule } from './modules/accessibility/accessibility-backend.module';
import { PluginModule } from './modules/plugins/plugin.module';
import { AiModule } from './modules/ai/ai.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    AdminModule,
    PermissionsModule,
    TenantConfigModule,
    FeatureFlagsModule,
    DesignTokensModule,
    RendererModule,
    WorkflowModule,
    RevisionsModule,
    MediaPipelineModule,
    SearchModule,
    NotificationModule,
    AnalyticsModule,
    AccessibilityBackendModule,
    PluginModule,
    AiModule,
    HealthModule,
  ],
})
export class AppModule {}
