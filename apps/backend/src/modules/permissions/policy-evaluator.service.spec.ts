import { Test, TestingModule } from '@nestjs/testing';
import { PolicyEvaluatorService } from './policy-evaluator.service';
import { PrismaService } from '../../database/prisma.service';

describe('PolicyEvaluatorService Unit Test Suite', () => {
  let service: PolicyEvaluatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyEvaluatorService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PolicyEvaluatorService>(PolicyEvaluatorService);
  });

  it('should grant access for SUPER_ADMIN role', async () => {
    const result = await service.evaluate({ id: 'u1', roles: ['SUPER_ADMIN'], permissions: [] }, 'pages:publish');
    expect(result).toBe(true);
  });

  it('should grant access if policy action is in user permissions', async () => {
    const result = await service.evaluate({ id: 'u2', roles: ['AUTHOR'], permissions: ['pages:edit'] }, 'pages:edit');
    expect(result).toBe(true);
  });

  it('should deny access if policy action is missing', async () => {
    const result = await service.evaluate({ id: 'u3', roles: ['VIEWER'], permissions: [] }, 'pages:delete');
    expect(result).toBe(false);
  });
});
