import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { compileTokensToCss, DEFAULT_DESIGN_TOKENS, ITokenInput } from '@cms/design-tokens';

@Injectable()
export class DesignTokensService {
  constructor(private prisma: PrismaService) {}

  async getActiveTokens(tenantId: string): Promise<{ css: string; tokens: ITokenInput[] }> {
    const records = await this.prisma.designToken.findMany({
      where: {
        tenant_id: tenantId,
      },
    });

    if (!records || records.length === 0) {
      const css = compileTokensToCss(DEFAULT_DESIGN_TOKENS);
      return { css, tokens: DEFAULT_DESIGN_TOKENS };
    }

    const tokens: ITokenInput[] = records.map((r) => ({
      category: r.category as any,
      tokenName: r.token_name,
      tokenValue: r.token_value,
      darkValue: r.dark_value || undefined,
      unit: r.unit || undefined,
    }));

    const css = compileTokensToCss(tokens);
    return { css, tokens };
  }

  async setTokens(tenantId: string, name: string, tokens: ITokenInput[]) {
    await this.prisma.designToken.deleteMany({
      where: { tenant_id: tenantId },
    });

    const createData = tokens.map((t) => ({
      tenant_id: tenantId,
      category: t.category,
      token_name: t.tokenName,
      token_value: t.tokenValue,
      dark_value: t.darkValue || null,
      unit: t.unit || null,
    }));

    await this.prisma.designToken.createMany({
      data: createData,
    });

    return this.getActiveTokens(tenantId);
  }

  async getCompiledCss(tenantId: string): Promise<string> {
    const res = await this.getActiveTokens(tenantId);
    return res.css;
  }
}
