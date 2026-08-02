import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Publications & Research Module')
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
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post()
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create academic publication entry' })
  async createPublication(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const pub = await this.publicationsService.createPublication(tid, body);
    return {
      success: true,
      statusCode: 201,
      data: pub,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Put(':id')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Update academic publication entry' })
  async updatePublication(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const updated = await this.publicationsService.updatePublication(tid, id, body);
    return { success: true, statusCode: 200, data: updated };
  }

  @Delete(':id')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_DELETE)
  @ApiOperation({ summary: 'Delete academic publication entry' })
  async deletePublication(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    const tid = tenantId || 'default-tenant-id';
    const result = await this.publicationsService.deletePublication(tid, id);
    return { success: true, statusCode: 200, data: result };
  }

  // Research Projects
  @Get('research/projects')
  @ApiOperation({ summary: 'Get all research projects' })
  async getResearchProjects(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const projects = await this.publicationsService.getResearchProjects(tid);
    return { success: true, statusCode: 200, data: projects };
  }

  @Post('research/projects')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create research project' })
  async createResearchProject(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const project = await this.publicationsService.createResearchProject(tid, body);
    return { success: true, statusCode: 201, data: project };
  }
}
