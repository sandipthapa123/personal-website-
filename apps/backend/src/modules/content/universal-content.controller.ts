import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { UniversalContentService, IUniversalContentItem } from './universal-content.service';

@ApiTags('Universal Content Management System')
@Controller('content')
export class UniversalContentController {
  constructor(private contentService: UniversalContentService) {}

  @Get()
  @ApiOperation({ summary: 'Get Universal Content Repository Items with Module Filters & Search' })
  getAllContent(
    @Query('contentType') contentType?: string,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('includeDeleted') includeDeleted?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const res = this.contentService.getAllContent({
      contentType,
      category,
      tag,
      status,
      search,
      includeDeleted: includeDeleted === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sortBy,
      sortOrder,
    });
    return { success: true, data: res };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all Content Types (Default + Custom Admin Defined)' })
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

  @Get('recycle-bin')
  @ApiOperation({ summary: 'Get soft-deleted items in Recycle Bin' })
  getRecycleBin() {
    const res = this.contentService.getAllContent({ status: 'RECYCLE_BIN', includeDeleted: true });
    return { success: true, data: res };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single content item by ID' })
  getContentById(@Param('id') id: string) {
    const item = this.contentService.getContentById(id);
    return { success: true, data: item };
  }

  @Post()
  @ApiOperation({ summary: 'Create new content item in Universal Repository' })
  createContent(@Body() dto: Partial<IUniversalContentItem>) {
    const created = this.contentService.createContent(dto);
    return { success: true, data: created };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content item across all classifications (Single Source of Truth)' })
  updateContent(@Param('id') id: string, @Body() dto: Partial<IUniversalContentItem>) {
    const updated = this.contentService.updateContent(id, dto);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete content item (Move to Recycle Bin)' })
  softDeleteContent(@Param('id') id: string) {
    const deleted = this.contentService.softDeleteContent(id);
    return { success: true, data: deleted };
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore soft-deleted content item from Recycle Bin' })
  restoreContent(@Param('id') id: string) {
    const restored = this.contentService.restoreContent(id);
    return { success: true, data: restored };
  }

  @Delete(':id/permanent')
  @ApiOperation({ summary: 'Permanently delete content item' })
  permanentDeleteContent(@Param('id') id: string) {
    const result = this.contentService.permanentDeleteContent(id);
    return { success: true, data: { deleted: result } };
  }

  @Post(':id/types')
  @ApiOperation({ summary: 'Add a Content Type to a content item' })
  addContentType(@Param('id') id: string, @Body('contentType') contentType: string) {
    const updated = this.contentService.addContentTypeToItem(id, contentType);
    return { success: true, data: updated };
  }

  @Delete(':id/types/:type')
  @ApiOperation({ summary: 'Remove a Content Type from a content item' })
  removeContentType(@Param('id') id: string, @Param('type') type: string) {
    const updated = this.contentService.removeContentTypeFromItem(id, type);
    return { success: true, data: updated };
  }
}
