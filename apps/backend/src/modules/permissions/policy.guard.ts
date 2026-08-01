import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { POLICIES_KEY } from './policy.decorator';
import { PolicyEvaluatorService, IUserContext } from './policy-evaluator.service';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyEvaluator: PolicyEvaluatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPolicies = this.reflector.getAllAndOverride<string[]>(POLICIES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPolicies || requiredPolicies.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as IUserContext;

    if (!user) {
      throw new ForbiddenException('User authentication required for policy evaluation');
    }

    for (const policyAction of requiredPolicies) {
      const isAllowed = await this.policyEvaluator.evaluate(user, policyAction, request.params);
      if (!isAllowed) {
        throw new ForbiddenException(`Access denied: Policy '${policyAction}' authorization failed`);
      }
    }

    return true;
  }
}
