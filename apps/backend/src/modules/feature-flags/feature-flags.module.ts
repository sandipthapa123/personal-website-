import { Module } from '@nestjs/common';
import { FeatureFlagService } from './feature-flags.service';
import { FeatureFlagController } from './feature-flags.controller';

@Module({
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
