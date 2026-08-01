import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RevisionsService } from './revisions.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Revisions Engine')
@Controller('revisions')
export class RevisionsController {
  constructor(private revisionsService: RevisionsService) {}

  @Get('pages/:id')
  @ApiOperation({ summary: 'Get revision history list for a page' })
  async getPageRevisions(@Param('id') pageId: string) {
    const revisions = await this.revisionsService.getPageRevisions(pageId);
    return {
      success: true,
      statusCode: 200,
      data: revisions,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post('pages/:id/rollback')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Rollback page layout & metadata to specified revision version' })
  async rollbackPage(@Param('id') pageId: string, @Body() body: { version: number }) {
    const page = await this.revisionsService.rollbackPage(pageId, body.version);
    return {
      success: true,
      statusCode: 200,
      data: page,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
