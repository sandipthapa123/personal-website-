import { Module } from '@nestjs/common';
import { RendererService } from './renderer.service';
import { RendererController } from './renderer.controller';
import { UniversalContentModule } from '../content/universal-content.module';
import { TenantConfigModule } from '../config/tenant-config.module';

@Module({
  imports: [UniversalContentModule, TenantConfigModule],
  controllers: [RendererController],
  providers: [RendererService],
  exports: [RendererService],
})
export class RendererModule {}
