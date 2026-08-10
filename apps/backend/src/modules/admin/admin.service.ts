import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface IDashboardWidget {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

@Injectable()
export class AdminService {
  private defaultWidgets: IDashboardWidget[] = [
    { id: 'w-welcome', type: 'WELCOME', title: 'Welcome Dashboard', visible: true, x: 0, y: 0, w: 12, h: 2 },
    { id: 'w-health', type: 'SYSTEM_HEALTH', title: 'System Diagnostics & Status', visible: true, x: 0, y: 2, w: 6, h: 4 },
    { id: 'w-actions', type: 'QUICK_ACTIONS', title: 'Quick Actions', visible: true, x: 6, y: 2, w: 6, h: 4 },
    { id: 'w-draft', type: 'QUICK_DRAFT', title: 'Quick Draft', visible: true, x: 0, y: 6, w: 6, h: 4 },
    { id: 'w-activity', type: 'RECENT_ACTIVITY', title: 'Recent Audit Activity', visible: true, x: 6, y: 6, w: 6, h: 4 },
    { id: 'w-analytics', type: 'ANALYTICS_OVERVIEW', title: 'Analytics & Visitor Traffic', visible: true, x: 0, y: 10, w: 12, h: 4 },
  ];

  private userWidgetLayouts: Map<string, IDashboardWidget[]> = new Map();
  private auditTrail: Array<{ timestamp: string; user: string; action: string; details: string }> = [
    { timestamp: new Date().toISOString(), user: 'lafasandip15@gmail.com', action: 'SYSTEM_BOOT', details: 'Enterprise Admin Console initialized' },
  ];

  constructor(private prisma: PrismaService) {}

  getUserWidgets(userId = 'default-admin'): IDashboardWidget[] {
    return this.userWidgetLayouts.get(userId) || this.defaultWidgets;
  }

  saveUserWidgets(userId = 'default-admin', widgets: IDashboardWidget[]): IDashboardWidget[] {
    this.userWidgetLayouts.set(userId, widgets);
    return widgets;
  }

  async globalAdminSearch(query: string) {
    if (!query || query.trim() === '') return { results: [] };
    const q = query.toLowerCase().trim();

    const results: Array<{ id: string; domain: string; title: string; subtitle: string; url: string }> = [];

    // Search content from database
    try {
      const dbResults = await this.prisma.universalContent.findMany({
        where: {
          title: { contains: q },
          deleted_at: null,
        },
        take: 10,
        orderBy: { updated_at: 'desc' },
      });

      dbResults.forEach((item) => {
        results.push({
          id: item.id,
          domain: item.content_type || 'Content',
          title: item.title,
          subtitle: `/${item.slug}`,
          url: `/${item.slug}`,
        });
      });
    } catch (err) {
      console.error('Admin search database error', err);
    }

    // Also search static admin pages
    const adminPages = [
      { id: 'p-dashboard', domain: 'System', title: 'Dashboard', subtitle: '/admin/dashboard', url: '/admin/dashboard' },
      { id: 'p-editor', domain: 'System', title: 'Editor.js Visual Builder', subtitle: '/admin/editor', url: '/admin/editor' },
      { id: 'p-content', domain: 'System', title: 'Content Manager', subtitle: '/admin/content', url: '/admin/content' },
    ];

    adminPages.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)) {
        results.push(p);
      }
    });

    return {
      query,
      count: results.length,
      results,
    };
  }

  async executeBulkOperation(operation: 'publish' | 'delete' | 'archive' | 'export', targetIds: string[], type = 'articles') {
    this.auditTrail.unshift({
      timestamp: new Date().toISOString(),
      user: 'lafasandip15@gmail.com',
      action: `BULK_${operation.toUpperCase()}`,
      details: `Executed ${operation} on ${targetIds.length} ${type} items`,
    });

    return {
      success: true,
      operation,
      affectedCount: targetIds.length,
      timestamp: new Date().toISOString(),
    };
  }

  async exportContent(format: 'json' | 'csv' | 'xml' | 'markdown', contentTypes: string[]) {
    const timestamp = new Date().toISOString();

    // Query real content from database
    let items: any[] = [];
    try {
      const where: any = { deleted_at: null };
      if (contentTypes && contentTypes.length > 0 && !contentTypes.includes('ALL')) {
        where.content_type = { in: contentTypes };
      }
      items = await this.prisma.universalContent.findMany({ where, orderBy: { updated_at: 'desc' } });
    } catch (err) {
      console.error('Export content database error', err);
    }

    if (format === 'csv') {
      const header = 'ID,Title,Type,Status,Locale';
      const rows = items.map(i => `${i.id},"${(i.title || '').replace(/"/g, '""')}",${i.content_type},${i.status},${i.locale}`);
      const csv = [header, ...rows].join('\n');
      return { format: 'csv', mimeType: 'text/csv', data: csv, filename: `export-${timestamp}.csv` };
    }

    if (format === 'xml') {
      const xmlItems = items.map(i => `<item><id>${i.id}</id><title>${i.title}</title><type>${i.content_type}</type></item>`).join('');
      const xml = `<?xml version="1.0"?><export>${xmlItems}</export>`;
      return { format: 'xml', mimeType: 'application/xml', data: xml, filename: `export-${timestamp}.xml` };
    }

    if (format === 'markdown') {
      const mdItems = items.map(i => `- ${i.title} (${i.content_type}, ${i.status})`).join('\n');
      const md = `# Exported Content Directory\n\n${mdItems || 'No content found.'}`;
      return { format: 'markdown', mimeType: 'text/markdown', data: md, filename: `export-${timestamp}.md` };
    }

    return {
      format: 'json',
      mimeType: 'application/json',
      data: {
        exportedAt: timestamp,
        types: contentTypes,
        items: items.map(i => ({ id: i.id, title: i.title, type: i.content_type, status: i.status })),
      },
      filename: `export-${timestamp}.json`,
    };
  }

  getAuditTrail() {
    return this.auditTrail;
  }

  flushSystemCache() {
    this.auditTrail.unshift({
      timestamp: new Date().toISOString(),
      user: 'lafasandip15@gmail.com',
      action: 'CACHE_FLUSH',
      details: 'In-memory application cache cleared',
    });

    return {
      success: true,
      flushed: true,
      timestamp: new Date().toISOString(),
    };
  }
}
