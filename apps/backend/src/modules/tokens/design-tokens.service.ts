import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { compileTokensToCss, DEFAULT_DESIGN_TOKENS } from '@cms/design-tokens';
import { IDesignToken } from '@cms/shared-types';

@Injectable()
export class DesignTokensService {
  constructor(private prisma: PrismaService) {}

  async getCompiledCss(tenantId: string): Promise<string> {
    let tokens = await this.prisma.designToken.findMany({
      where: { tenant_id: tenantId },
    });

    if (tokens.length === 0) {
      // Seed default tokens
      const created = await Promise.all(
        DEFAULT_DESIGN_TOKENS.map((dt) =>
          this.prisma.designToken.create({
            data: {
              tenant_id: tenantId,
              category: dt.category,
              token_name: dt.tokenName,
              token_value: dt.tokenValue,
              dark_value: dt.darkValue,
              unit: dt.unit,
            },
          }),
        ),
      );
      tokens = created;
    }

    const mapped: IDesignToken[] = tokens.map((t) => ({
      id: t.id,
      tenantId: t.tenant_id,
      category: t.category,
      tokenName: t.token_name,
      tokenValue: t.token_value,
      darkValue: t.dark_value || undefined,
      unit: t.unit || undefined,
    }));

    return compileTokensToCss(mapped);
  }
}
