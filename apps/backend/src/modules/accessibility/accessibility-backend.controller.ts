import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccessibilityBackendService } from './accessibility-backend.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';
import { IAccessibilityPreferences } from '@cms/accessibility';

@ApiTags('Accessibility Engine (Backend Domain)')
@Controller('accessibility')
export class AccessibilityBackendController {
  constructor(private accessibilityService: AccessibilityBackendService) {}

  @Get()
  @ApiOperation({ summary: 'Get tenant WCAG 2.2 AAA accessibility preferences' })
  async getPreferences(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const prefs = await this.accessibilityService.getPreferences(tid);
    return {
      success: true,
      statusCode: 200,
      data: prefs,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Update tenant WCAG 2.2 AAA accessibility preferences' })
  async updatePreferences(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: Partial<IAccessibilityPreferences>,
  ) {
    const tid = tenantId || 'default-tenant-id';
    const prefs = await this.accessibilityService.updatePreferences(tid, body);
    return {
      success: true,
      statusCode: 200,
      data: prefs,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
