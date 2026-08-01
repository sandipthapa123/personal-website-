import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { TenantConfigModule } from './modules/config/tenant-config.module';
import { FeatureFlagModule } from './modules/feature-flags/feature-flags.module';
import { DesignTokensModule } from './modules/tokens/design-tokens.module';
import { RendererModule } from './modules/renderer/renderer.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { RevisionsModule } from './modules/revisions/revisions.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { PluginModule } from './modules/plugins/plugin.module';
import { AiModule } from './modules/ai/ai.module';
import { AccessibilityBackendModule } from './modules/accessibility/accessibility-backend.module';
import { MediaPipelineModule } from './modules/media/media-pipeline.module';
import { BlogModule } from './modules/blog/blog.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    CqrsModule.forRoot(),
    PrismaModule,
    AuthModule,
    PermissionsModule,
    TenantConfigModule,
    FeatureFlagModule,
    DesignTokensModule,
    RendererModule,
    WorkflowModule,
    RevisionsModule,
    NotificationModule,
    PluginModule,
    AiModule,
    AccessibilityBackendModule,
    MediaPipelineModule,
    BlogModule,
    PublicationsModule,
    SearchModule,
    AnalyticsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
