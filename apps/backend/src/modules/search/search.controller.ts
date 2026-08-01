import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('Search Engine')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Execute full-text search across content domains' })
  @ApiQuery({ name: 'q', required: true, example: 'architecture' })
  async search(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') query: string,
    @Query('locale') locale?: string,
  ) {
    const tid = tenantId || 'default-tenant-id';
    const results = await this.searchService.search(tid, query, locale || 'en');
    return {
      success: true,
      statusCode: 200,
      data: results,
      meta: {
        query,
        count: results.length,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
