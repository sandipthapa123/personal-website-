import { Controller, Get, Patch, Post, Body, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { AccountService } from './account.service';
import { ChangePasswordSchema, Verify2faSchema } from '@cms/validation';

const extractToken = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  (req) => req?.cookies?.access_token,
]);

interface IRequestUser {
  id: string;
}

@ApiTags('Account Settings (Self-Service)')
@Controller('account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private accountService: AccountService) {}

  private userId(req: Request): string {
    return (req.user as IRequestUser).id;
  }

  private rawToken(req: Request): string | undefined {
    return extractToken(req) || undefined;
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current account profile' })
  async me(@Req() req: Request) {
    const data = await this.accountService.getMe(this.userId(req));
    return { success: true, data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile fields (name, avatar)' })
  async updateMe(@Req() req: Request, @Body() body: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    const data = await this.accountService.updateProfile(this.userId(req), body);
    return { success: true, data };
  }

  @Post('email-change')
  @ApiOperation({ summary: 'Request an email change — sends a confirmation link to the new address' })
  async requestEmailChange(@Req() req: Request, @Body() body: { newEmail: string; currentPassword: string }) {
    const data = await this.accountService.requestEmailChange(this.userId(req), body);
    return { success: true, ...data };
  }

  @Post('email-change/confirm')
  @ApiOperation({ summary: 'Confirm a pending email change using the emailed token' })
  async confirmEmailChange(@Body() body: { token: string }) {
    if (!body.token) throw new BadRequestException('Missing confirmation token.');
    const data = await this.accountService.confirmEmailChange(body.token);
    return { success: true, ...data };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change the current password (requires current password)' })
  async changePassword(@Req() req: Request, @Body() body: { currentPassword: string; newPassword: string }) {
    const parsed = ChangePasswordSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.errors[0]?.message || 'Invalid request');
    const data = await this.accountService.changePassword(this.userId(req), parsed.data, this.rawToken(req));
    return { success: true, ...data };
  }

  @Post('2fa/setup')
  @ApiOperation({ summary: 'Begin 2FA setup — returns a TOTP secret + QR code (not yet persisted)' })
  async setup2fa(@Req() req: Request, @Body() body: { currentPassword: string }) {
    const data = await this.accountService.setup2fa(this.userId(req), body.currentPassword);
    return { success: true, data };
  }

  @Post('2fa/verify-setup')
  @ApiOperation({ summary: 'Confirm 2FA setup with a code — enables 2FA and returns one-time recovery codes' })
  async verify2faSetup(@Req() req: Request, @Body() body: { secret: string; code: string }) {
    const parsed = Verify2faSchema.safeParse({ code: body.code });
    if (!parsed.success || !body.secret) throw new BadRequestException('Invalid code.');
    const data = await this.accountService.verify2faSetup(this.userId(req), body);
    return { success: true, ...data };
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA (requires current password + a valid code)' })
  async disable2fa(@Req() req: Request, @Body() body: { currentPassword: string; code: string }) {
    const data = await this.accountService.disable2fa(this.userId(req), body, this.rawToken(req));
    return { success: true, ...data };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions for the current account' })
  async sessions(@Req() req: Request) {
    const data = await this.accountService.listSessions(this.userId(req), this.rawToken(req));
    return { success: true, data };
  }

  @Post('sessions/:id/revoke')
  @ApiOperation({ summary: 'Revoke a specific session' })
  async revokeSession(@Req() req: Request, @Param('id') id: string) {
    const data = await this.accountService.revokeSession(this.userId(req), id);
    return { success: true, ...data };
  }
}
