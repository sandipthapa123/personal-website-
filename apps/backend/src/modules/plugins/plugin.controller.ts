import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PluginService, IPluginManifest } from './plugin.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Plugin Sandbox Engine')
@Controller('plugins')
export class PluginController {
  constructor(private pluginService: PluginService) {}

  @Get()
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Get list of installed plugins' })
  async getInstalledPlugins() {
    const plugins = await this.pluginService.getInstalledPlugins();
    return {
      success: true,
      statusCode: 200,
      data: plugins,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post('register')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Register new plugin manifest' })
  async registerPlugin(@Body() manifest: IPluginManifest) {
    const plugin = await this.pluginService.registerPlugin(manifest);
    return {
      success: true,
      statusCode: 201,
      data: plugin,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post(':name/toggle')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Activate or deactivate plugin' })
  async togglePlugin(@Param('name') name: string, @Body() body: { isActive: boolean }) {
    const plugin = await this.pluginService.togglePlugin(name, body.isActive);
    return {
      success: true,
      statusCode: 200,
      data: plugin,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
