import { Module } from '@nestjs/common';
import { DesignTokensService } from './design-tokens.service';
import { DesignTokensController } from './design-tokens.controller';

@Module({
  controllers: [DesignTokensController],
  providers: [DesignTokensService],
  exports: [DesignTokensService],
})
export class DesignTokensModule {}
