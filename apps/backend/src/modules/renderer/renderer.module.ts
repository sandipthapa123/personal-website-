import { Module } from '@nestjs/common';
import { RendererService } from './renderer.service';
import { RendererController } from './renderer.controller';

@Module({
  controllers: [RendererController],
  providers: [RendererService],
  exports: [RendererService],
})
export class RendererModule {}
