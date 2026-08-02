import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

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

  constructor(private prisma: PrismaService) {
    this.seedDefaultMenus();
  }

  private seedDefaultMenus() {
    const primaryHeaderItems: IMenuItem[] = [
      { id: 'mi-home', title: 'Home', targetType: 'internal_page', targetUrl: '/', active: true, order: 0 },
      {
        id: 'mi-about',
        title: 'About',
        targetType: 'internal_page',
        targetUrl: '/about',
        active: true,
        order: 1,
        children: [
          { id: 'mi-bio', title: 'Biography', targetType: 'internal_page', targetUrl: '/about/biography', active: true, order: 0 },
          { id: 'mi-edu', title: 'Education & Credentials', targetType: 'internal_page', targetUrl: '/about/education', active: true, order: 1 },
          { id: 'mi-exp', title: 'Experience & Roles', targetType: 'internal_page', targetUrl: '/about/experience', active: true, order: 2 },
          { id: 'mi-cv', title: 'Curriculum Vitae', targetType: 'internal_page', targetUrl: '/about/resume', active: true, order: 3 },
        ],
      },
      {
        id: 'mi-articles',
        title: 'Articles',
        targetType: 'dynamic_route',
        targetUrl: '/articles',
        active: true,
        order: 2,
        children: [
          { id: 'mi-art-all', title: 'All Articles', targetType: 'internal_page', targetUrl: '/articles', active: true, order: 0 },
          { id: 'mi-art-cat', title: 'Categories', targetType: 'internal_page', targetUrl: '/articles/categories', active: true, order: 1 },
          { id: 'mi-art-tags', title: 'Tags', targetType: 'internal_page', targetUrl: '/articles/tags', active: true, order: 2 },
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
      { id: 'mi-contact', title: 'Contact', targetType: 'internal_page', targetUrl: '/contact', active: true, order: 6 },
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
        { id: 'mi-f-bio', title: 'Biography', targetType: 'internal_page', targetUrl: '/about/biography', active: true, order: 0 },
        { id: 'mi-f-priv', title: 'Privacy Policy', targetType: 'internal_page', targetUrl: '/privacy', active: true, order: 1 },
        { id: 'mi-f-terms', title: 'Terms of Service', targetType: 'internal_page', targetUrl: '/terms', active: true, order: 2 },
        { id: 'mi-f-access', title: 'Accessibility Statement (WCAG 2.2 AAA)', targetType: 'internal_page', targetUrl: '/accessibility-statement', active: true, order: 3 },
      ],
      updatedAt: new Date().toISOString(),
    };

    this.menus.set(mainHeaderMenu.id, mainHeaderMenu);
    this.menus.set(footerMenu.id, footerMenu);
  }

  async getMenuByLocation(location: MenuLocation): Promise<IMenuSchema | null> {
    for (const menu of this.menus.values()) {
      if (menu.location === location && menu.enabled) {
        return menu;
      }
    }

    // Default fallback
    if (location === 'main' || location === 'PRIMARY_HEADER') {
      return this.menus.get('menu-primary-header') || null;
    }
    if (location === 'footer' || location === 'FOOTER') {
      return this.menus.get('menu-footer-links') || null;
    }
    return null;
  }

  async getAllMenus(): Promise<IMenuSchema[]> {
    return Array.from(this.menus.values());
  }

  async getMenuById(id: string): Promise<IMenuSchema> {
    const menu = this.menus.get(id);
    if (!menu) throw new NotFoundException(`Menu with ID ${id} not found`);
    return menu;
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
    return newMenu;
  }

  async updateMenu(id: string, updates: Partial<IMenuSchema>): Promise<IMenuSchema> {
    const existing = await this.getMenuById(id);
    const updated: IMenuSchema = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.menus.set(id, updated);
    this.recordVersionSnapshot(updated);
    return updated;
  }

  async deleteMenu(id: string): Promise<{ success: boolean; deletedId: string }> {
    await this.getMenuById(id);
    this.menus.delete(id);
    return { success: true, deletedId: id };
  }

  async duplicateMenu(id: string): Promise<IMenuSchema> {
    const source = await this.getMenuById(id);
    return this.createMenu({
      title: `${source.title} (Copy)`,
      location: `${source.location}_COPY` as MenuLocation,
      description: source.description,
      items: JSON.parse(JSON.stringify(source.items)),
    });
  }

  async addMenuItem(menuId: string, itemData: Omit<IMenuItem, 'id'>): Promise<IMenuSchema> {
    const menu = await this.getMenuById(menuId);
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
    const menu = await this.getMenuById(menuId);
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
    return {
      aboutText: 'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal.',
      columns: [
        {
          title: 'Quick Links',
          links: footer?.items.map((i) => ({ label: i.title, url: i.targetUrl })) || [],
        },
      ],
      socialMedia: [
        { platform: 'ORCID', url: 'https://orcid.org/0000-0002-1234-5678' },
        { platform: 'Google Scholar', url: 'https://scholar.google.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
      ],
      copyright: '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
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
