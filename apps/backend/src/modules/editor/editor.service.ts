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
  private inMemoryPages: Map<string, IPageEditorData> = new Map();
  private reusableBlocks: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private validator: EditorValidationService,
    private exporter: EditorExporterService,
  ) {
    this.seedDefaultEditorPages();
  }

  private seedDefaultEditorPages() {
    const defaultHomepageBlocks = [
      {
        id: 'block-hero-1',
        type: 'HERO',
        props: {
          tagline: 'LEGAL RESEARCH, HUMAN RIGHTS & ACCESSIBILITY',
          title: 'Advancing Disability Rights & Legal Capacity in Nepal',
          subtitle: 'Official academic research portal, publications directory, literary archive, and policy consulting platform of Sandip Thapa.',
          primaryCta: { label: 'Explore Publications', url: '/publications' },
          secondaryCta: { label: 'Read Research Papers', url: '/research' },
        },
      },
      {
        id: 'block-intro-2',
        type: 'TEXT_BLOCK',
        props: {
          heading: 'Short Introduction',
          content: 'Sandip Thapa is a dedicated legal scholar, researcher, and human rights advocate based in Nepal. His work focuses on legal capacity, supported decision-making under the UN CRPD, inclusive policy formulation, and digital accessibility compliance.',
        },
      },
      {
        id: 'block-featured-3',
        type: 'CARD_GRID',
        props: {
          heading: 'Featured Article',
          items: [
            {
              title: 'Legal Capacity & Supported Decision-Making in Nepalese Jurisprudence',
              summary: 'An analysis of Article 12 of the UN CRPD and its implementation in Nepalese courts.',
              publishedBs: '2083 Shrawan 15',
              publishedAd: '30 July 2026',
              readingTime: 9,
              wordCount: 2150,
            },
          ],
        },
      },
    ];

    this.inMemoryPages.set('page-home', {
      id: 'page-home',
      slug: 'home',
      title: 'Home Page',
      locale: 'en',
      status: 'PUBLISHED',
      version: 1,
      blocks: defaultHomepageBlocks,
    });
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
          props: (rb.block.json_config as Record<string, any>) || {},
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
          seoMetadata: (dbPage.seo_metadata as Record<string, any>) || {},
          wcagValidation: wcag,
          exports,
        };
      }
    } catch (err) {
      // DB offline — fallback
    }

    const memPage = this.inMemoryPages.get(idOrSlug) || this.inMemoryPages.get(`page-${idOrSlug}`);
    if (memPage) {
      memPage.wcagValidation = this.validator.validateBlockArray(memPage.blocks);
      memPage.exports = this.exporter.exportBlocks(memPage.blocks, memPage.title);
      return memPage;
    }

    throw new NotFoundException(`Page '${idOrSlug}' not found in editor registry`);
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
      }
    } catch (err) {
      // DB offline — update in memory
    }

    let page = this.inMemoryPages.get(id);
    if (!page) {
      page = {
        id,
        slug: id.replace('page-', ''),
        title: title || 'New Page',
        locale,
        status: 'DRAFT',
        version: 1,
        blocks: [],
      };
    }

    page.blocks = blocks;
    if (title) page.title = title;
    page.locale = locale;
    page.version += 1;
    page.wcagValidation = wcag;
    page.exports = exports;

    this.inMemoryPages.set(id, page);
    return page;
  }

  async autoSaveDraft(id: string, blocks: any[]): Promise<{ saved: boolean; timestamp: string; wcag: IWcagValidationResult }> {
    const page = this.inMemoryPages.get(id) || {
      id,
      slug: id,
      title: 'Draft',
      locale: 'en',
      status: 'DRAFT',
      version: 1,
      blocks: [],
    };

    page.blocks = blocks;
    const wcag = this.validator.validateBlockArray(blocks);
    page.wcagValidation = wcag;
    this.inMemoryPages.set(id, page);

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

  listAllEditorPages() {
    return Array.from(this.inMemoryPages.values()).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      locale: p.locale,
      status: p.status,
      version: p.version,
      blockCount: p.blocks.length,
    }));
  }
}
