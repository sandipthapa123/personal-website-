import { Module } from '@nestjs/common';
import { TenantConfigService } from './tenant-config.service';
import { TenantConfigController } from './tenant-config.controller';

@Module({
  controllers: [TenantConfigController],
  providers: [TenantConfigService],
  exports: [TenantConfigService],
})
export class TenantConfigModule {}
