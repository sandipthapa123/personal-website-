import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';

describe('AuthService Unit Test Suite', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockMail: any;

  const activeUser = {
    id: 'u1',
    email: 'user@example.com',
    password_hash: bcrypt.hashSync('CorrectHorse9!x', 10),
    first_name: 'Test',
    last_name: 'User',
    status: 'ACTIVE',
    failed_login_attempts: 0,
    locked_until: null,
    totp_enabled: false,
    totp_secret: null,
    user_roles: [
      { role: { name: 'EDITOR', permissions: [{ permission: { action: 'pages:edit' } }] } },
    ],
  };

  beforeEach(async () => {
    mockPrisma = {
      user: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
      session: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn(), update: jest.fn(), findMany: jest.fn() },
      authToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
      recoveryCode: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn() },
    };
    mockMail = {
      baseUrl: 'http://localhost:4000',
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
      sendInviteEmail: jest.fn().mockResolvedValue(true),
      sendEmailChangeConfirmation: jest.fn().mockResolvedValue(true),
      sendPasswordChangedNotice: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: new JwtService({ secret: 'test-secret-key' }) },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-secret-key') } },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser — account lockout', () => {
    it('locks the account after 10 failed attempts and rejects even the correct password while locked', async () => {
      const user = { ...activeUser, failed_login_attempts: 9 };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockImplementation(({ data }: any) => Promise.resolve({ ...user, ...data }));

      await expect(service.validateUser(user.email, 'wrong-password')).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ locked_until: expect.any(Date), failed_login_attempts: 0 }) }),
      );

      const lockedUser = { ...user, failed_login_attempts: 0, locked_until: new Date(Date.now() + 15 * 60000) };
      mockPrisma.user.findUnique.mockResolvedValue(lockedUser);
      await expect(service.validateUser(user.email, 'CorrectHorse9!x')).rejects.toThrow(ForbiddenException);
    });

    it('resets the failed-attempt counter after a successful login', async () => {
      const user = { ...activeUser, failed_login_attempts: 3 };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(user);

      const result = await service.validateUser(user.email, 'CorrectHorse9!x');
      expect(result.id).toBe('u1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { failed_login_attempts: 0, locked_until: null } }),
      );
    });

    it('rejects login for a PENDING (not-yet-activated) account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser, status: 'PENDING' });
      await expect(service.validateUser(activeUser.email, 'CorrectHorse9!x')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects login for a SUSPENDED account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...activeUser, status: 'SUSPENDED' });
      await expect(service.validateUser(activeUser.email, 'CorrectHorse9!x')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword / resetPassword', () => {
    it('never returns the raw reset token in the response', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(activeUser);
      mockPrisma.authToken.create.mockResolvedValue({ id: 't1' });

      const result = await service.forgotPassword(activeUser.email);
      expect(result).toEqual({ message: expect.any(String) });
      expect(JSON.stringify(result)).not.toMatch(/[0-9a-f]{64}/); // no raw hex token anywhere in the payload
      expect(mockMail.sendPasswordResetEmail).toHaveBeenCalledWith(activeUser.email, expect.stringContaining('/admin/reset-password?token='));
    });

    it('returns an identical generic message whether or not the account exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      const forNonexistent = await service.forgotPassword('nobody@example.com');

      mockPrisma.user.findUnique.mockResolvedValueOnce(activeUser);
      const forReal = await service.forgotPassword(activeUser.email);

      expect(forNonexistent).toEqual(forReal);
    });

    it('rejects an unknown or already-used reset token', async () => {
      mockPrisma.authToken.findUnique.mockResolvedValue(null);
      await expect(service.resetPassword('bogus-token', 'NewPassword9!x')).rejects.toThrow(BadRequestException);
    });

    it('rejects an expired reset token', async () => {
      mockPrisma.authToken.findUnique.mockResolvedValue({
        id: 't1', user_id: 'u1', purpose: 'PASSWORD_RESET', used_at: null, expires_at: new Date(Date.now() - 1000),
      });
      await expect(service.resetPassword('expired-token', 'NewPassword9!x')).rejects.toThrow(BadRequestException);
    });

    it('resets the password, marks the token used, and revokes all sessions on success', async () => {
      mockPrisma.authToken.findUnique.mockResolvedValue({
        id: 't1', user_id: 'u1', purpose: 'PASSWORD_RESET', used_at: null, expires_at: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.authToken.update.mockResolvedValue({});
      mockPrisma.session.updateMany.mockResolvedValue({ count: 2 });

      await service.resetPassword('valid-token', 'NewPassword9!x');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'u1' } }));
      expect(mockPrisma.authToken.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { used_at: expect.any(Date) } });
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ user_id: 'u1', revoked_at: null }) }),
      );
    });
  });

  describe('2FA login challenge', () => {
    it('returns an MFA challenge instead of a session when TOTP is enabled and no code is given', async () => {
      const user = { id: 'u1', email: 'user@example.com', firstName: 'T', lastName: 'U', roles: ['EDITOR'], permissions: [], totpEnabled: true };
      const result = await service.completeLogin(user, undefined, 900000);
      expect(result).toEqual({ mfaRequired: true, challengeToken: expect.any(String) });
    });

    it('rejects an invalid TOTP/recovery code', async () => {
      const user = { id: 'u1', email: 'user@example.com', firstName: 'T', lastName: 'U', roles: ['EDITOR'], permissions: [], totpEnabled: true };
      mockPrisma.user.findUnique.mockResolvedValue({ totp_secret: 'JBSWY3DPEHPK3PXP' });
      await expect(service.completeLogin(user, undefined, 900000, '000000')).rejects.toThrow(UnauthorizedException);
    });

    it('completeLoginFromChallenge rejects an expired/invalid challenge token', async () => {
      await expect(
        service.completeLoginFromChallenge('not-a-real-jwt', '123456', undefined, 900000),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('session tracking and revocation', () => {
    it('verifySessionToken returns null for a revoked session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({ id: 's1', user_id: 'u1', revoked_at: new Date(), expires_at: new Date(Date.now() + 100000) });
      const result = await service.verifySessionToken('some-raw-token');
      expect(result).toBeNull();
    });

    it('verifySessionToken returns null for an expired session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({ id: 's1', user_id: 'u1', revoked_at: null, expires_at: new Date(Date.now() - 1000) });
      const result = await service.verifySessionToken('some-raw-token');
      expect(result).toBeNull();
    });

    it('verifySessionToken returns the session for a live, un-revoked token', async () => {
      mockPrisma.session.findUnique.mockResolvedValue({ id: 's1', user_id: 'u1', revoked_at: null, expires_at: new Date(Date.now() + 100000) });
      const result = await service.verifySessionToken('some-raw-token');
      expect(result).toEqual({ sessionId: 's1', userId: 'u1' });
    });

    it('revokeAllSessions revokes every active session for the user', async () => {
      mockPrisma.session.updateMany.mockResolvedValue({ count: 3 });
      await service.revokeAllSessions('u1');
      expect(mockPrisma.session.updateMany).toHaveBeenCalledWith({
        where: { user_id: 'u1', revoked_at: null },
        data: { revoked_at: expect.any(Date) },
      });
    });
  });
});
