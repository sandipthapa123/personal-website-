import { Module } from '@nestjs/common';
import { MediaPipelineService } from './media-pipeline.service';
import { MediaPipelineController } from './media-pipeline.controller';

@Module({
  controllers: [MediaPipelineController],
  providers: [MediaPipelineService],
  exports: [MediaPipelineService],
})
export class MediaPipelineModule {}
