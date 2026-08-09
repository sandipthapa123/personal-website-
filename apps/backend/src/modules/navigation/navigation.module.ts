import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { UniversalContentModule } from '../content/universal-content.module';
import { TenantConfigModule } from '../config/tenant-config.module';

@Module({
  imports: [UniversalContentModule, TenantConfigModule],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
