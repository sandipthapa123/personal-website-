import { Controller, Get, Post, UseInterceptors, UploadedFile, Headers, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaPipelineService } from './media-pipeline.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Media Pipeline Engine')
@Controller('media')
export class MediaPipelineController {
  constructor(private mediaService: MediaPipelineService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of uploaded media files' })
  async getMediaFiles(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const files = await this.mediaService.getMediaFiles(tid);
    return {
      success: true,
      statusCode: 200,
      data: files,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post('upload')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.MEDIA_UPLOAD)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file through processing pipeline' })
  async uploadFile(@Headers('x-tenant-id') tenantId: string, @UploadedFile() file: any) {
    const tid = tenantId || 'default-tenant-id';
    const media = await this.mediaService.processAndStoreFile(tid, file);
    return {
      success: true,
      statusCode: 201,
      data: media,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
