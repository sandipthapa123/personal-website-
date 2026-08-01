import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { compileTokensToCss, DEFAULT_DESIGN_TOKENS, ITokenInput } from '@cms/design-tokens';
import { IDesignToken } from '@cms/shared-types';

@Injectable()
export class DesignTokensService {
  constructor(private prisma: PrismaService) {}

  async getActiveTokens(tenantId: string): Promise<{ css: string; tokens: ITokenInput[] }> {
    const record = await this.prisma.designTokenSet.findFirst({
      where: {
        tenant_id: tenantId,
        is_active: true,
      },
    });

    if (!record) {
      const css = compileTokensToCss(DEFAULT_DESIGN_TOKENS);
      return { css, tokens: DEFAULT_DESIGN_TOKENS };
    }

    const rawTokens = (record.tokens as any[]) || [];
    const css = compileTokensToCss(rawTokens as ITokenInput[]);
    return {
      css,
      tokens: rawTokens as ITokenInput[],
    };
  }

  async setTokens(tenantId: string, name: string, tokens: ITokenInput[]) {
    await this.prisma.designTokenSet.updateMany({
      where: { tenant_id: tenantId },
      data: { is_active: false },
    });

    const mapped = tokens.map((t: any) => ({
      category: t.category,
      tokenName: t.tokenName || t.name,
      tokenValue: t.tokenValue || t.value,
      darkValue: t.darkValue,
      unit: t.unit,
    }));

    return this.prisma.designTokenSet.create({
      data: {
        tenant_id: tenantId,
        name,
        tokens: mapped as any,
        is_active: true,
      },
    });
  }

  async getCompiledCss(tenantId: string): Promise<string> {
    const res = await this.getActiveTokens(tenantId);
    return res.css;
  }
}
