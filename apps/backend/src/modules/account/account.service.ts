import { Injectable, BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

const RECOVERY_CODE_COUNT = 10;
const TOTP_ISSUER = 'Sandip Thapa CMS';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { user_roles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('Account not found.');

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      status: user.status,
      roles: user.user_roles.map((ur) => ur.role.name),
      totpEnabled: user.totp_enabled,
      createdAt: user.created_at,
    };
  }

  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name: dto.firstName?.trim(),
        last_name: dto.lastName?.trim(),
        avatar_url: dto.avatarUrl,
      },
    });
    return { id: updated.id, firstName: updated.first_name, lastName: updated.last_name, avatarUrl: updated.avatar_url };
  }

  private async verifyCurrentPassword(userId: string, currentPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Account not found.');
    const isMatch = await bcrypt.compare(currentPassword || '', user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect.');
    return user;
  }

  async requestEmailChange(userId: string, dto: { newEmail: string; currentPassword: string }) {
    await this.verifyCurrentPassword(userId, dto.currentPassword);

    const newEmail = dto.newEmail.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) throw new ConflictException('That email is already in use.');

    const rawToken = await this.authService.createEmailChangeToken(userId, newEmail);
    const confirmUrl = `${this.mailService.baseUrl}/admin/account?confirmEmailToken=${rawToken}`;
    await this.mailService.sendEmailChangeConfirmation(newEmail, confirmUrl);

    return { message: `A confirmation link has been sent to ${newEmail}.` };
  }

  async confirmEmailChange(rawToken: string) {
    const token = await this.authService.findValidAuthToken(rawToken, 'EMAIL_CHANGE');
    if (!token) throw new BadRequestException('This confirmation link is invalid or has expired.');

    const metadata = token.metadata ? JSON.parse(token.metadata) : {};
    const newEmail: string | undefined = metadata.newEmail;
    if (!newEmail) throw new BadRequestException('This confirmation link is invalid.');

    const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
    if (existing && existing.id !== token.user_id) {
      throw new ConflictException('That email is no longer available.');
    }

    await this.prisma.user.update({ where: { id: token.user_id }, data: { email: newEmail } });
    await this.authService.consumeAuthToken(token.id);

    return { message: 'Email address updated.' };
  }

  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }, currentRawToken?: string) {
    const user = await this.verifyCurrentPassword(userId, dto.currentPassword);

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password_hash: passwordHash } });
    await this.authService.revokeOtherSessions(userId, currentRawToken);
    await this.mailService.sendPasswordChangedNotice(user.email);

    return { message: 'Password changed. Your other active sessions have been signed out.' };
  }

  // ----------------------------------------------------
  // 2FA
  // ----------------------------------------------------

  async setup2fa(userId: string, currentPassword: string) {
    const user = await this.verifyCurrentPassword(userId, currentPassword);
    if (user.totp_enabled) throw new BadRequestException('Two-factor authentication is already enabled.');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, TOTP_ISSUER, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Not persisted yet — the client must prove possession of the secret via verify2faSetup first.
    return { secret, otpauthUrl, qrDataUrl };
  }

  async verify2faSetup(userId: string, dto: { secret: string; code: string }) {
    const valid = authenticator.check(dto.code.replace(/\s+/g, ''), dto.secret);
    if (!valid) throw new BadRequestException('Invalid code. Please try again.');

    await this.prisma.user.update({ where: { id: userId }, data: { totp_secret: dto.secret, totp_enabled: true } });

    const plainCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () => crypto.randomBytes(5).toString('hex'));
    await this.prisma.recoveryCode.deleteMany({ where: { user_id: userId } });
    await this.prisma.recoveryCode.createMany({
      data: await Promise.all(plainCodes.map(async (code) => ({ user_id: userId, code_hash: await bcrypt.hash(code, 10) }))),
    });

    return { message: 'Two-factor authentication enabled.', recoveryCodes: plainCodes };
  }

  async disable2fa(userId: string, dto: { currentPassword: string; code: string }, currentRawToken?: string) {
    await this.verifyCurrentPassword(userId, dto.currentPassword);

    const valid = await this.authService.verifyMfaCode(userId, dto.code);
    if (!valid) throw new UnauthorizedException('Invalid authentication code.');

    await this.prisma.user.update({ where: { id: userId }, data: { totp_secret: null, totp_enabled: false } });
    await this.prisma.recoveryCode.deleteMany({ where: { user_id: userId } });
    await this.authService.revokeOtherSessions(userId, currentRawToken);

    return { message: 'Two-factor authentication disabled.' };
  }

  // ----------------------------------------------------
  // Sessions
  // ----------------------------------------------------

  async listSessions(userId: string, currentRawToken?: string) {
    return this.authService.listActiveSessions(userId, currentRawToken);
  }

  async revokeSession(userId: string, sessionId: string) {
    const ok = await this.authService.revokeSessionById(userId, sessionId);
    if (!ok) throw new NotFoundException('Session not found.');
    return { message: 'Session revoked.' };
  }
}
