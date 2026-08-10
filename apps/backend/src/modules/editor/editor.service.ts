import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EditorValidationService, IWcagValidationResult } from './editor-validation.service';
import { EditorExporterService, IExportResult } from './editor-exporter.service';
import { getAllBlockTypes, getBlockDefinition } from './block-schema.registry';

export interface IPageEditorData {
  id: string;
  slug: string;
  title: string;
  locale: string;
  status: string;
  version: number;
  blocks: any[];
  seoMetadata?: Record<string, any>;
  wcagValidation?: IWcagValidationResult;
  exports?: IExportResult;
}

@Injectable()
export class EditorService {
  private reusableBlocks: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private validator: EditorValidationService,
    private exporter: EditorExporterService,
  ) {
    this.seedDefaultEditorPages();
  }

  private seedDefaultEditorPages() {
    // No-op: all page data is sourced from the database
  }

  async getPageForEditor(idOrSlug: string): Promise<IPageEditorData> {
    try {
      const dbPage = await this.prisma.page.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
        include: {
          region_blocks: {
            include: { block: true },
            orderBy: { order: 'asc' },
          },
        },
      });

      if (dbPage) {
        const blocks = dbPage.region_blocks.map((rb) => ({
          id: rb.block.id,
          type: rb.block.name,
          props: (typeof rb.block.json_config === 'string' ? JSON.parse(rb.block.json_config) : rb.block.json_config) || {},
        }));
        const wcag = this.validator.validateBlockArray(blocks);
        const exports = this.exporter.exportBlocks(blocks, dbPage.title);

        return {
          id: dbPage.id,
          slug: dbPage.slug,
          title: dbPage.title,
          locale: dbPage.locale,
          status: dbPage.status,
          version: dbPage.version,
          blocks,
          seoMetadata: (typeof dbPage.seo_metadata === 'string' ? JSON.parse(dbPage.seo_metadata) : dbPage.seo_metadata) || {},
          wcagValidation: wcag,
          exports,
        };
      }
    } catch (err) {
      console.error('Failed to get page from database', err);
      throw err;
    }

    throw new NotFoundException(`Page '${idOrSlug}' not found`);
  }

  async savePageBlocks(id: string, blocks: any[], title?: string, locale = 'en'): Promise<IPageEditorData> {
    // Validate schema
    const wcag = this.validator.validateBlockArray(blocks);
    const exports = this.exporter.exportBlocks(blocks, title || 'Saved Page');

    try {
      const existing = await this.prisma.page.findUnique({ where: { id } });
      if (existing) {
        const newVersion = existing.version + 1;
        const updated = await this.prisma.page.update({
          where: { id },
          data: {
            title: title || existing.title,
            locale: locale || existing.locale,
            version: newVersion,
            updated_at: new Date(),
          },
        });

        // Store version snapshot
        await this.prisma.pageVersion.create({
          data: {
            page_id: id,
            version: newVersion,
            layout_json: { blocks, wcag, exports } as any,
          },
        });

        return {
          id: updated.id,
          slug: updated.slug,
          title: updated.title,
          locale: updated.locale,
          status: updated.status,
          version: updated.version,
          blocks,
          wcagValidation: wcag,
          exports,
        };
      } else {
        // Create new page if not exists
        const newPage = await this.prisma.page.create({
          data: {
            id,
            tenant_id: 'default-tenant',
            layout_id: 'default-layout',
            slug: id.replace('page-', ''),
            title: title || 'New Page',
            locale: locale,
            status: 'DRAFT',
            version: 1,
            seo_metadata: JSON.stringify({}),
          }
        });
        
        await this.prisma.pageVersion.create({
          data: {
            page_id: id,
            version: 1,
            layout_json: { blocks, wcag, exports } as any,
          },
        });

        return {
          id: newPage.id,
          slug: newPage.slug,
          title: newPage.title,
          locale: newPage.locale,
          status: newPage.status,
          version: newPage.version,
          blocks,
          wcagValidation: wcag,
          exports,
        };
      }
    } catch (err) {
      console.error('Failed to save page to database', err);
      throw err;
    }
  }

  async autoSaveDraft(id: string, blocks: any[]): Promise<{ saved: boolean; timestamp: string; wcag: IWcagValidationResult }> {
    const wcag = this.validator.validateBlockArray(blocks);
    
    // Perform light save without bumping major version
    await this.savePageBlocks(id, blocks);

    return {
      saved: true,
      timestamp: new Date().toISOString(),
      wcag,
    };
  }

  async exportPage(id: string, format: 'html' | 'markdown' | 'text' | 'rss' | 'epub') {
    const page = await this.getPageForEditor(id);
    const exp = this.exporter.exportBlocks(page.blocks, page.title);

    switch (format) {
      case 'html': return { format: 'html', content: exp.html };
      case 'markdown': return { format: 'markdown', content: exp.markdown };
      case 'text': return { format: 'text', content: exp.plainText };
      case 'rss': return { format: 'rss', content: exp.rssXml };
      case 'epub': return { format: 'epub', content: exp.epubStructure };
      default: return exp;
    }
  }

  getAllBlockDefinitions() {
    return getAllBlockTypes();
  }

  async saveReusableBlock(name: string, blockData: any) {
    const id = `reusable-${Date.now()}`;
    const reusable = { id, name, blockData, createdAt: new Date().toISOString() };
    this.reusableBlocks.set(id, reusable);
    return reusable;
  }

  getReusableBlocks() {
    return Array.from(this.reusableBlocks.values());
  }

  async listAllEditorPages() {
    const pages = await this.prisma.page.findMany();
    return pages.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      locale: p.locale,
      status: p.status,
      version: p.version,
      blockCount: 0,
    }));
  }
}
