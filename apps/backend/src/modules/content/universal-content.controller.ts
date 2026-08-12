import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';
import { UniversalContentService, IUniversalContentItem } from './universal-content.service';

/**
 * Content repository API — the admin console is its only HTTP consumer; the public
 * site renders through RendererService in-process. Every route is therefore behind
 * authentication: these endpoints expose drafts, recycle-bin items and post
 * passwords, and previously allowed anyone on the internet to create, publish and
 * permanently delete content. PolicyGuard is a no-op on routes without a
 * @RequirePolicy, so reads need a valid session but no specific permission.
 */
@ApiTags('Universal Content Management System')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PolicyGuard)
@Controller('content')
export class UniversalContentController {
  constructor(private contentService: UniversalContentService) {}

  // ─── CORE CRUD ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get Universal Content Repository Items with full filtering, sorting, pagination' })
  async getAllContent(
    @Query('contentType') contentType?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
    @Query('locale') locale?: string,
    @Query('author') author?: string,
    @Query('search') search?: string,
    @Query('q') q?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const effectiveType = type || contentType;
    const effectiveQuery = q || search;

    const result = await this.contentService.searchContent({
      query: effectiveQuery,
      type: effectiveType,
      category,
      tag,
      status,
      locale,
      author,
      dateFrom,
      dateTo,
      includeDeleted: includeDeleted === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy: (sortBy as any) || 'updated_at',
      sortOrder: sortOrder || 'desc',
    });

    return {
      success: true,
      statusCode: 200,
      data: {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get Content Statistics — live counts by status, type, views, words' })
  async getStats() {
    const stats = await this.contentService.getContentStats();
    return { success: true, data: stats };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently updated content items for dashboard activity feed' })
  async getRecentActivity(@Query('limit') limit?: string) {
    const items = await this.contentService.getRecentActivity(limit ? parseInt(limit, 10) : 10);
    return { success: true, data: items };
  }

  // ─── CONTENT TYPES ───────────────────────────────────────────────────────────

  @Get('types')
  @ApiOperation({ summary: 'Get all Content Types (System + Custom)' })
  async getContentTypes() {
    const types = await this.contentService.getContentTypes();
    return { success: true, data: types };
  }

  @Post('types')
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Create new custom administrator-defined Content Type' })
  async registerContentType(@Body() body: { name: string; description?: string }) {
    const created = await this.contentService.registerContentType(body.name, body.description);
    return { success: true, data: created };
  }

  // ─── MASTER CATEGORY MANAGEMENT (SINGLE SOURCE OF TRUTH) ─────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'Get all Master Categories (Single Source of Truth)' })
  async getCategories() {
    const categories = await this.contentService.getAllCategories();
    return { success: true, data: categories };
  }

  @Get('categories/tree')
  @ApiOperation({ summary: 'Get Master Category Hierarchy Tree' })
  async getCategoryTree() {
    const tree = await this.contentService.getCategoryTree();
    return { success: true, data: tree };
  }

  @Post('categories')
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Create new Master Category' })
  async createCategory(@Body() body: any) {
    const created = await this.contentService.createCategory(body);
    return { success: true, data: created };
  }

  @Put('categories/:id')
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Update Master Category & Propagate Name Changes' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const updated = await this.contentService.updateCategory(id, body);
    return { success: true, data: updated };
  }

  @Delete('categories/:id')
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Delete Master Category' })
  async deleteCategory(@Param('id') id: string) {
    const deleted = await this.contentService.deleteCategory(id);
    return { success: true, data: { deleted } };
  }

  @Post('categories/merge')
  @RequirePolicy(PERMISSION_ACTIONS.SETTINGS_MANAGE)
  @ApiOperation({ summary: 'Merge Duplicate Categories into Single Master Category' })
  async mergeCategories(@Body() body: { targetId: string; sourceIds: string[] }) {
    const merged = await this.contentService.mergeCategories(body.targetId, body.sourceIds);
    return { success: true, data: merged };
  }

  // ─── TAGS ENGINE ──────────────────────────────────────────────────────────────

  @Get('tags')
  @ApiOperation({ summary: 'Get Master Tag Suggestions for Autocomplete' })
  async getTags() {
    const tags = await this.contentService.getAllTags();
    return { success: true, data: tags };
  }

  // ─── RECYCLE BIN ─────────────────────────────────────────────────────────────

  @Get('recycle-bin')
  @ApiOperation({ summary: 'Get soft-deleted items in Recycle Bin' })
  async getRecycleBin(@Query('page') page?: string, @Query('limit') limit?: string) {
    // `status: 'RECYCLE_BIN'` already restricts the query to soft-deleted rows, so the
    // result is used directly — the previous client-side filter over an unfiltered,
    // default-paginated fetch could only ever find trashed items inside the first page.
    const result = await this.contentService.searchContent({
      status: 'RECYCLE_BIN',
      includeDeleted: true,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 100,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });

    return {
      success: true,
      data: { items: result.items, total: result.total, page: result.page, totalPages: result.totalPages },
    };
  }

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

  @Post('bulk')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_PUBLISH)
  @ApiOperation({ summary: 'Execute bulk publish, unpublish, archive, delete, restore, permanent-delete, or export' })
  async bulkOperation(
    @Body() body: {
      operation: 'publish' | 'unpublish' | 'archive' | 'delete' | 'restore' | 'permanent-delete' | 'export';
      ids: string[];
      format?: 'json' | 'csv' | 'markdown';
    },
    @Res() res: Response,
  ) {
    if (body.operation === 'export') {
      const data = await this.contentService.exportContent(body.format || 'json');
      return res.status(200).json({ success: true, data });
    }

    const result = await this.contentService.bulkOperation(body.operation, body.ids || []);
    return res.status(200).json({
      success: true,
      message: `Bulk ${body.operation} completed: ${result.processed} processed, ${result.failed} failed`,
      data: result,
    });
  }

  // ─── EXPORT / IMPORT ─────────────────────────────────────────────────────────

  @Post('export')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_READ)
  @ApiOperation({ summary: 'Export content as JSON, CSV, or Markdown' })
  async exportContent(@Body() body: { format?: 'json' | 'csv' | 'markdown'; types?: string[] }) {
    const data = await this.contentService.exportContent(body.format || 'json', body.types);
    return { success: true, data, format: body.format || 'json' };
  }

  @Post('import')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Import content records (bulk create)' })
  async importContent(@Body() body: { items: Partial<IUniversalContentItem>[] }) {
    const result = await this.contentService.importContent(body.items || []);
    return { success: true, data: result };
  }

  // ─── SCHEDULE PROCESSING ─────────────────────────────────────────────────────

  @Post('process-scheduled')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_PUBLISH)
  @ApiOperation({ summary: 'Process all scheduled content items that are due for publishing' })
  async processScheduled() {
    const count = await this.contentService.processScheduledPublishing();
    return { success: true, data: { published: count } };
  }

  // ─── SINGLE CONTENT ITEM OPERATIONS ──────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get Single Content Item by ID' })
  async getContentById(@Param('id') id: string) {
    const item = await this.contentService.getContentById(id);
    return { success: true, data: item };
  }

  @Post()
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create Single Source of Truth Content Record' })
  async createContent(@Body() body: Partial<IUniversalContentItem>) {
    const created = await this.contentService.createContent(body as IUniversalContentItem);
    return { success: true, data: created };
  }

  @Put(':id')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Update Content Record across all Module Views' })
  async updateContent(@Param('id') id: string, @Body() body: Partial<IUniversalContentItem>) {
    const updated = await this.contentService.updateContent(id, body);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_DELETE)
  @ApiOperation({ summary: 'Soft-delete Content Item to Recycle Bin' })
  async deleteContent(@Param('id') id: string) {
    const deleted = await this.contentService.deleteContent(id);
    return { success: true, data: { deleted } };
  }

  @Post(':id/restore')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Restore Soft-deleted Content Item from Recycle Bin' })
  async restoreContent(@Param('id') id: string) {
    const restored = await this.contentService.restoreContent(id);
    return { success: true, data: restored };
  }

  @Delete(':id/permanent')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_DELETE)
  @ApiOperation({ summary: 'Permanently Purge Content Item (cannot be undone)' })
  async permanentDeleteContent(@Param('id') id: string) {
    const purged = await this.contentService.permanentDeleteContent(id);
    return { success: true, data: { purged } };
  }

  @Post(':id/publish')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_PUBLISH)
  @ApiOperation({ summary: 'Publish a content item (DRAFT → PUBLISHED)' })
  async publishContent(@Param('id') id: string) {
    const updated = await this.contentService.publishContent(id);
    return { success: true, message: 'Content published successfully', data: updated };
  }

  @Post(':id/unpublish')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_PUBLISH)
  @ApiOperation({ summary: 'Unpublish a content item (PUBLISHED → DRAFT)' })
  async unpublishContent(@Param('id') id: string) {
    const updated = await this.contentService.unpublishContent(id);
    return { success: true, message: 'Content unpublished (moved to Draft)', data: updated };
  }

  @Post(':id/archive')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Archive a content item (any status → ARCHIVED)' })
  async archiveContent(@Param('id') id: string) {
    const updated = await this.contentService.archiveContent(id);
    return { success: true, message: 'Content archived', data: updated };
  }

  @Post(':id/duplicate')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Duplicate/Clone a content item as a new DRAFT' })
  async duplicateContent(@Param('id') id: string) {
    const copy = await this.contentService.duplicateContent(id);
    return { success: true, message: 'Content duplicated as new Draft', data: copy };
  }

  @Post(':id/schedule')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_PUBLISH)
  @ApiOperation({ summary: 'Schedule a content item for future publishing' })
  async scheduleContent(@Param('id') id: string, @Body() body: { scheduledAt: string }) {
    if (!body.scheduledAt) {
      return { success: false, message: 'scheduledAt date is required' };
    }
    const updated = await this.contentService.scheduleContent(id, body.scheduledAt);
    return { success: true, message: `Content scheduled for ${body.scheduledAt}`, data: updated };
  }

  // ─── REVISIONS / VERSION HISTORY ─────────────────────────────────────────────

  @Get(':id/revisions')
  @ApiOperation({ summary: 'Get full version history / revision list for a content item' })
  async getRevisions(@Param('id') id: string) {
    const revisions = await this.contentService.getRevisions(id);
    return { success: true, data: revisions };
  }

  @Post(':id/revisions/:revId/restore')
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Restore a specific revision of a content item' })
  async restoreRevision(@Param('id') id: string, @Param('revId') revId: string) {
    const restored = await this.contentService.restoreRevision(id, revId);
    return { success: true, message: 'Revision restored successfully', data: restored };
  }
}
