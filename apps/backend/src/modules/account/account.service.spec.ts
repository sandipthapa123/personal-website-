import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { AccountService } from './account.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

describe('AccountService Unit Test Suite', () => {
  let service: AccountService;
  let mockPrisma: any;
  let mockAuth: any;
  let mockMail: any;

  const passwordHash = bcrypt.hashSync('CorrectHorse9!x', 10);
  const baseUser = { id: 'u1', email: 'user@example.com', password_hash: passwordHash, totp_enabled: false, totp_secret: null };

  beforeEach(async () => {
    mockPrisma = {
      user: { findUnique: jest.fn().mockResolvedValue(baseUser), update: jest.fn().mockResolvedValue({}) },
      recoveryCode: { deleteMany: jest.fn().mockResolvedValue({}), createMany: jest.fn().mockResolvedValue({}) },
    };
    mockAuth = {
      revokeOtherSessions: jest.fn().mockResolvedValue(undefined),
      verifyMfaCode: jest.fn(),
      createEmailChangeToken: jest.fn().mockResolvedValue('raw-email-token'),
      findValidAuthToken: jest.fn(),
      consumeAuthToken: jest.fn().mockResolvedValue(undefined),
      listActiveSessions: jest.fn(),
      revokeSessionById: jest.fn(),
    };
    mockMail = {
      baseUrl: 'http://localhost:4000',
      sendPasswordChangedNotice: jest.fn().mockResolvedValue(true),
      sendEmailChangeConfirmation: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthService, useValue: mockAuth },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  describe('changePassword', () => {
    it('rejects when the current password is wrong', async () => {
      await expect(
        service.changePassword('u1', { currentPassword: 'wrong', newPassword: 'NewPassword9!x' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('updates the password hash, revokes other sessions, and notifies the user on success', async () => {
      await service.changePassword('u1', { currentPassword: 'CorrectHorse9!x', newPassword: 'NewPassword9!x' }, 'current-raw-token');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: expect.objectContaining({ password_hash: expect.any(String) }) }),
      );
      const newHash = mockPrisma.user.update.mock.calls[0][0].data.password_hash;
      expect(await bcrypt.compare('NewPassword9!x', newHash)).toBe(true);
      expect(mockAuth.revokeOtherSessions).toHaveBeenCalledWith('u1', 'current-raw-token');
      expect(mockMail.sendPasswordChangedNotice).toHaveBeenCalledWith(baseUser.email);
    });
  });

  describe('email change', () => {
    it('rejects if the new email is already taken', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(baseUser) // verifyCurrentPassword lookup
        .mockResolvedValueOnce({ id: 'someone-else' }); // existing-email lookup

      await expect(
        service.requestEmailChange('u1', { newEmail: 'taken@example.com', currentPassword: 'CorrectHorse9!x' }),
      ).rejects.toThrow(ConflictException);
    });

    it('does not change the email until the confirmation token is used', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(baseUser).mockResolvedValueOnce(null);
      await service.requestEmailChange('u1', { newEmail: 'new@example.com', currentPassword: 'CorrectHorse9!x' });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockAuth.createEmailChangeToken).toHaveBeenCalledWith('u1', 'new@example.com');
      expect(mockMail.sendEmailChangeConfirmation).toHaveBeenCalledWith('new@example.com', expect.stringContaining('confirmEmailToken='));
    });

    it('confirmEmailChange rejects an invalid or expired token', async () => {
      mockAuth.findValidAuthToken.mockResolvedValue(null);
      await expect(service.confirmEmailChange('bad-token')).rejects.toThrow(BadRequestException);
    });

    it('confirmEmailChange applies the pending email and consumes the token', async () => {
      mockAuth.findValidAuthToken.mockResolvedValue({ id: 'tok1', user_id: 'u1', metadata: JSON.stringify({ newEmail: 'new@example.com' }) });
      mockPrisma.user.findUnique.mockResolvedValue(null); // new email not taken

      await service.confirmEmailChange('good-token');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { email: 'new@example.com' } });
      expect(mockAuth.consumeAuthToken).toHaveBeenCalledWith('tok1');
    });
  });

  describe('2FA setup / verify / disable', () => {
    it('setup2fa rejects the wrong current password', async () => {
      await expect(service.setup2fa('u1', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('setup2fa rejects if 2FA is already enabled', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, totp_enabled: true });
      await expect(service.setup2fa('u1', 'CorrectHorse9!x')).rejects.toThrow(BadRequestException);
    });

    it('setup2fa returns a secret and QR code without persisting it', async () => {
      const result = await service.setup2fa('u1', 'CorrectHorse9!x');
      expect(result.secret).toBeTruthy();
      expect(result.otpauthUrl).toContain('otpauth://totp/');
      expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('verify2faSetup rejects an invalid code', async () => {
      const secret = authenticator.generateSecret();
      await expect(service.verify2faSetup('u1', { secret, code: '000000' })).rejects.toThrow(BadRequestException);
    });

    it('verify2faSetup enables 2FA and returns 10 one-time recovery codes on a valid code', async () => {
      const secret = authenticator.generateSecret();
      const code = authenticator.generate(secret);

      const result = await service.verify2faSetup('u1', { secret, code });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { totp_secret: secret, totp_enabled: true } });
      expect(result.recoveryCodes).toHaveLength(10);
      expect(new Set(result.recoveryCodes).size).toBe(10); // all unique
      expect(mockPrisma.recoveryCode.createMany).toHaveBeenCalled();
    });

    it('disable2fa rejects the wrong current password', async () => {
      await expect(service.disable2fa('u1', { currentPassword: 'wrong', code: '123456' })).rejects.toThrow(UnauthorizedException);
    });

    it('disable2fa rejects an invalid code', async () => {
      mockAuth.verifyMfaCode.mockResolvedValue(false);
      await expect(service.disable2fa('u1', { currentPassword: 'CorrectHorse9!x', code: '000000' })).rejects.toThrow(UnauthorizedException);
    });

    it('disable2fa clears the secret and recovery codes and revokes other sessions on success', async () => {
      mockAuth.verifyMfaCode.mockResolvedValue(true);
      await service.disable2fa('u1', { currentPassword: 'CorrectHorse9!x', code: '123456' }, 'current-raw-token');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { totp_secret: null, totp_enabled: false } });
      expect(mockPrisma.recoveryCode.deleteMany).toHaveBeenCalledWith({ where: { user_id: 'u1' } });
      expect(mockAuth.revokeOtherSessions).toHaveBeenCalledWith('u1', 'current-raw-token');
    });
  });
});
