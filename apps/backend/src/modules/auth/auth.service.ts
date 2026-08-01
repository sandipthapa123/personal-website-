import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = user.user_roles.map((ur: any) => ur.role.name);
    const permissions = user.user_roles.flatMap((ur: any) =>
      ur.role.permissions.map((rp: any) => rp.permission.action),
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roles: Array.from(new Set(roles)),
      permissions: Array.from(new Set(permissions)),
    };
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'super-secret-refresh-key-thapasandip-cms',
      expiresIn: '7d',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success message to prevent user enumeration attacks
      return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'PASSWORD_RESET' },
      { expiresIn: '1h' },
    );

    return {
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      resetToken, // Provided for testing & dev convenience
    };
  }

  async resetPassword(resetToken: string, newPass: string) {
    try {
      const payload = this.jwtService.verify(resetToken);
      if (payload.purpose !== 'PASSWORD_RESET') {
        throw new BadRequestException('Invalid reset token');
      }

      const passwordHash = await bcrypt.hash(newPass, 10);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { password_hash: passwordHash },
      });

      return { message: 'Password has been reset successfully. You can now login with your new credentials.' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
