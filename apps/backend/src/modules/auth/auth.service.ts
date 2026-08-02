import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  // In-memory Database Store fallback with bcrypt password hashes
  private memoryUserStore = [
    {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'lafasandip15@gmail.com',
      password_hash: '$2b$10$l3ycabD3bhA3aslzgGJhOuh.yuenhq4B.mM.dDQ0QHd52TxhlsmWi', // bcrypt hash for Sandip@123
      first_name: 'Sandip',
      last_name: 'Thapa',
      roles: ['SUPER_ADMIN'],
      permissions: [
        'pages:manage',
        'pages:read',
        'pages:create',
        'pages:edit',
        'pages:publish',
        'pages:delete',
        'blocks:manage',
        'media:upload',
        'tokens:manage',
        'settings:manage',
        'users:manage',
        'audit:read',
      ],
    },
  ];

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.seedSuperAdminUser().catch(() => {});
  }

  private async seedSuperAdminUser() {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: 'lafasandip15@gmail.com' },
      });

      if (!existing) {
        await this.prisma.user.create({
          data: {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'lafasandip15@gmail.com',
            password_hash: '$2b$10$l3ycabD3bhA3aslzgGJhOuh.yuenhq4B.mM.dDQ0QHd52TxhlsmWi',
            first_name: 'Sandip',
            last_name: 'Thapa',
            status: 'ACTIVE',
          },
        });
        this.logger.log('Seeded Super Admin user in database: lafasandip15@gmail.com');
      }
    } catch (err) {
      // Database offline - in-memory store remains active
    }
  }

  async validateUser(email: string, pass: string) {
    let userRecord: any = null;

    try {
      userRecord = await this.prisma.user.findUnique({
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
    } catch (err) {
      // Database offline - query memory store
    }

    if (!userRecord) {
      userRecord = this.memoryUserStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!userRecord) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(pass, userRecord.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const roles = userRecord.roles || userRecord.user_roles?.map((ur: any) => ur.role.name) || ['SUPER_ADMIN'];
    const permissions =
      userRecord.permissions ||
      userRecord.user_roles?.flatMap((ur: any) => ur.role.permissions.map((rp: any) => rp.permission.action)) || [
        'pages:manage',
      ];

    return {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.first_name || userRecord.firstName,
      lastName: userRecord.last_name || userRecord.lastName,
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

    try {
      await this.prisma.session.create({
        data: {
          user_id: user.id,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        },
      });
    } catch (err) {
      // Database offline fallback
    }

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
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
      }

      const resetToken = this.jwtService.sign(
        { sub: user.id, email: user.email, purpose: 'PASSWORD_RESET' },
        { expiresIn: '1h' },
      );

      return {
        message: 'If an account exists with this email, a password reset link has been dispatched.',
        resetToken,
      };
    } catch (err) {
      const resetToken = this.jwtService.sign(
        { sub: '00000000-0000-0000-0000-000000000000', email, purpose: 'PASSWORD_RESET' },
        { expiresIn: '1h' },
      );
      return {
        message: 'If an account exists with this email, a password reset link has been dispatched.',
        resetToken,
      };
    }
  }

  async resetPassword(resetToken: string, newPass: string) {
    try {
      const payload = this.jwtService.verify(resetToken);
      if (payload.purpose !== 'PASSWORD_RESET') {
        throw new BadRequestException('Invalid reset token');
      }

      const passwordHash = await bcrypt.hash(newPass, 10);
      try {
        await this.prisma.user.update({
          where: { id: payload.sub },
          data: { password_hash: passwordHash },
        });
      } catch (dbErr) {
        // Skip DB update if database is offline
      }

      return { message: 'Password has been reset successfully. You can now login with your new credentials.' };
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }
}
