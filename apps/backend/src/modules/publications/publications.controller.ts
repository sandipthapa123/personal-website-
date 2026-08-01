import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Publications Module')
@Controller('publications')
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of published research papers' })
  async getPublications(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const pubs = await this.publicationsService.getPublications(tid);
    return {
      success: true,
      statusCode: 200,
      data: pubs,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post()
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create academic publication entry' })
  async createPublication(
    @Headers('x-tenant-id') tenantId: string,
    @Body()
    body: {
      title: string;
      authors: string[];
      abstract: string;
      journal?: string;
      publisher?: string;
      doi?: string;
      pdfUrl?: string;
    },
  ) {
    const tid = tenantId || 'default-tenant-id';
    const pub = await this.publicationsService.createPublication(tid, body);
    return {
      success: true,
      statusCode: 201,
      data: pub,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
