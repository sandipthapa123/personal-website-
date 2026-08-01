import { Controller, Post, Body, Res, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and obtain JWT tokens' })
  async login(@Body() body: { email: string; pass: string }, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.pass);
    const result = await this.authService.login(user);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      success: true,
      statusCode: 200,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@Req() req: Request) {
    return {
      success: true,
      statusCode: 200,
      data: (req as any).user,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
