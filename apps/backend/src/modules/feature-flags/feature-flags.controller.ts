import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FeatureFlagsService } from './feature-flags.service';

@ApiTags('feature-flags')
@Controller('api/v1/feature-flags')
export class FeatureFlagsController {
  constructor(private featureFlagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active feature flags for tenant' })
  async getFlags(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant';
    return this.featureFlagsService.getAllFlags(tid);
  }

  @Post()
  @ApiOperation({ summary: 'Set feature flag state' })
  async setFlag(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { flagKey: string; isEnabled: boolean; description?: string },
  ) {
    const tid = tenantId || 'default-tenant';
    return this.featureFlagsService.setFeatureFlag(
      tid,
      body.flagKey,
      body.isEnabled,
      body.description,
    );
  }
}
