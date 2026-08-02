import { Controller, Get, Post, Body, Param, Put, Delete, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Navigation Engine')
@Controller('navigation')
export class NavigationController {
  constructor(private navigationService: NavigationService) {}

  @Get('main')
  @ApiOperation({ summary: 'Get main global navigation tree (Backend-Driven)' })
  async getMainNavigation(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const items = await this.navigationService.getMainNavigation(tid);
    return {
      items,
      meta: {
        totalItems: items.length,
        timestamp: new Date().toISOString(),
        version: 'v1',
        source: 'backend-cms-navigation-engine',
      },
    };
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get backend-driven footer layout contract' })
  async getFooterNavigation(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    return this.navigationService.getFooterNavigation(tid);
  }

  @Post('items')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Add a new navigation menu item' })
  async addNavigationItem(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { label: string; url: string; icon?: string; order?: number; parentLabel?: string },
  ) {
    const tid = tenantId || 'default-tenant-id';
    const item = await this.navigationService.upsertMainNavigationItem(tid, body);
    return {
      success: true,
      statusCode: 201,
      data: item,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
