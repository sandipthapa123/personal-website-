import { Controller, Get, Post, Body, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { PolicyGuard } from '../permissions/policy.guard';
import { RequirePolicy } from '../permissions/policy.decorator';
import { PERMISSION_ACTIONS } from '@cms/constants';

@ApiTags('Blog Module')
@Controller('blog')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get published blog posts' })
  async getPosts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const tid = tenantId || 'default-tenant-id';
    const result = await this.blogService.getPublishedPosts(tid, parseInt(limit, 10), parseInt(page, 10));
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
  @ApiOperation({ summary: 'Get single blog post by slug' })
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
  async createPost(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { title: string; content: string; summary?: string; locale?: string },
  ) {
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
}
