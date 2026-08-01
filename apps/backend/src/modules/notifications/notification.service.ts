import { Injectable, Logger } from '@nestjs/common';

export interface INotificationPayload {
  recipient: string;
  subject: string;
  body: string;
  channel?: 'email' | 'in_app' | 'webhook';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendNotification(payload: INotificationPayload): Promise<boolean> {
    const channel = payload.channel || 'email';
    this.logger.log(`Dispatching notification via [${channel}] to <${payload.recipient}>: ${payload.subject}`);
    return true;
  }
}
