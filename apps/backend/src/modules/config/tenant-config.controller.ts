import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantConfigService } from './tenant-config.service';

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

  @Post('bulk')
  @ApiOperation({ summary: 'Save bulk tenant configuration settings' })
  async saveBulkSettings(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: any,
  ) {
    try {
      const tid = tenantId || 'default-tenant-id';
      const settingsMap = (body && body.settings) ? body.settings : body;
      await this.configService.saveBulkSettings(tid, settingsMap || {});
      const updated = await this.configService.getAllTenantSettings(tid);
      return {
        success: true,
        statusCode: 200,
        message: 'All settings updated successfully!',
        data: updated,
      };
    } catch (err: any) {
      console.error('ERROR IN saveBulkSettings:', err);
      return {
        success: false,
        statusCode: 500,
        message: err.message || 'Error saving settings',
      };
    }
  }
}
