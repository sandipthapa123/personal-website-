import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UniversalContentModule } from '../content/universal-content.module';
import { TenantConfigModule } from '../config/tenant-config.module';

@Module({
  imports: [UniversalContentModule, TenantConfigModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
