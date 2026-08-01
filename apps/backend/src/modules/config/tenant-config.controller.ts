import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantConfigService } from './tenant-config.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Configuration Engine')
@Controller('config')
export class TenantConfigController {
  constructor(private configService: TenantConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active tenant configuration settings' })
  async getSettings(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const settings = await this.configService.getAllTenantSettings(tid);
    return {
      success: true,
      statusCode: 200,
      data: settings,
      meta: {
        tenantId: tid,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post()
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Update or set tenant configuration setting' })
  async setSetting(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { category: string; key: string; value: any },
  ) {
    const tid = tenantId || 'default-tenant-id';
    const setting = await this.configService.setSetting(tid, body.category, body.key, body.value);
    return {
      success: true,
      statusCode: 200,
      data: setting,
      meta: {
        tenantId: tid,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
