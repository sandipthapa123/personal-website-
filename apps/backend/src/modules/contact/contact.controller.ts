import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContactService, IContactSubmission } from './contact.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Contact Engine')
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a public contact or newsletter inquiry' })
  async submit(@Body() body: IContactSubmission) {
    const result = await this.contactService.submit(body);
    return {
      success: true,
      statusCode: 200,
      data: result,
      message: 'Your message has been received. We will respond within 2-3 business days.',
      meta: { timestamp: new Date().toISOString(), version: 'v1' },
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'List submitted contact tickets (admin only)' })
  async list(@Query('status') status?: string) {
    const items = await this.contactService.list(status);
    return {
      success: true,
      statusCode: 200,
      data: items,
      meta: { timestamp: new Date().toISOString(), version: 'v1' },
    };
  }
}
