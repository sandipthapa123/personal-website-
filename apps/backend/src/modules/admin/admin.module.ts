import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UniversalContentModule } from '../content/universal-content.module';
import { TenantConfigModule } from '../config/tenant-config.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UniversalContentModule,
    TenantConfigModule,
    AuthModule,
    // Rate limits the admin login/2FA endpoints, mirroring AuthModule's API-side throttling.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 30 }]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
