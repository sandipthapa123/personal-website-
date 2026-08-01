import { Module, Global } from '@nestjs/common';
import { PolicyEvaluatorService } from './policy-evaluator.service';
import { PolicyGuard } from './policy.guard';

@Global()
@Module({
  providers: [PolicyEvaluatorService, PolicyGuard],
  exports: [PolicyEvaluatorService, PolicyGuard],
})
export class PermissionsModule {}
