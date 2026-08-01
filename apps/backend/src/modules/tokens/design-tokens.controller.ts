import { Controller, Get, Headers, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { DesignTokensService } from './design-tokens.service';

@ApiTags('Design Token & Theme Engine')
@Controller('tokens')
export class DesignTokensController {
  constructor(private tokensService: DesignTokensService) {}

  @Get('compiled-css')
  @ApiOperation({ summary: 'Get compiled CSS custom properties for tenant' })
  async getCompiledCss(@Headers('x-tenant-id') tenantId: string, @Res() res: Response) {
    const tid = tenantId || 'default-tenant-id';
    const css = await this.tokensService.getCompiledCss(tid);
    res.setHeader('Content-Type', 'text/css');
    return res.send(css);
  }
}
