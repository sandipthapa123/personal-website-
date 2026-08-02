import { Module } from '@nestjs/common';
import { UniversalContentService } from './universal-content.service';
import { UniversalContentController } from './universal-content.controller';

@Module({
  controllers: [UniversalContentController],
  providers: [UniversalContentService],
  exports: [UniversalContentService],
})
export class UniversalContentModule {}
