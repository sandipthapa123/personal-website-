import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeatureFlagService } from './feature-flags.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Feature Flag Engine')
@Controller('feature-flags')
export class FeatureFlagController {
  constructor(private flagService: FeatureFlagService) {}

  @Get()
  @ApiOperation({ summary: 'Get status of all feature flags for tenant' })
  async getFlags(@Headers('x-tenant-id') tenantId: string) {
    const flags = await this.flagService.getAllFlags(tenantId);
    return {
      success: true,
      statusCode: 200,
      data: flags,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post()
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Toggle feature flag state' })
  async toggleFlag(@Body() body: { key: string; isEnabled: boolean; name?: string }) {
    const flag = await this.flagService.toggleFlag(body.key, body.isEnabled, body.name);
    return {
      success: true,
      statusCode: 200,
      data: flag,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
