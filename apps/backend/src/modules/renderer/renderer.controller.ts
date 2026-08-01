import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RendererService } from './renderer.service';

@ApiTags('Rendering Engine')
@Controller('renderer')
export class RendererController {
  constructor(private rendererService: RendererService) {}

  @Get('page')
  @ApiOperation({ summary: 'Get schema-driven render contract payload for Next.js frontend' })
  @ApiQuery({ name: 'slug', required: false, example: 'home' })
  @ApiQuery({ name: 'locale', required: false, example: 'en' })
  async getPageRenderSchema(
    @Headers('x-tenant-id') tenantId: string,
    @Query('slug') slug?: string,
    @Query('locale') locale?: string,
  ) {
    const tid = tenantId || 'default-tenant-id';
    const pageSlug = slug || 'home';
    const lang = locale || 'en';

    const schema = await this.rendererService.getRenderSchema(tid, pageSlug, lang);

    return {
      success: true,
      statusCode: 200,
      data: schema,
      meta: {
        tenantId: schema.tenant.id,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
