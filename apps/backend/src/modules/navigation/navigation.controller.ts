import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { NavigationService, MenuLocation, IMenuItem } from './navigation.service';

@ApiTags('Navigation Management')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get('main')
  @ApiOperation({ summary: 'Get primary header navigation menu' })
  async getMainNavigation() {
    const data = await this.navigationService.getMainNavigationLegacy();
    return { success: true, data };
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get footer navigation schema' })
  async getFooterNavigation() {
    const data = await this.navigationService.getFooterNavigationLegacy();
    return { success: true, data };
  }

  @Get('menus')
  @ApiOperation({ summary: 'List all enterprise navigation menus' })
  async getAllMenus() {
    const data = await this.navigationService.getAllMenus();
    return { success: true, data };
  }

  @Post('menus')
  @ApiOperation({ summary: 'Create a new menu for any location' })
  async createMenu(@Body() body: { title: string; location: MenuLocation; description?: string; items?: IMenuItem[] }) {
    const data = await this.navigationService.createMenu(body);
    return { success: true, data };
  }

  @Get('menus/:id')
  @ApiOperation({ summary: 'Get menu details by ID' })
  async getMenuById(@Param('id') id: string) {
    const data = await this.navigationService.getMenuById(id);
    return { success: true, data };
  }

  @Put('menus/:id')
  @ApiOperation({ summary: 'Update existing menu structure and items' })
  async updateMenu(@Param('id') id: string, @Body() body: any) {
    const data = await this.navigationService.updateMenu(id, body);
    return { success: true, data };
  }

  @Delete('menus/:id')
  @ApiOperation({ summary: 'Delete menu' })
  async deleteMenu(@Param('id') id: string) {
    const data = await this.navigationService.deleteMenu(id);
    return { success: true, data };
  }

  @Post('menus/:id/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing menu' })
  async duplicateMenu(@Param('id') id: string) {
    const data = await this.navigationService.duplicateMenu(id);
    return { success: true, data };
  }

  @Get('locations/:location')
  @ApiOperation({ summary: 'Get active menu by location identifier' })
  async getMenuByLocation(@Param('location') location: string) {
    const data = await this.navigationService.getMenuByLocation(location);
    return { success: true, data };
  }

  @Post('menus/:id/items')
  @ApiOperation({ summary: 'Add a new item to menu' })
  async addMenuItem(@Param('id') id: string, @Body() itemData: Omit<IMenuItem, 'id'>) {
    const data = await this.navigationService.addMenuItem(id, itemData);
    return { success: true, data };
  }

  @Post('menus/:id/reorder')
  @ApiOperation({ summary: 'Reorder menu items by ID list' })
  async reorderMenuItems(@Param('id') id: string, @Body() body: { orderedItemIds: string[] }) {
    const data = await this.navigationService.reorderMenuItems(id, body.orderedItemIds || []);
    return { success: true, data };
  }

  @Post('generate-from-content')
  @ApiOperation({ summary: 'Auto-generate menu items from content catalogues' })
  async generateFromContent(@Body() body: { contentType: 'pages' | 'articles' | 'research' | 'publications' | 'poems' | 'categories' }) {
    const data = await this.navigationService.generateMenuFromContentType(body.contentType || 'pages');
    return { success: true, data };
  }

  @Post('items')
  @ApiOperation({ summary: 'Legacy endpoint for adding menu items' })
  async addLegacyMenuItem(@Body() body: { label: string; url: string }) {
    const mainHeader = await this.navigationService.getMenuByLocation('PRIMARY_HEADER');
    if (mainHeader) {
      await this.navigationService.addMenuItem(mainHeader.id, {
        title: body.label,
        targetType: 'internal_page',
        targetUrl: body.url,
        active: true,
        order: mainHeader.items.length,
      });
    }
    return { success: true, message: `Menu item ${body.label} added` };
  }
}
