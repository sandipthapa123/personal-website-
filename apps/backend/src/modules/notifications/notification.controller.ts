import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService, INotificationPayload } from './notification.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Notification Engine')
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('send')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Dispatch notification message across email/in-app channels' })
  async sendNotification(@Body() body: INotificationPayload) {
    const success = await this.notificationService.sendNotification(body);
    return {
      success,
      statusCode: 200,
      message: 'Notification queued for dispatch',
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
