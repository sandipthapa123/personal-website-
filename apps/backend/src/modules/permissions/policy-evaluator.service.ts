import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface IUserContext {
  id: string;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class PolicyEvaluatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Evaluates user permissions against required policy actions
   */
  async evaluate(user: IUserContext, policyAction: string, params?: Record<string, unknown>): Promise<boolean> {
    if (!user) return false;

    // Super Admin bypasses all policy checks
    if (user.roles.includes('SUPER_ADMIN') || user.roles.includes('TENANT_ADMIN')) {
      return true;
    }

    // Check direct permission match
    if (user.permissions.includes(policyAction)) {
      return true;
    }

    return false;
  }
}
