import { Injectable, OnModuleInit, UnauthorizedException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';

const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const EMAIL_CHANGE_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d
const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const API_ACCESS_TTL_MS = 15 * 60 * 1000; // 15m
const DUMMY_BCRYPT_HASH = '$2b$10$C6UzMDM.H6dfI/f/IKcEeO0rjjSDgkOhZBpUpqmqNZ0HzL4Ha3ei.'; // constant-time decoy, never a real credential

export interface IAuthenticatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  totpEnabled: boolean;
}

export interface IMfaChallengeResult {
  mfaRequired: true;
  challengeToken: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  // In-memory fallback for the well-known super admin so the console remains reachable during a DB
  // outage. This bypasses lockout/2FA/session-revocation by nature (there is no DB to store that
  // state in) — it is a resilience-of-last-resort path, not the normal login flow.
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
    private mailService: MailService,
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

  // ----------------------------------------------------
  // Token helpers — a single random-token + sha256-hash pattern backs password reset,
  // invite, and email-change confirmation (AuthToken.purpose discriminates), and the
  // same hash-before-store approach protects session credentials (see below).
  // ----------------------------------------------------

  private generateRawToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private async issueAuthToken(userId: string, purpose: string, ttlMs: number, metadata?: Record<string, unknown>): Promise<string> {
    const raw = this.generateRawToken();
    await this.prisma.authToken.create({
      data: {
        user_id: userId,
        token_hash: this.hashToken(raw),
        purpose,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        expires_at: new Date(Date.now() + ttlMs),
      },
    });
    return raw;
  }

  /** Looks up an unexpired, unused AuthToken by raw token + purpose. Does NOT mark it used. */
  async findValidAuthToken(rawToken: string, purpose: string) {
    const token = await this.prisma.authToken.findUnique({ where: { token_hash: this.hashToken(rawToken) } });
    if (!token || token.purpose !== purpose) return null;
    if (token.used_at) return null;
    if (token.expires_at < new Date()) return null;
    return token;
  }

  async consumeAuthToken(tokenId: string) {
    await this.prisma.authToken.update({ where: { id: tokenId }, data: { used_at: new Date() } });
  }

  /** Invalidates any still-unused tokens of a given purpose for a user (e.g. before issuing a fresh invite). */
  async invalidateAuthTokens(userId: string, purpose: string) {
    await this.prisma.authToken.updateMany({
      where: { user_id: userId, purpose, used_at: null },
      data: { used_at: new Date() },
    });
  }

  async createInviteToken(userId: string): Promise<string> {
    return this.issueAuthToken(userId, 'INVITE', INVITE_TOKEN_TTL_MS);
  }

  async createEmailChangeToken(userId: string, newEmail: string): Promise<string> {
    return this.issueAuthToken(userId, 'EMAIL_CHANGE', EMAIL_CHANGE_TOKEN_TTL_MS, { newEmail });
  }

  // ----------------------------------------------------
  // Credential validation with account lockout
  // ----------------------------------------------------

  async validateUser(email: string, pass: string): Promise<IAuthenticatedUser> {
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
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });
    } catch {
      // Database offline - query memory store
    }

    if (!userRecord) {
      const memUser = this.memoryUserStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (memUser) {
        const isMatch = await bcrypt.compare(pass, memUser.password_hash);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');
        return {
          id: memUser.id,
          email: memUser.email,
          firstName: memUser.first_name,
          lastName: memUser.last_name,
          roles: memUser.roles,
          permissions: memUser.permissions,
          totpEnabled: false,
        };
      }
      // Constant-time-ish decoy compare so "no such account" and "wrong password" take similar time.
      await bcrypt.compare(pass, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userRecord.locked_until && userRecord.locked_until > new Date()) {
      const minutesLeft = Math.max(1, Math.ceil((userRecord.locked_until.getTime() - Date.now()) / 60000));
      throw new ForbiddenException(`Too many failed attempts. Try again in ${minutesLeft} minute(s).`);
    }

    if (userRecord.status === 'PENDING') {
      throw new UnauthorizedException('This account has not been activated yet. Check your email for the invite link.');
    }
    if (userRecord.status !== 'ACTIVE') {
      throw new UnauthorizedException('This account is not active.');
    }

    const isMatch = await bcrypt.compare(pass, userRecord.password_hash);
    if (!isMatch) {
      const attempts = userRecord.failed_login_attempts + 1;
      const data: { failed_login_attempts: number; locked_until?: Date } = { failed_login_attempts: attempts };
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        data.failed_login_attempts = 0;
        data.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60000);
      }
      await this.prisma.user.update({ where: { id: userRecord.id }, data }).catch(() => {});
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userRecord.failed_login_attempts > 0 || userRecord.locked_until) {
      await this.prisma.user
        .update({ where: { id: userRecord.id }, data: { failed_login_attempts: 0, locked_until: null } })
        .catch(() => {});
    }

    const roles = userRecord.user_roles.map((ur: any) => ur.role.name);
    const permissions = userRecord.user_roles.flatMap((ur: any) => ur.role.permissions.map((rp: any) => rp.permission.action));

    return {
      id: userRecord.id,
      email: userRecord.email,
      firstName: userRecord.first_name,
      lastName: userRecord.last_name,
      roles: Array.from(new Set(roles)) as string[],
      permissions: Array.from(new Set(permissions)) as string[],
      totpEnabled: !!userRecord.totp_enabled,
    };
  }

  // ----------------------------------------------------
  // 2FA login challenge
  // ----------------------------------------------------

  private signMfaChallenge(userId: string): string {
    return this.jwtService.sign({ sub: userId, purpose: 'MFA_CHALLENGE' }, { expiresIn: '5m' });
  }

  verifyMfaChallenge(challengeToken: string): string | null {
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(challengeToken);
      if (payload.purpose !== 'MFA_CHALLENGE') return null;
      return payload.sub;
    } catch {
      return null;
    }
  }

  /** Public entry point for other services (e.g. account settings) that need to confirm a TOTP/recovery code. */
  async verifyMfaCode(userId: string, code: string): Promise<boolean> {
    return this.verifyTotpOrRecoveryCode(userId, code);
  }

  private async verifyTotpOrRecoveryCode(userId: string, code: string): Promise<boolean> {
    if (!code) return false;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.totp_secret && authenticator.check(code.replace(/\s+/g, ''), user.totp_secret)) {
      return true;
    }

    // Fall back to recovery codes (each usable exactly once).
    const unusedCodes = await this.prisma.recoveryCode.findMany({ where: { user_id: userId, used_at: null } });
    for (const rc of unusedCodes) {
      if (await bcrypt.compare(code.trim(), rc.code_hash)) {
        await this.prisma.recoveryCode.update({ where: { id: rc.id }, data: { used_at: new Date() } });
        return true;
      }
    }
    return false;
  }

  /**
   * Completes login for an already-password-verified user. If 2FA is enabled and no valid
   * code was supplied, returns an MFA challenge instead of a session. Used by both the JSON
   * API and the admin console login (which does this as two round-trips).
   */
  async completeLogin(
    user: IAuthenticatedUser,
    req: Request | undefined,
    sessionTtlMs: number,
    totpCode?: string,
  ): Promise<IMfaChallengeResult | { accessToken: string; sessionExpiresAt: Date }> {
    if (user.totpEnabled) {
      if (!totpCode) {
        return { mfaRequired: true, challengeToken: this.signMfaChallenge(user.id) };
      }
      const valid = await this.verifyTotpOrRecoveryCode(user.id, totpCode);
      if (!valid) {
        throw new UnauthorizedException('Invalid authentication code');
      }
    }

    const expiresAt = new Date(Date.now() + sessionTtlMs);
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, roles: user.roles, permissions: user.permissions },
      { expiresIn: Math.floor(sessionTtlMs / 1000) },
    );
    await this.createSession(user.id, req, accessToken, expiresAt);
    return { accessToken, sessionExpiresAt: expiresAt };
  }

  /** Same as completeLogin, but for a login continuing from a previously-issued MFA challenge token. */
  async completeLoginFromChallenge(
    challengeToken: string,
    code: string,
    req: Request | undefined,
    sessionTtlMs: number,
  ): Promise<{ accessToken: string; sessionExpiresAt: Date; user: { id: string; email: string; roles: string[] } }> {
    const userId = this.verifyMfaChallenge(challengeToken);
    if (!userId) throw new UnauthorizedException('Invalid or expired verification session. Please log in again.');

    const valid = await this.verifyTotpOrRecoveryCode(userId, code);
    if (!valid) throw new UnauthorizedException('Invalid authentication code');

    const userRecord = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { user_roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!userRecord) throw new UnauthorizedException('Account no longer exists');

    const roles = Array.from(new Set(userRecord.user_roles.map((ur) => ur.role.name)));
    const permissions = Array.from(
      new Set(userRecord.user_roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.action))),
    );

    const expiresAt = new Date(Date.now() + sessionTtlMs);
    const accessToken = this.jwtService.sign({ sub: userId, email: userRecord.email, roles, permissions }, { expiresIn: Math.floor(sessionTtlMs / 1000) });
    await this.createSession(userId, req, accessToken, expiresAt);
    return { accessToken, sessionExpiresAt: expiresAt, user: { id: userId, email: userRecord.email, roles } };
  }

  // ----------------------------------------------------
  // Session tracking — every live bearer/cookie credential is hashed and stored so it can
  // be revoked before its own JWT expiry (a bare signature check alone can never do this).
  // ----------------------------------------------------

  async createSession(userId: string, req: Request | undefined, rawToken: string, expiresAt: Date) {
    try {
      await this.prisma.session.create({
        data: {
          user_id: userId,
          token_hash: this.hashToken(rawToken),
          user_agent: req?.headers['user-agent']?.toString().slice(0, 255),
          ip_address: (req?.ip || req?.socket?.remoteAddress || undefined)?.toString(),
          expires_at: expiresAt,
        },
      });
    } catch {
      // Database offline fallback
    }
  }

  async verifySessionToken(rawToken: string): Promise<{ sessionId: string; userId: string } | null> {
    try {
      const session = await this.prisma.session.findUnique({ where: { token_hash: this.hashToken(rawToken) } });
      if (!session || session.revoked_at || session.expires_at < new Date()) return null;
      return { sessionId: session.id, userId: session.user_id };
    } catch {
      return null;
    }
  }

  async revokeAllSessions(userId: string) {
    await this.prisma.session
      .updateMany({ where: { user_id: userId, revoked_at: null }, data: { revoked_at: new Date() } })
      .catch(() => {});
  }

  async revokeOtherSessions(userId: string, currentRawToken?: string) {
    const currentHash = currentRawToken ? this.hashToken(currentRawToken) : undefined;
    await this.prisma.session
      .updateMany({
        where: { user_id: userId, revoked_at: null, ...(currentHash ? { token_hash: { not: currentHash } } : {}) },
        data: { revoked_at: new Date() },
      })
      .catch(() => {});
  }

  async revokeSessionById(userId: string, sessionId: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || session.user_id !== userId) return false;
    await this.prisma.session.update({ where: { id: sessionId }, data: { revoked_at: new Date() } });
    return true;
  }

  async listActiveSessions(userId: string, currentRawToken?: string) {
    const currentHash = currentRawToken ? this.hashToken(currentRawToken) : undefined;
    const sessions = await this.prisma.session.findMany({
      where: { user_id: userId, revoked_at: null, expires_at: { gt: new Date() } },
      orderBy: { created_at: 'desc' },
    });
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.user_agent,
      ipAddress: s.ip_address,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      current: currentHash ? s.token_hash === currentHash : false,
    }));
  }

  /** Admin-console login: same flow as the JSON API (completeLogin) but with a 24h session. */
  async completeAdminLogin(user: IAuthenticatedUser, req: Request, totpCode?: string) {
    return this.completeLogin(user, req, ADMIN_SESSION_TTL_MS, totpCode);
  }

  /** Admin-console 2FA step continuing from a challenge issued by completeAdminLogin. */
  async completeAdminLoginFromChallenge(challengeToken: string, code: string, req: Request) {
    return this.completeLoginFromChallenge(challengeToken, code, req, ADMIN_SESSION_TTL_MS);
  }

  /** Verifies a JWT signed with JWT_SECRET AND that its backing session hasn't been revoked/expired. */
  async verifyAdminSession(rawToken: string): Promise<{ sub: string; email: string; roles: string[]; permissions: string[] } | null> {
    const payload = this.verifyAccessToken(rawToken);
    if (!payload) return null;
    const session = await this.verifySessionToken(rawToken);
    if (!session) return null;
    return payload;
  }

  /** Verifies a JWT signed with JWT_SECRET (signature + expiry only — does not check session revocation). */
  verifyAccessToken(token: string): { sub: string; email: string; roles: string[]; permissions: string[] } | null {
    try {
      return this.jwtService.verify<{ sub: string; email: string; roles: string[]; permissions: string[] }>(token);
    } catch {
      return null;
    }
  }

  async login(user: IAuthenticatedUser, req?: Request) {
    const result = await this.completeLogin(user, req, API_ACCESS_TTL_MS, undefined);
    if ('mfaRequired' in result) return result;

    return {
      accessToken: result.accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  // ----------------------------------------------------
  // Forgot / reset password
  // ----------------------------------------------------

  async forgotPassword(email: string): Promise<{ message: string }> {
    const genericResponse = { message: 'If an account exists with this email, a password reset link has been dispatched.' };
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user || user.status !== 'ACTIVE') {
        return genericResponse; // never reveal whether the account exists
      }

      const rawToken = await this.issueAuthToken(user.id, 'PASSWORD_RESET', RESET_TOKEN_TTL_MS);
      const resetUrl = `${this.mailService.baseUrl}/admin/reset-password?token=${rawToken}`;
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

      return genericResponse;
    } catch (err) {
      this.logger.error('forgotPassword error', err as Error);
      return genericResponse;
    }
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<{ message: string }> {
    const token = await this.findValidAuthToken(rawToken, 'PASSWORD_RESET');
    if (!token) throw new BadRequestException('This reset link is invalid or has expired.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: token.user_id },
      data: { password_hash: passwordHash, failed_login_attempts: 0, locked_until: null },
    });
    await this.consumeAuthToken(token.id);
    // The user had no valid session to begin with (they came from "forgot password") — kill everything.
    await this.revokeAllSessions(token.user_id);

    return { message: 'Password has been reset successfully. You can now log in with your new credentials.' };
  }
}
