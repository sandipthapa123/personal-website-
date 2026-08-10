import { Controller, Post, Get, Body, Headers, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Privacy Analytics Engine')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('event')
  @ApiOperation({ summary: 'Record privacy-preserving pageview or download event' })
  async trackEvent(
    @Headers('x-tenant-id') tenantId: string,
    @Req() req: Request,
    @Body() body: { eventType: string; path: string; referrer?: string },
  ) {
    const tid = tenantId || 'default-tenant-id';
    const clientIp = req.ip || req.socket.remoteAddress;
    await this.analyticsService.trackEvent(tid, body.eventType || 'pageview', body.path, body.referrer, clientIp);
    return {
      success: true,
      statusCode: 200,
      message: 'Event recorded',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Get('summary')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.AUDIT_READ)
  @ApiOperation({ summary: 'Get privacy analytics metrics summary' })
  async getSummary(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const summary = await this.analyticsService.getSummary(tid);
    return {
      success: true,
      statusCode: 200,
      data: summary,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
