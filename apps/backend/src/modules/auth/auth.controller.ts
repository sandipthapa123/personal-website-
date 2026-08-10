import { Controller, Post, Get, Body, HttpCode, HttpStatus, Res, Req, BadRequestException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { ForgotPasswordSchema, ResetPasswordSchema } from '@cms/validation';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({ summary: 'Login endpoint status and navigation guide' })
  loginInfo(@Res() res: Response) {
    const payload = {
      status: 'active',
      message: 'Authentication Endpoint Operational',
      instruction: 'To log in via browser UI, visit the Admin Portal URL below. To log in via API, submit an HTTP POST request to /api/v1/auth/login with email and password.',
      webAdminPortal: '/admin/login',
      swaggerDocs: '/api/docs',
      httpMethodRequired: 'POST',
    };

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(payload, null, 2));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate user with email and password (optionally including a TOTP code)' })
  async login(@Body() body: { email: string; password?: string; pass?: string; totpCode?: string }, @Req() req: Request) {
    const passwordToUse = body.password || body.pass || '';
    const user = await this.authService.validateUser(body.email, passwordToUse);
    return this.authService.login(user, req);
  }

  @Post('login/2fa')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Complete API login with a 2FA code following a login challenge' })
  async loginTwoFactor(@Body() body: { challengeToken: string; code: string }, @Req() req: Request) {
    const result = await this.authService.completeLoginFromChallenge(body.challengeToken, body.code, req, 15 * 60 * 1000);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Request a password reset link (always returns a generic message)' })
  async forgotPassword(@Body() body: { email: string }) {
    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.errors[0]?.message || 'Invalid email');
    return this.authService.forgotPassword(parsed.data.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using a one-time reset token' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.errors[0]?.message || 'Invalid request');
    return this.authService.resetPassword(parsed.data.token, parsed.data.newPassword);
  }
}
