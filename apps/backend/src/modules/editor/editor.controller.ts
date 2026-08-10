import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EditorService } from './editor.service';
import { EditorValidationService } from './editor-validation.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { AuthGuard } from '@nestjs/passport';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Editor.js Visual Content Engine')
@Controller('editor')
export class EditorController {
  constructor(
    private editorService: EditorService,
    private validatorService: EditorValidationService,
  ) {}

  @Get('pages')
  @ApiOperation({ summary: 'List all editable pages with block counts and status' })
  async listPages() {
    const pages = await this.editorService.listAllEditorPages();
    return {
      success: true,
      data: pages,
      meta: { total: pages.length, timestamp: new Date().toISOString() },
    };
  }

  @Get('pages/:id')
  @ApiOperation({ summary: 'Get full Editor.js block tree, WCAG validation, and exports for a page' })
  async getPage(@Param('id') id: string) {
    const page = await this.editorService.getPageForEditor(id);
    return {
      success: true,
      data: page,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Put('pages/:id/blocks')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Save full Editor.js block array for a page (schema validated + versioned)' })
  async savePageBlocks(
    @Param('id') id: string,
    @Body() body: { blocks: any[]; title?: string; locale?: string },
  ) {
    const updated = await this.editorService.savePageBlocks(id, body.blocks, body.title, body.locale);
    return {
      success: true,
      message: 'Page blocks saved and schema validated',
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('pages/:id/autosave')
  @ApiOperation({ summary: 'Auto-save draft Editor.js blocks (triggered every 30s by editor UI)' })
  async autoSaveDraft(
    @Param('id') id: string,
    @Body() body: { blocks: any[] },
  ) {
    const result = await this.editorService.autoSaveDraft(id, body.blocks || []);
    return {
      success: true,
      message: 'Draft auto-saved',
      data: result,
    };
  }

  @Get('pages/:id/export')
  @ApiOperation({ summary: 'Export page Editor.js JSON content to HTML, Markdown, Plain Text, RSS XML, or EPUB' })
  async exportPage(
    @Param('id') id: string,
    @Query('format') format: 'html' | 'markdown' | 'text' | 'rss' | 'epub' = 'html',
  ) {
    const result = await this.editorService.exportPage(id, format);
    return {
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('blocks/validate')
  @ApiOperation({ summary: 'Validate a single block or block array against schema + WCAG 2.2 AAA rules' })
  async validateBlocks(@Body() body: { blocks?: any[]; block?: any }) {
    const targetBlocks = body.blocks || (body.block ? [body.block] : []);
    const result = this.validatorService.validateBlockArray(targetBlocks);
    return {
      success: true,
      data: result,
    };
  }

  @Get('blocks/definitions')
  @ApiOperation({ summary: 'Get all 40+ registered block type definitions, prop schemas, and Editor.js tool mappings' })
  async getBlockDefinitions() {
    const definitions = this.editorService.getAllBlockDefinitions();
    return {
      success: true,
      data: definitions,
      meta: { total: definitions.length, version: 'v1' },
    };
  }

  @Get('blocks/reusable')
  @ApiOperation({ summary: 'List reusable global blocks' })
  async getReusableBlocks() {
    const blocks = this.editorService.getReusableBlocks();
    return {
      success: true,
      data: blocks,
    };
  }

  @Post('blocks/reusable')
  @UseGuards(AuthGuard('jwt'), PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.BLOCKS_MANAGE)
  @ApiOperation({ summary: 'Save a block schema as a global reusable block' })
  async saveReusableBlock(@Body() body: { name: string; blockData: any }) {
    const result = await this.editorService.saveReusableBlock(body.name, body.blockData);
    return {
      success: true,
      data: result,
    };
  }
}
