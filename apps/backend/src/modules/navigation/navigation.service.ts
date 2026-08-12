import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
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

/** Default seed content — only ever written to the database once, the first time
 * a given menu location has no rows yet. After that, everything is DB-driven. */
const DEFAULT_PRIMARY_HEADER_ITEMS: Array<Omit<IMenuItem, 'id' | 'active'>> = [
  { title: 'Home', targetType: 'internal_page', targetUrl: '/', order: 0 },
  {
    title: 'About',
    targetType: 'internal_page',
    targetUrl: '/about',
    order: 1,
    children: [
      { title: 'Biography', targetType: 'internal_page', targetUrl: '/about/biography', order: 0 } as IMenuItem,
      { title: 'Education', targetType: 'internal_page', targetUrl: '/about/education', order: 1 } as IMenuItem,
      { title: 'Experience', targetType: 'internal_page', targetUrl: '/about/experience', order: 2 } as IMenuItem,
      { title: 'CV / Resume', targetType: 'internal_page', targetUrl: '/about/resume', order: 3 } as IMenuItem,
    ],
  },
  {
    title: 'Articles',
    targetType: 'dynamic_route',
    targetUrl: '/articles',
    order: 2,
    children: [
      { title: 'All Articles', targetType: 'internal_page', targetUrl: '/articles', order: 0 } as IMenuItem,
      { title: 'Categories', targetType: 'internal_page', targetUrl: '/articles/categories', order: 1 } as IMenuItem,
      { title: 'Tags', targetType: 'internal_page', targetUrl: '/articles/tags', order: 2 } as IMenuItem,
    ],
  },
  {
    title: 'Research',
    targetType: 'dynamic_route',
    targetUrl: '/research',
    order: 3,
    children: [
      { title: 'Research Projects', targetType: 'internal_page', targetUrl: '/research/projects', order: 0 } as IMenuItem,
      { title: 'Working Papers', targetType: 'internal_page', targetUrl: '/research/working-papers', order: 1 } as IMenuItem,
      { title: 'Policy Briefs', targetType: 'internal_page', targetUrl: '/research/policy-briefs', order: 2 } as IMenuItem,
    ],
  },
  {
    title: 'Publications',
    targetType: 'dynamic_route',
    targetUrl: '/publications',
    order: 4,
    children: [
      { title: 'Journal Articles', targetType: 'internal_page', targetUrl: '/publications/journal-articles', order: 0 } as IMenuItem,
      { title: 'Book Chapters & Books', targetType: 'internal_page', targetUrl: '/publications/books', order: 1 } as IMenuItem,
    ],
  },
  { title: 'Poems & Literature', targetType: 'internal_page', targetUrl: '/poems', order: 5 },
  { title: 'Contact', targetType: 'internal_page', targetUrl: '/contact', order: 6 },
] as Array<Omit<IMenuItem, 'id' | 'active'>>;

const DEFAULT_FOOTER_ITEMS: Array<Omit<IMenuItem, 'id' | 'active'>> = [
  { title: 'Biography', targetType: 'internal_page', targetUrl: '/about/biography', order: 0 },
  { title: 'Privacy Policy', targetType: 'internal_page', targetUrl: '/privacy', order: 1 },
  { title: 'Terms of Service', targetType: 'internal_page', targetUrl: '/terms', order: 2 },
  { title: 'Accessibility Statement (WCAG 2.2 AAA)', targetType: 'internal_page', targetUrl: '/accessibility-statement', order: 3 },
];

@Injectable()
export class NavigationService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private universalContentService: UniversalContentService,
    private configService: TenantConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureDefaultMenus();
    } catch {
      // Tenant/DB may not be ready at boot (e.g. first-ever migration run) — the
      // lazy getMenuByLocation() fallback below covers this case too.
    }
  }

  private async resolveTenantId(): Promise<string> {
    const tenant =
      (await this.prisma.tenant.findFirst({ where: { slug: 'default' } })) ??
      (await this.prisma.tenant.findFirst());
    if (!tenant) throw new Error('No tenant configured');
    return tenant.id;
  }

  private async ensureDefaultMenus(): Promise<void> {
    const tenantId = await this.resolveTenantId();

    const header = await this.prisma.navigationMenu.findFirst({ where: { tenant_id: tenantId, location: 'PRIMARY_HEADER' } });
    if (!header) {
      await this.createMenuForTenant(tenantId, {
        title: 'Primary Header Navigation',
        location: 'PRIMARY_HEADER',
        description: 'Main website top-level header navigation menu',
        items: DEFAULT_PRIMARY_HEADER_ITEMS as IMenuItem[],
      });
    }

    const footer = await this.prisma.navigationMenu.findFirst({ where: { tenant_id: tenantId, location: 'FOOTER' } });
    if (!footer) {
      await this.createMenuForTenant(tenantId, {
        title: 'Footer Quick Links Menu',
        location: 'FOOTER',
        description: 'Footer quick navigation links',
        items: DEFAULT_FOOTER_ITEMS as IMenuItem[],
      });
    }
  }

  // ----------------------------------------------------
  // DB <-> API SHAPE MAPPING
  // ----------------------------------------------------

  private rowToMenuItem(row: any): IMenuItem {
    return {
      id: row.id,
      title: row.label,
      targetType: (row.target_type as IMenuItem['targetType']) || 'internal_page',
      targetUrl: row.url,
      targetId: row.target_id || undefined,
      icon: row.icon || undefined,
      badgeText: row.badge_text || undefined,
      badgeColor: row.badge_color || undefined,
      description: row.description || undefined,
      tooltip: row.tooltip || undefined,
      cssClass: row.css_class || undefined,
      target: (row.target as IMenuItem['target']) || '_self',
      rel: row.rel || undefined,
      visibilityRules: row.visibility_rules ? this.safeJsonParse(row.visibility_rules) : undefined,
      scheduledPublishAt: row.scheduled_publish_at ? row.scheduled_publish_at.toISOString() : undefined,
      active: row.active,
      parentId: row.parent_id,
      order: row.order,
    };
  }

  private safeJsonParse(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  private buildItemTree(rows: any[]): IMenuItem[] {
    const nodes = new Map<string, IMenuItem>();
    rows.forEach((row) => nodes.set(row.id, this.rowToMenuItem(row)));

    const roots: IMenuItem[] = [];
    rows.forEach((row) => {
      const node = nodes.get(row.id)!;
      if (row.parent_id && nodes.has(row.parent_id)) {
        const parent = nodes.get(row.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortRec = (items: IMenuItem[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach((i) => i.children && sortRec(i.children));
    };
    sortRec(roots);

    return roots;
  }

  private async createItemsRecursive(menuId: string, items: IMenuItem[], parentId: string | null): Promise<void> {
    for (const item of items) {
      const created = await this.prisma.navigationMenuItem.create({
        data: {
          menu_id: menuId,
          parent_id: parentId,
          label: item.title,
          url: item.targetUrl,
          icon: item.icon,
          target: item.target || '_self',
          order: item.order,
          target_type: item.targetType,
          target_id: item.targetId,
          badge_text: item.badgeText,
          badge_color: item.badgeColor,
          description: item.description,
          tooltip: item.tooltip,
          css_class: item.cssClass,
          rel: item.rel,
          visibility_rules: item.visibilityRules ? JSON.stringify(item.visibilityRules) : undefined,
          scheduled_publish_at: item.scheduledPublishAt ? new Date(item.scheduledPublishAt) : undefined,
          active: item.active ?? true,
        },
      });
      if (item.children && item.children.length > 0) {
        await this.createItemsRecursive(menuId, item.children, created.id);
      }
    }
  }

  private async loadMenuSchema(menu: any): Promise<IMenuSchema> {
    const items = await this.prisma.navigationMenuItem.findMany({
      where: { menu_id: menu.id },
      orderBy: { order: 'asc' },
    });

    return {
      id: menu.id,
      title: menu.name,
      location: menu.location,
      description: menu.description || undefined,
      enabled: menu.enabled,
      version: menu.version,
      items: this.buildItemTree(items),
      updatedAt: menu.updated_at.toISOString(),
    };
  }

  private async createMenuForTenant(
    tenantId: string,
    data: { title: string; location: MenuLocation; description?: string; items?: IMenuItem[] },
  ): Promise<IMenuSchema> {
    const menu = await this.prisma.navigationMenu.create({
      data: {
        tenant_id: tenantId,
        location: data.location,
        name: data.title,
        description: data.description,
      },
    });

    if (data.items && data.items.length > 0) {
      await this.createItemsRecursive(menu.id, data.items, null);
    }

    return this.loadMenuSchema(menu);
  }

  // ----------------------------------------------------
  // targetId hydration (category / content title+URL lookups)
  // ----------------------------------------------------

  private async hydrateMenuItems(items: IMenuItem[]): Promise<IMenuItem[]> {
    return Promise.all(
      items.map(async (item) => {
        const hydratedItem = { ...item };

        if (item.targetId) {
          if (item.targetType === 'category') {
            try {
              const cat = await this.universalContentService.getCategoryTree();
              const flat = this.flattenCategories(cat);
              const found = flat.find((c) => c.id === item.targetId);
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
      }),
    );
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

  // ----------------------------------------------------
  // PUBLIC API — unchanged signatures, now DB-backed
  // ----------------------------------------------------

  async getMenuByLocation(location: MenuLocation): Promise<IMenuSchema | null> {
    const tenantId = await this.resolveTenantId().catch(() => null);
    if (!tenantId) return null;

    try {
      return await this.loadMenuByLocation(tenantId, location);
    } catch (err) {
      // A schema/database mismatch here (e.g. a pending migration on the
      // NavigationMenu table) must not turn a public navigation endpoint into a
      // 500 — returning null lets the caller fall back to its default menu.
      // eslint-disable-next-line no-console
      console.error(`Navigation lookup failed for location "${location}":`, (err as Error).message);
      return null;
    }
  }

  private async loadMenuByLocation(tenantId: string, location: MenuLocation): Promise<IMenuSchema | null> {
    let menu = await this.prisma.navigationMenu.findFirst({ where: { tenant_id: tenantId, location, enabled: true } });

    if (!menu && (location === 'main' || location === 'PRIMARY_HEADER')) {
      await this.ensureDefaultMenus();
      menu = await this.prisma.navigationMenu.findFirst({ where: { tenant_id: tenantId, location: 'PRIMARY_HEADER', enabled: true } });
    } else if (!menu && (location === 'footer' || location === 'FOOTER')) {
      await this.ensureDefaultMenus();
      menu = await this.prisma.navigationMenu.findFirst({ where: { tenant_id: tenantId, location: 'FOOTER', enabled: true } });
    }

    if (!menu) return null;

    const schema = await this.loadMenuSchema(menu);
    schema.items = await this.hydrateMenuItems(schema.items);
    return schema;
  }

  async getAllMenus(): Promise<IMenuSchema[]> {
    const tenantId = await this.resolveTenantId().catch(() => null);
    if (!tenantId) return [];

    const menus = await this.prisma.navigationMenu.findMany({ where: { tenant_id: tenantId }, orderBy: { created_at: 'asc' } });
    return Promise.all(
      menus.map(async (menu) => {
        const schema = await this.loadMenuSchema(menu);
        schema.items = await this.hydrateMenuItems(schema.items);
        return schema;
      }),
    );
  }

  async getMenuById(id: string): Promise<IMenuSchema> {
    const menu = await this.prisma.navigationMenu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException(`Menu with ID ${id} not found`);

    const schema = await this.loadMenuSchema(menu);
    schema.items = await this.hydrateMenuItems(schema.items);
    return schema;
  }

  async createMenu(data: { title: string; location: MenuLocation; description?: string; items?: IMenuItem[] }): Promise<IMenuSchema> {
    const tenantId = await this.resolveTenantId();
    return this.createMenuForTenant(tenantId, data);
  }

  async updateMenu(id: string, updates: Partial<IMenuSchema>): Promise<IMenuSchema> {
    const existing = await this.prisma.navigationMenu.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Menu with ID ${id} not found`);

    const menu = await this.prisma.navigationMenu.update({
      where: { id },
      data: {
        name: updates.title ?? undefined,
        location: (updates.location as string) ?? undefined,
        description: updates.description ?? undefined,
        enabled: updates.enabled ?? undefined,
        version: existing.version + 1,
      },
    });

    if (updates.items) {
      // Replace the item tree wholesale — simplest correct approach given the
      // admin UI always sends the full tree on save (matches prior in-memory behavior).
      await this.prisma.navigationMenuItem.deleteMany({ where: { menu_id: id } });
      await this.createItemsRecursive(id, updates.items, null);
    }

    return this.loadMenuSchema(menu);
  }

  async deleteMenu(id: string): Promise<{ success: boolean; deletedId: string }> {
    const existing = await this.prisma.navigationMenu.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Menu with ID ${id} not found`);
    await this.prisma.navigationMenu.delete({ where: { id } });
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
    const menu = await this.prisma.navigationMenu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException(`Menu with ID ${menuId} not found`);

    const count = await this.prisma.navigationMenuItem.count({ where: { menu_id: menuId, parent_id: null } });
    await this.createItemsRecursive(
      menuId,
      [{ ...itemData, id: '', order: itemData.order ?? count, active: itemData.active ?? true }],
      null,
    );

    return this.loadMenuSchema(menu);
  }

  async reorderMenuItems(menuId: string, orderedItemIds: string[]): Promise<IMenuSchema> {
    const menu = await this.prisma.navigationMenu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException(`Menu with ID ${menuId} not found`);

    await Promise.all(
      orderedItemIds.map((itemId, index) =>
        this.prisma.navigationMenuItem.update({ where: { id: itemId }, data: { order: index } }).catch(() => null),
      ),
    );

    return this.loadMenuSchema(menu);
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
      targetType: 'internal_page' as const,
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
    const tid = await this.resolveTenantId().catch(() => 'default-tenant-id');
    const aboutText = await this.configService.getSetting(tid, 'footer', 'aboutText');
    const copyright = await this.configService.getSetting(tid, 'footer', 'copyright');
    const orcid = await this.configService.getSetting(tid, 'profile', 'orcid');
    const scholar = await this.configService.getSetting(tid, 'profile', 'scholar');
    const linkedin = await this.configService.getSetting(tid, 'profile', 'linkedin');
    const github = await this.configService.getSetting(tid, 'profile', 'github');
    const facebook = await this.configService.getSetting(tid, 'profile', 'facebook');
    const twitter = await this.configService.getSetting(tid, 'profile', 'twitter');
    const tiktok = await this.configService.getSetting(tid, 'profile', 'tiktok');

    const socialMedia: { platform: string; url: string }[] = [];
    if (facebook) socialMedia.push({ platform: 'Facebook', url: facebook });
    if (twitter) socialMedia.push({ platform: 'Twitter', url: twitter });
    if (tiktok) socialMedia.push({ platform: 'TikTok', url: tiktok });
    if (orcid) socialMedia.push({ platform: 'ORCID', url: orcid.startsWith('http') ? orcid : `https://orcid.org/${orcid}` });
    if (scholar) socialMedia.push({ platform: 'Google Scholar', url: scholar });
    if (linkedin) socialMedia.push({ platform: 'LinkedIn', url: linkedin });
    if (github) socialMedia.push({ platform: 'GitHub', url: github });

    return {
      aboutText: aboutText || 'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal.',
      columns: [
        {
          title: 'Quick Links',
          links: footer?.items.map((i) => ({ label: i.title, url: i.targetUrl })) || [],
        },
      ],
      socialMedia,
      copyright: copyright || '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
    };
  }
}
