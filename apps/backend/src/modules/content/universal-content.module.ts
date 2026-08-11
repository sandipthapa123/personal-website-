import { Global, Module } from '@nestjs/common';
import { UniversalContentService } from './universal-content.service';
import { UniversalContentController } from './universal-content.controller';
import { SeoModule } from '../seo/seo.module';

@Global()
@Module({
  imports: [SeoModule],
  controllers: [UniversalContentController],
  providers: [UniversalContentService],
  exports: [UniversalContentService],
})
export class UniversalContentModule {}

