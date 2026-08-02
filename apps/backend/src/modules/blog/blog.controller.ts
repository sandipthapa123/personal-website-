import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Blog & Posts Module')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get blog posts with pagination and status filter' })
  async getPosts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    const tid = tenantId || 'default-tenant-id';
    const result = await this.blogService.getPublishedPosts(tid, parseInt(limit, 10), parseInt(page, 10), status);
    return {
      success: true,
      statusCode: 200,
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        hasNextPage: result.page * result.limit < result.total,
        hasPrevPage: result.page > 1,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Get single blog post by slug or ID' })
  async getPost(@Headers('x-tenant-id') tenantId: string, @Param('slug') slug: string) {
    const tid = tenantId || 'default-tenant-id';
    const post = await this.blogService.getPostBySlug(tid, slug);
    return {
      success: true,
      statusCode: 200,
      data: post,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Post('posts')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create new blog post' })
  async createPost(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const post = await this.blogService.createPost(tid, body);
    return {
      success: true,
      statusCode: 201,
      data: post,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }

  @Put('posts/:id')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_EDIT)
  @ApiOperation({ summary: 'Update existing blog post' })
  async updatePost(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const updated = await this.blogService.updatePost(tid, id, body);
    return {
      success: true,
      statusCode: 200,
      data: updated,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Delete('posts/:id')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_DELETE)
  @ApiOperation({ summary: 'Delete blog post' })
  async deletePost(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    const tid = tenantId || 'default-tenant-id';
    const result = await this.blogService.deletePost(tid, id);
    return {
      success: true,
      statusCode: 200,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  // Categories & Tags
  @Get('categories')
  @ApiOperation({ summary: 'Get all categories' })
  async getCategories() {
    const categories = await this.blogService.getCategories();
    return { success: true, statusCode: 200, data: categories };
  }

  @Post('categories')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create new category' })
  async createCategory(@Body() body: { name: string }) {
    const cat = await this.blogService.createCategory(body.name);
    return { success: true, statusCode: 201, data: cat };
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all tags' })
  async getTags() {
    const tags = await this.blogService.getTags();
    return { success: true, statusCode: 200, data: tags };
  }

  @Post('tags')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create new tag' })
  async createTag(@Body() body: { name: string }) {
    const tag = await this.blogService.createTag(body.name);
    return { success: true, statusCode: 201, data: tag };
  }

  // Poems
  @Get('poems')
  @ApiOperation({ summary: 'Get all poems' })
  async getPoems(@Headers('x-tenant-id') tenantId: string) {
    const tid = tenantId || 'default-tenant-id';
    const poems = await this.blogService.getPoems(tid);
    return { success: true, statusCode: 200, data: poems };
  }

  @Post('poems')
  @UseGuards(PolicyGuard)
  @RequirePolicy(PERMISSION_ACTIONS.PAGES_CREATE)
  @ApiOperation({ summary: 'Create new poem entry' })
  async createPoem(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    const tid = tenantId || 'default-tenant-id';
    const poem = await this.blogService.createPoem(tid, body);
    return { success: true, statusCode: 201, data: poem };
  }
}
