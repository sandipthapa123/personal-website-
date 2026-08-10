import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import { SystemRoles } from '@cms/constants';
import { CreateUserInviteInput, AcceptInviteInput } from '@cms/validation';

export interface IActor {
  id: string;
  roles: string[];
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  async list() {
    const users = await this.prisma.user.findMany({
      include: {
        user_roles: { include: { role: true } },
        sessions: { where: { revoked_at: null }, orderBy: { created_at: 'desc' }, take: 1 },
      },
      orderBy: { created_at: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      status: u.status,
      roles: u.user_roles.map((ur) => ur.role.name),
      totpEnabled: u.totp_enabled,
      lastLoginAt: u.sessions[0]?.created_at || null,
      createdAt: u.created_at,
    }));
  }

  async listRoles() {
    return this.prisma.role.findMany({ select: { id: true, name: true, description: true }, orderBy: { name: 'asc' } });
  }

  private async assertCanAssignRole(actor: IActor, roleId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new BadRequestException('Selected role does not exist.');
    if (role.name === SystemRoles.SUPER_ADMIN && !actor.roles.includes(SystemRoles.SUPER_ADMIN)) {
      throw new ForbiddenException('Only a Super Admin can grant the Super Admin role.');
    }
    return role;
  }

  async create(dto: CreateUserInviteInput, actor: IActor, actorName?: string) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('An account with this email already exists.');

    await this.assertCanAssignRole(actor, dto.roleId);

    // Placeholder credential — unusable (random, never disclosed) until the invite is accepted.
    const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password_hash: placeholderHash,
        first_name: dto.firstName.trim(),
        last_name: dto.lastName.trim(),
        status: 'PENDING',
        user_roles: { create: [{ role_id: dto.roleId }] },
      },
    });

    const rawToken = await this.authService.createInviteToken(user.id);
    const inviteUrl = `${this.mailService.baseUrl}/admin/accept-invite?token=${rawToken}`;
    await this.mailService.sendInviteEmail(user.email, inviteUrl, actorName);

    return { id: user.id, email: user.email, status: user.status };
  }

  async resendInvite(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.status !== 'PENDING') throw new BadRequestException('This user has already activated their account.');

    await this.authService.invalidateAuthTokens(userId, 'INVITE');
    const rawToken = await this.authService.createInviteToken(userId);
    const inviteUrl = `${this.mailService.baseUrl}/admin/accept-invite?token=${rawToken}`;
    await this.mailService.sendInviteEmail(user.email, inviteUrl);
    return { message: 'Invite resent.' };
  }

  async update(
    userId: string,
    dto: { firstName?: string; lastName?: string; roleId?: string; status?: string },
    actor: IActor,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { user_roles: true } });
    if (!user) throw new NotFoundException('User not found.');

    if (dto.roleId) {
      await this.assertCanAssignRole(actor, dto.roleId);
      const currentlySuperAdmin = await this.prisma.userRole.findFirst({
        where: { user_id: userId, role: { name: SystemRoles.SUPER_ADMIN } },
      });
      if (currentlySuperAdmin && !actor.roles.includes(SystemRoles.SUPER_ADMIN)) {
        throw new ForbiddenException('Only a Super Admin can change a Super Admin\'s role.');
      }
      await this.prisma.userRole.deleteMany({ where: { user_id: userId } });
      await this.prisma.userRole.create({ data: { user_id: userId, role_id: dto.roleId } });
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name: dto.firstName?.trim(),
        last_name: dto.lastName?.trim(),
        status: dto.status,
      },
    });

    if (dto.status && dto.status !== 'ACTIVE') {
      // Suspending/deactivating a user must end any session they currently hold.
      await this.authService.revokeAllSessions(userId);
    }

    return { id: updated.id, status: updated.status };
  }

  async deactivate(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
    await this.authService.revokeAllSessions(userId);
    return { id: updated.id, status: updated.status };
  }

  async acceptInvite(dto: AcceptInviteInput) {
    const token = await this.authService.findValidAuthToken(dto.token, 'INVITE');
    if (!token) throw new BadRequestException('This invite link is invalid or has expired.');

    const user = await this.prisma.user.findUnique({ where: { id: token.user_id } });
    if (!user || user.status !== 'PENDING') {
      throw new BadRequestException('This invite link is invalid or has expired.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password_hash: passwordHash, status: 'ACTIVE' },
    });
    await this.authService.consumeAuthToken(token.id);

    return { message: 'Account activated. You can now sign in.' };
  }
}
