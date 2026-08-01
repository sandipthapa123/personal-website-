import { Module } from '@nestjs/common';
import { AccessibilityBackendService } from './accessibility-backend.service';
import { AccessibilityBackendController } from './accessibility-backend.controller';

@Module({
  controllers: [AccessibilityBackendController],
  providers: [AccessibilityBackendService],
  exports: [AccessibilityBackendService],
})
export class AccessibilityBackendModule {}
