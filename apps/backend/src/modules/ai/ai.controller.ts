import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('AI Engine (Provider-Agnostic)')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('summarize')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Generate automatic text summary for articles or research papers' })
  async summarize(@Body() body: { text: string }) {
    const summary = await this.aiService.summarizeText(body.text);
    return {
      success: true,
      statusCode: 200,
      data: { summary },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post('alt-text')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Generate accessible image ALT text automatically' })
  async generateAltText(@Body() body: { imageName: string }) {
    const altText = await this.aiService.generateAltText(body.imageName);
    return {
      success: true,
      statusCode: 200,
      data: { altText },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
