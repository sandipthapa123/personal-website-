import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';

describe('UsersService Unit Test Suite', () => {
  let service: UsersService;
  let mockPrisma: any;
  let mockAuth: any;
  let mockMail: any;

  const editorRole = { id: 'role-editor', name: 'EDITOR' };
  const superAdminRole = { id: 'role-super-admin', name: 'SUPER_ADMIN' };

  beforeEach(async () => {
    mockPrisma = {
      user: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      role: { findUnique: jest.fn() },
      userRole: { findFirst: jest.fn(), deleteMany: jest.fn(), create: jest.fn() },
    };
    mockAuth = {
      createInviteToken: jest.fn().mockResolvedValue('raw-invite-token'),
      invalidateAuthTokens: jest.fn().mockResolvedValue(undefined),
      findValidAuthToken: jest.fn(),
      consumeAuthToken: jest.fn().mockResolvedValue(undefined),
      revokeAllSessions: jest.fn().mockResolvedValue(undefined),
    };
    mockMail = {
      baseUrl: 'http://localhost:4000',
      sendInviteEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuthService, useValue: mockAuth },
        { provide: MailService, useValue: mockMail },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create — duplicate prevention', () => {
    it('rejects a new user with an email that already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.create(
          { email: 'taken@example.com', firstName: 'A', lastName: 'B', roleId: editorRole.id, status: 'PENDING' },
          { id: 'actor-1', roles: ['SUPER_ADMIN'] },
        ),
      ).rejects.toThrow(ConflictException);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('create — privilege escalation guard', () => {
    it('blocks a non-SUPER_ADMIN actor from granting the SUPER_ADMIN role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(superAdminRole);

      await expect(
        service.create(
          { email: 'new@example.com', firstName: 'A', lastName: 'B', roleId: superAdminRole.id, status: 'PENDING' },
          { id: 'actor-1', roles: ['EDITOR'] },
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('allows a SUPER_ADMIN actor to grant the SUPER_ADMIN role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(superAdminRole);
      mockPrisma.user.create.mockResolvedValue({ id: 'new-user', email: 'new@example.com', status: 'PENDING' });

      const result = await service.create(
        { email: 'new@example.com', firstName: 'A', lastName: 'B', roleId: superAdminRole.id, status: 'PENDING' },
        { id: 'actor-1', roles: ['SUPER_ADMIN'] },
      );

      expect(result.status).toBe('PENDING');
      expect(mockAuth.createInviteToken).toHaveBeenCalledWith('new-user');
      expect(mockMail.sendInviteEmail).toHaveBeenCalled();
    });

    it('rejects a role assignment for a role that does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          { email: 'new@example.com', firstName: 'A', lastName: 'B', roleId: 'nonexistent-role', status: 'PENDING' },
          { id: 'actor-1', roles: ['SUPER_ADMIN'] },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create — invite issuance', () => {
    it('creates the user as PENDING with an unusable placeholder password and sends an invite', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findUnique.mockResolvedValue(editorRole);
      mockPrisma.user.create.mockImplementation(({ data }: any) => Promise.resolve({ id: 'new-user', email: data.email, status: data.status, password_hash: data.password_hash }));

      await service.create(
        { email: 'New.User@Example.com', firstName: 'New', lastName: 'User', roleId: editorRole.id, status: 'PENDING' },
        { id: 'actor-1', roles: ['SUPER_ADMIN'] },
      );

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.email).toBe('new.user@example.com'); // normalized to lowercase
      expect(createCall.data.status).toBe('PENDING');
      expect(await bcrypt.compare('', createCall.data.password_hash)).toBe(false); // never an empty/guessable password
      expect(mockMail.sendInviteEmail).toHaveBeenCalledWith('new.user@example.com', expect.stringContaining('/admin/accept-invite?token='), undefined);
    });
  });

  describe('acceptInvite', () => {
    it('rejects an invalid or expired invite token', async () => {
      mockAuth.findValidAuthToken.mockResolvedValue(null);
      await expect(service.acceptInvite({ token: 'bad-token', password: 'NewPassword9!x' })).rejects.toThrow(BadRequestException);
    });

    it('rejects if the invited user is no longer PENDING (e.g. already activated)', async () => {
      mockAuth.findValidAuthToken.mockResolvedValue({ id: 'tok1', user_id: 'u1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'ACTIVE' });
      await expect(service.acceptInvite({ token: 'token', password: 'NewPassword9!x' })).rejects.toThrow(BadRequestException);
    });

    it('activates the account, sets the password, and consumes the token', async () => {
      mockAuth.findValidAuthToken.mockResolvedValue({ id: 'tok1', user_id: 'u1' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', status: 'PENDING' });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.acceptInvite({ token: 'token', password: 'NewPassword9!x' });

      expect(result.message).toMatch(/activated/i);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: expect.objectContaining({ status: 'ACTIVE' }) }),
      );
      expect(mockAuth.consumeAuthToken).toHaveBeenCalledWith('tok1');
    });
  });

  describe('update — role change privilege escalation guard', () => {
    it('blocks a non-SUPER_ADMIN actor from changing an existing Super Admin\'s role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', user_roles: [] });
      mockPrisma.role.findUnique.mockResolvedValue(editorRole);
      mockPrisma.userRole.findFirst.mockResolvedValue({ user_id: 'u1', role_id: superAdminRole.id }); // currently a super admin

      await expect(
        service.update('u1', { roleId: editorRole.id }, { id: 'actor-1', roles: ['EDITOR'] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
