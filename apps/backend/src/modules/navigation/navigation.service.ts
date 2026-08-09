import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UniversalContentService } from '../content/universal-content.service';

import { TenantConfigService } from '../config/tenant-config.service';

export type MenuLocation =
  | 'PRIMARY_HEADER'
  | 'SECONDARY_HEADER'
  | 'TOP_BAR'
  | 'FOOTER'
  | 'FOOTER_COLUMNS'
  | 'LEFT_SIDEBAR'
  | 'RIGHT_SIDEBAR'
  | 'MOBILE_NAV'
  | 'MOBILE_BOTTOM_NAV'
  | 'DASHBOARD_SIDEBAR'
  | 'DASHBOARD_TOP_NAV'
  | 'USER_MENU'
  | 'PROFILE_MENU'
  | 'BREADCRUMB'
  | 'QUICK_LINKS'
  | 'SOCIAL_MENU'
  | 'LEGAL_MENU'
  | 'UTILITY_MENU'
  | 'CONTEXTUAL_MENU'
  | 'MEGA_MENU'
  | string;

export interface IMenuItem {
  id: string;
  title: string;
  slug?: string;
  targetType: 'internal_page' | 'external_url' | 'dynamic_route' | 'category' | 'tag' | 'custom_link' | 'anchor_link';
  targetUrl: string;
  targetId?: string; // SSOT REFERENCE
  icon?: string;
  badgeText?: string;
  badgeColor?: string;
  description?: string;
  tooltip?: string;
  cssClass?: string;
  target?: '_self' | '_blank';
  rel?: string;
  visibilityRules?: { roles?: string[]; permissions?: string[]; authRequired?: boolean; languages?: string[]; devices?: string[] };
  scheduledPublishAt?: string;
  active: boolean;
  parentId?: string | null;
  order: number;
  children?: IMenuItem[];
}

export interface IMenuSchema {
  id: string;
  title: string;
  location: MenuLocation;
  description?: string;
  enabled: boolean;
  version: number;
  items: IMenuItem[];
  updatedAt: string;
}

@Injectable()
export class NavigationService {
  private menus: Map<string, IMenuSchema> = new Map();
  private versionHistory: Map<string, Array<{ version: number; snapshot: IMenuSchema; timestamp: string }>> = new Map();

  constructor(
    private prisma: PrismaService,
    private universalContentService: UniversalContentService,
    private configService: TenantConfigService,
  ) {
    this.seedDefaultMenus();
  }

  private seedDefaultMenus() {
    const primaryHeaderItems: IMenuItem[] = [
      { id: 'mi-home', title: '', targetType: 'internal_page', targetId: 'page-home', targetUrl: '', active: true, order: 0 },
      {
        id: 'mi-about',
        title: 'About',
        targetType: 'internal_page',
        targetId: 'page-about',
        targetUrl: '',
        active: true,
        order: 1,
        children: [
          { id: 'mi-bio', title: '', targetType: 'internal_page', targetId: 'page-biography', targetUrl: '', active: true, order: 0 },
          { id: 'mi-edu', title: '', targetType: 'internal_page', targetId: 'page-education', targetUrl: '', active: true, order: 1 },
          { id: 'mi-exp', title: '', targetType: 'internal_page', targetId: 'page-experience', targetUrl: '', active: true, order: 2 },
          { id: 'mi-cv', title: '', targetType: 'internal_page', targetId: 'page-resume', targetUrl: '', active: true, order: 3 },
        ],
      },
      {
        id: 'mi-articles',
        title: 'Articles', // static label for the dropdown parent
        targetType: 'dynamic_route',
        targetUrl: '/articles',
        active: true,
        order: 2,
        children: [
          { id: 'mi-art-all', title: 'All Articles', targetType: 'internal_page', targetUrl: '/articles', active: true, order: 0 },
          { id: 'mi-art-cat', title: '', targetType: 'category', targetId: 'cat-1', targetUrl: '', active: true, order: 1 },
          { id: 'mi-art-cat2', title: '', targetType: 'category', targetId: 'cat-4', targetUrl: '', active: true, order: 2 },
        ],
      },
      {
        id: 'mi-research',
        title: 'Research',
        targetType: 'dynamic_route',
        targetUrl: '/research',
        active: true,
        order: 3,
        children: [
          { id: 'mi-res-proj', title: 'Research Projects', targetType: 'internal_page', targetUrl: '/research/projects', active: true, order: 0 },
          { id: 'mi-res-wp', title: 'Working Papers', targetType: 'internal_page', targetUrl: '/research/working-papers', active: true, order: 1 },
          { id: 'mi-res-briefs', title: 'Policy Briefs', targetType: 'internal_page', targetUrl: '/research/policy-briefs', active: true, order: 2 },
        ],
      },
      {
        id: 'mi-pubs',
        title: 'Publications',
        targetType: 'dynamic_route',
        targetUrl: '/publications',
        active: true,
        order: 4,
        children: [
          { id: 'mi-pub-journals', title: 'Journal Articles', targetType: 'internal_page', targetUrl: '/publications/journal-articles', active: true, order: 0 },
          { id: 'mi-pub-books', title: 'Book Chapters & Books', targetType: 'internal_page', targetUrl: '/publications/books', active: true, order: 1 },
        ],
      },
      { id: 'mi-poems', title: 'Poems & Literature', targetType: 'internal_page', targetUrl: '/poems', active: true, order: 5 },
      { id: 'mi-contact', title: '', targetType: 'internal_page', targetId: 'page-contact', targetUrl: '', active: true, order: 6 },
    ];

    const mainHeaderMenu: IMenuSchema = {
      id: 'menu-primary-header',
      title: 'Primary Header Navigation',
      location: 'PRIMARY_HEADER',
      description: 'Main website top-level header navigation menu',
      enabled: true,
      version: 1,
      items: primaryHeaderItems,
      updatedAt: new Date().toISOString(),
    };

    const footerMenu: IMenuSchema = {
      id: 'menu-footer-links',
      title: 'Footer Quick Links Menu',
      location: 'FOOTER',
      description: 'Footer quick navigation links',
      enabled: true,
      version: 1,
      items: [
        { id: 'mi-f-bio', title: '', targetType: 'internal_page', targetId: 'page-biography', targetUrl: '', active: true, order: 0 },
        { id: 'mi-f-priv', title: 'Privacy Policy', targetType: 'internal_page', targetUrl: '/privacy', active: true, order: 1 },
        { id: 'mi-f-terms', title: 'Terms of Service', targetType: 'internal_page', targetUrl: '/terms', active: true, order: 2 },
        { id: 'mi-f-access', title: 'Accessibility Statement (WCAG 2.2 AAA)', targetType: 'internal_page', targetUrl: '/accessibility-statement', active: true, order: 3 },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.menus.set(mainHeaderMenu.id, mainHeaderMenu);
    this.menus.set(footerMenu.id, footerMenu);
  }

  private async hydrateMenuItems(items: IMenuItem[]): Promise<IMenuItem[]> {
    return Promise.all(items.map(async (item) => {
      const hydratedItem = { ...item };
      
      if (item.targetId) {
        if (item.targetType === 'category') {
          try {
            const cat = await this.universalContentService.getCategoryTree();
            const flat = this.flattenCategories(cat);
            const found = flat.find(c => c.id === item.targetId);
            if (found) {
              hydratedItem.title = found.name;
              hydratedItem.targetUrl = '/categories/' + found.slug;
            }
          } catch (e) {}
        } else if (item.targetType === 'internal_page' || item.targetType === 'dynamic_route') {
          try {
            const found = await this.universalContentService.getContentById(item.targetId);
            if (found) {
              hydratedItem.title = found.title;
              hydratedItem.targetUrl = found.slug === 'home' ? '/' : '/' + found.slug;
            }
          } catch (e) {}
        }
      }

      if (item.children && item.children.length > 0) {
        hydratedItem.children = await this.hydrateMenuItems(item.children);
      }

      return hydratedItem;
    }));
  }

  private flattenCategories(cats: any[]): any[] {
    let result: any[] = [];
    for (const c of cats) {
      result.push(c);
      if (c.children) {
        result = result.concat(this.flattenCategories(c.children));
      }
    }
    return result;
  }

  async getMenuByLocation(location: MenuLocation): Promise<IMenuSchema | null> {
    let matchedMenu: IMenuSchema | null = null;
    for (const menu of this.menus.values()) {
      if (menu.location === location && menu.enabled) {
        matchedMenu = menu;
        break;
      }
    }

    if (!matchedMenu) {
      if (location === 'main' || location === 'PRIMARY_HEADER') {
        matchedMenu = this.menus.get('menu-primary-header') || null;
      } else if (location === 'footer' || location === 'FOOTER') {
        matchedMenu = this.menus.get('menu-footer-links') || null;
      }
    }

    if (matchedMenu) {
      const hydratedItems = await this.hydrateMenuItems(matchedMenu.items);
      return { ...matchedMenu, items: hydratedItems };
    }
    
    return null;
  }

  async getAllMenus(): Promise<IMenuSchema[]> {
    const menus = Array.from(this.menus.values());
    const hydratedMenus = await Promise.all(menus.map(async m => {
      const hydratedItems = await this.hydrateMenuItems(m.items);
      return { ...m, items: hydratedItems };
    }));
    return hydratedMenus;
  }

  async getMenuById(id: string): Promise<IMenuSchema> {
    const menu = this.menus.get(id);
    if (!menu) throw new NotFoundException(`Menu with ID ${id} not found`);
    
    const hydratedItems = await this.hydrateMenuItems(menu.items);
    return { ...menu, items: hydratedItems };
  }

  async createMenu(data: { title: string; location: MenuLocation; description?: string; items?: IMenuItem[] }): Promise<IMenuSchema> {
    const id = `menu-${Date.now()}`;
    const newMenu: IMenuSchema = {
      id,
      title: data.title,
      location: data.location,
      description: data.description,
      enabled: true,
      version: 1,
      items: data.items || [],
      updatedAt: new Date().toISOString(),
    };
    this.menus.set(id, newMenu);
    this.recordVersionSnapshot(newMenu);
    
    const hydratedItems = await this.hydrateMenuItems(newMenu.items);
    return { ...newMenu, items: hydratedItems };
  }

  async updateMenu(id: string, updates: Partial<IMenuSchema>): Promise<IMenuSchema> {
    const existing = this.menus.get(id); // don't hydrate for update base
    if (!existing) throw new NotFoundException(`Menu with ID ${id} not found`);
    
    const updated: IMenuSchema = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.menus.set(id, updated);
    this.recordVersionSnapshot(updated);
    
    const hydratedItems = await this.hydrateMenuItems(updated.items);
    return { ...updated, items: hydratedItems };
  }

  async deleteMenu(id: string): Promise<{ success: boolean; deletedId: string }> {
    if (!this.menus.has(id)) throw new NotFoundException(`Menu with ID ${id} not found`);
    this.menus.delete(id);
    return { success: true, deletedId: id };
  }

  async duplicateMenu(id: string): Promise<IMenuSchema> {
    const source = this.menus.get(id);
    if (!source) throw new NotFoundException(`Menu with ID ${id} not found`);
    return this.createMenu({
      title: `${source.title} (Copy)`,
      location: `${source.location}_COPY` as MenuLocation,
      description: source.description,
      items: JSON.parse(JSON.stringify(source.items)),
    });
  }

  async addMenuItem(menuId: string, itemData: Omit<IMenuItem, 'id'>): Promise<IMenuSchema> {
    const menu = this.menus.get(menuId);
    if (!menu) throw new NotFoundException(`Menu with ID ${menuId} not found`);
    const newItem: IMenuItem = {
      ...itemData,
      id: `mi-${Date.now()}`,
      order: itemData.order ?? menu.items.length,
      active: itemData.active ?? true,
    };
    menu.items.push(newItem);
    return this.updateMenu(menuId, { items: menu.items });
  }

  async reorderMenuItems(menuId: string, orderedItemIds: string[]): Promise<IMenuSchema> {
    const menu = this.menus.get(menuId);
    if (!menu) throw new NotFoundException(`Menu with ID ${menuId} not found`);
    
    const itemMap = new Map(menu.items.map((i) => [i.id, i]));
    const reordered: IMenuItem[] = [];

    orderedItemIds.forEach((id, index) => {
      const item = itemMap.get(id);
      if (item) {
        item.order = index;
        reordered.push(item);
      }
    });

    menu.items.forEach((item) => {
      if (!orderedItemIds.includes(item.id)) {
        reordered.push(item);
      }
    });

    return this.updateMenu(menuId, { items: reordered });
  }

  async generateMenuFromContentType(contentType: 'pages' | 'articles' | 'research' | 'publications' | 'poems' | 'categories'): Promise<IMenuItem[]> {
    const catalog: Record<string, Array<{ title: string; url: string }>> = {
      pages: [
        { title: 'Home', url: '/' },
        { title: 'Biography', url: '/about/biography' },
        { title: 'Education', url: '/about/education' },
        { title: 'Contact', url: '/contact' },
      ],
      articles: [
        { title: 'Supported Decision-Making in Nepal', url: '/articles/supported-decision-making' },
        { title: 'Harmonizing Legislation with UN CRPD', url: '/articles/crpd-harmonization' },
      ],
      research: [
        { title: 'Legal Capacity Research Project', url: '/research/projects/legal-capacity' },
        { title: 'Disability Rights Working Paper', url: '/research/working-papers/disability-rights' },
      ],
      publications: [
        { title: 'Kathmandu Law Review Article (2026)', url: '/publications/journal-articles/kathmandu-law-review-2026' },
      ],
      poems: [
        { title: 'Echoes of Silence (Nepalese Literature)', url: '/poems/echoes-of-silence' },
      ],
      categories: [
        { title: 'Legal Studies', url: '/categories/legal-studies' },
        { title: 'Human Rights', url: '/categories/human-rights' },
        { title: 'Accessibility', url: '/categories/accessibility' },
      ],
    };

    const items = catalog[contentType] || [];
    return items.map((item, idx) => ({
      id: `gen-${contentType}-${idx}`,
      title: item.title,
      targetType: 'internal_page',
      targetUrl: item.url,
      active: true,
      order: idx,
    }));
  }

  async getMainNavigationLegacy() {
    const mainHeader = await this.getMenuByLocation('PRIMARY_HEADER');
    if (mainHeader) {
      return mainHeader.items.map((i) => ({
        label: i.title,
        url: i.targetUrl,
        icon: i.icon,
        order: i.order,
        children: i.children?.map((c) => ({ label: c.title, url: c.targetUrl, icon: c.icon })),
      }));
    }
    return [];
  }

  async getFooterNavigationLegacy() {
    const footer = await this.getMenuByLocation('FOOTER');
    const tid = 'default-tenant-id';
    const aboutText = await this.configService.getSetting(tid, 'footer', 'aboutText');
    const copyright = await this.configService.getSetting(tid, 'footer', 'copyright');
    const orcid = await this.configService.getSetting(tid, 'profile', 'orcid');
    const scholar = await this.configService.getSetting(tid, 'profile', 'scholar');
    const linkedin = await this.configService.getSetting(tid, 'profile', 'linkedin');
    const github = await this.configService.getSetting(tid, 'profile', 'github');

    return {
      aboutText: aboutText || 'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal.',
      columns: [
        {
          title: 'Quick Links',
          links: footer?.items.map((i) => ({ label: i.title, url: i.targetUrl })) || [],
        },
      ],
      socialMedia: [
        { platform: 'ORCID', url: orcid ? (orcid.startsWith('http') ? orcid : `https://orcid.org/${orcid}`) : 'https://orcid.org' },
        { platform: 'Google Scholar', url: scholar || 'https://scholar.google.com' },
        { platform: 'LinkedIn', url: linkedin || 'https://linkedin.com' },
        { platform: 'GitHub', url: github || 'https://github.com/sandipthapa123' },
      ],
      copyright: copyright || '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
    };
  }

  private recordVersionSnapshot(menu: IMenuSchema) {
    const snapshots = this.versionHistory.get(menu.id) || [];
    snapshots.push({
      version: menu.version,
      snapshot: JSON.parse(JSON.stringify(menu)),
      timestamp: new Date().toISOString(),
    });
    this.versionHistory.set(menu.id, snapshots);
  }
}
