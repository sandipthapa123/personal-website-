import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { UniversalContentService, IUniversalContentItem } from './universal-content.service';

@ApiTags('Universal Content Management System')
@Controller('content')
export class UniversalContentController {
  constructor(private contentService: UniversalContentService) {}

  // ─── CORE CRUD ───────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get Universal Content Repository Items with full filtering, sorting, pagination' })
  getAllContent(
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

    const result = this.contentService.searchContent({
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
      sortBy: (sortBy as any) || 'updatedAt',
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
  getStats() {
    const stats = this.contentService.getContentStats();
    return { success: true, data: stats };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently updated content items for dashboard activity feed' })
  getRecentActivity(@Query('limit') limit?: string) {
    const items = this.contentService.getRecentActivity(limit ? parseInt(limit, 10) : 10);
    return { success: true, data: items };
  }

  // ─── CONTENT TYPES ───────────────────────────────────────────────────────────

  @Get('types')
  @ApiOperation({ summary: 'Get all Content Types (System + Custom)' })
  getContentTypes() {
    const types = this.contentService.getContentTypes();
    return { success: true, data: types };
  }

  @Post('types')
  @ApiOperation({ summary: 'Create new custom administrator-defined Content Type' })
  registerContentType(@Body() body: { name: string; description?: string }) {
    const created = this.contentService.registerContentType(body.name, body.description);
    return { success: true, data: created };
  }

  // ─── MASTER CATEGORY MANAGEMENT (SINGLE SOURCE OF TRUTH) ─────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'Get all Master Categories (Single Source of Truth)' })
  getCategories() {
    const categories = this.contentService.getAllCategories();
    return { success: true, data: categories };
  }

  @Get('categories/tree')
  @ApiOperation({ summary: 'Get Master Category Hierarchy Tree' })
  getCategoryTree() {
    const tree = this.contentService.getCategoryTree();
    return { success: true, data: tree };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create new Master Category' })
  createCategory(@Body() body: any) {
    const created = this.contentService.createCategory(body);
    return { success: true, data: created };
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update Master Category & Propagate Name Changes' })
  updateCategory(@Param('id') id: string, @Body() body: any) {
    const updated = this.contentService.updateCategory(id, body);
    return { success: true, data: updated };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete Master Category' })
  deleteCategory(@Param('id') id: string) {
    const deleted = this.contentService.deleteCategory(id);
    return { success: true, data: { deleted } };
  }

  @Post('categories/merge')
  @ApiOperation({ summary: 'Merge Duplicate Categories into Single Master Category' })
  mergeCategories(@Body() body: { targetId: string; sourceIds: string[] }) {
    const merged = this.contentService.mergeCategories(body.targetId, body.sourceIds);
    return { success: true, data: merged };
  }

  // ─── TAGS ENGINE ──────────────────────────────────────────────────────────────

  @Get('tags')
  @ApiOperation({ summary: 'Get Master Tag Suggestions for Autocomplete' })
  getTags() {
    const tags = this.contentService.getAllTags();
    return { success: true, data: tags };
  }

  // ─── RECYCLE BIN ─────────────────────────────────────────────────────────────

  @Get('recycle-bin')
  @ApiOperation({ summary: 'Get soft-deleted items in Recycle Bin' })
  getRecycleBin() {
    const result = this.contentService.searchContent({ status: 'RECYCLE_BIN', includeDeleted: true, limit: 100 });
    // Fallback: get all deleted
    const allDeleted = this.contentService.getAllContent({ includeDeleted: true })
      .items?.filter((i: any) => i.isDeleted) || [];
    return { success: true, data: { items: allDeleted, total: allDeleted.length } };
  }

  // ─── BULK OPERATIONS ─────────────────────────────────────────────────────────

  @Post('bulk')
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
      const data = this.contentService.exportContent(body.format || 'json');
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
  @ApiOperation({ summary: 'Export content as JSON, CSV, or Markdown' })
  exportContent(@Body() body: { format?: 'json' | 'csv' | 'markdown'; types?: string[] }) {
    const data = this.contentService.exportContent(body.format || 'json', body.types);
    return { success: true, data, format: body.format || 'json' };
  }

  @Post('import')
  @ApiOperation({ summary: 'Import content records (bulk create)' })
  importContent(@Body() body: { items: Partial<IUniversalContentItem>[] }) {
    const result = this.contentService.importContent(body.items || []);
    return { success: true, data: result };
  }

  // ─── SCHEDULE PROCESSING ─────────────────────────────────────────────────────

  @Post('process-scheduled')
  @ApiOperation({ summary: 'Process all scheduled content items that are due for publishing' })
  processScheduled() {
    const count = this.contentService.processScheduledPublishing();
    return { success: true, data: { published: count } };
  }

  // ─── SINGLE CONTENT ITEM OPERATIONS ──────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get Single Content Item by ID' })
  getContentById(@Param('id') id: string) {
    const item = this.contentService.getContentById(id);
    return { success: true, data: item };
  }

  @Post()
  @ApiOperation({ summary: 'Create Single Source of Truth Content Record' })
  createContent(@Body() body: Partial<IUniversalContentItem>) {
    const created = this.contentService.createContent(body);
    return { success: true, data: created };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Content Record across all Module Views' })
  updateContent(@Param('id') id: string, @Body() body: Partial<IUniversalContentItem>) {
    const updated = this.contentService.updateContent(id, body);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete Content Item to Recycle Bin' })
  deleteContent(@Param('id') id: string) {
    const deleted = this.contentService.deleteContent(id);
    return { success: true, data: { deleted } };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore Soft-deleted Content Item from Recycle Bin' })
  restoreContent(@Param('id') id: string) {
    const restored = this.contentService.restoreContent(id);
    return { success: true, data: restored };
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently Purge Content Item (cannot be undone)' })
  permanentDeleteContent(@Param('id') id: string) {
    const purged = this.contentService.permanentDeleteContent(id);
    return { success: true, data: { purged } };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a content item (DRAFT → PUBLISHED)' })
  publishContent(@Param('id') id: string) {
    const updated = this.contentService.publishContent(id);
    return { success: true, message: 'Content published successfully', data: updated };
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a content item (PUBLISHED → DRAFT)' })
  unpublishContent(@Param('id') id: string) {
    const updated = this.contentService.unpublishContent(id);
    return { success: true, message: 'Content unpublished (moved to Draft)', data: updated };
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a content item (any status → ARCHIVED)' })
  archiveContent(@Param('id') id: string) {
    const updated = this.contentService.archiveContent(id);
    return { success: true, message: 'Content archived', data: updated };
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate/Clone a content item as a new DRAFT' })
  duplicateContent(@Param('id') id: string) {
    const copy = this.contentService.duplicateContent(id);
    return { success: true, message: 'Content duplicated as new Draft', data: copy };
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a content item for future publishing' })
  scheduleContent(@Param('id') id: string, @Body() body: { scheduledAt: string }) {
    if (!body.scheduledAt) {
      return { success: false, message: 'scheduledAt date is required' };
    }
    const updated = this.contentService.scheduleContent(id, body.scheduledAt);
    return { success: true, message: `Content scheduled for ${body.scheduledAt}`, data: updated };
  }

  // ─── REVISIONS / VERSION HISTORY ─────────────────────────────────────────────

  @Get(':id/revisions')
  @ApiOperation({ summary: 'Get full version history / revision list for a content item' })
  getRevisions(@Param('id') id: string) {
    const revisions = this.contentService.getRevisions(id);
    return { success: true, data: revisions };
  }

  @Post(':id/revisions/:revId/restore')
  @ApiOperation({ summary: 'Restore a specific revision of a content item' })
  restoreRevision(@Param('id') id: string, @Param('revId') revId: string) {
    const restored = this.contentService.restoreRevision(id, revId);
    return { success: true, message: 'Revision restored successfully', data: restored };
  }
}
