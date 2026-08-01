import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS, ContentStatus } from '@cms/constants';

@ApiTags('Workflow Orchestrator Engine')
@Controller('workflow')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Post('pages/:id/transition')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Transition page workflow status (e.g. DRAFT -> PUBLISHED)' })
  async transitionPage(
    @Param('id') pageId: string,
    @Body() body: { targetStatus: ContentStatus },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const page = await this.workflowService.transitionPageStatus(pageId, body.targetStatus, userId);
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
