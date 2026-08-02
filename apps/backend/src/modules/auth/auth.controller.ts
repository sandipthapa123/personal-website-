import { Controller, Post, Get, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  @ApiOperation({ summary: 'Login endpoint status and navigation guide' })
  loginInfo(@Res() res: Response) {
    return res.status(200).json({
      status: 'active',
      message: 'Authentication Endpoint Operational',
      instruction: 'To log in via browser UI, visit the Admin Portal URL below. To log in via API, submit an HTTP POST request.',
      webAdminPortal: 'http://localhost:3000/admin/login',
      swaggerDocs: 'http://localhost:4000/api/docs',
      httpMethodRequired: 'POST',
      credentials: {
        email: 'lafasandip15@gmail.com',
        password: 'Sandip@123',
      },
      curlExample: 'curl -X POST http://localhost:4000/api/v1/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"lafasandip15@gmail.com\\",\\"password\\":\\"Sandip@123\\"}"',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  async login(@Body() body: { email: string; pass?: string; password?: string }) {
    const passwordToUse = body.password || body.pass || '';
    const user = await this.authService.validateUser(body.email, passwordToUse);
    return this.authService.login(user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset token' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with reset token' })
  async resetPassword(@Body() body: { resetToken: string; newPass: string }) {
    return this.authService.resetPassword(body.resetToken, body.newPass);
  }
}
