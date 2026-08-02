import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UniversalContentService } from '../content/universal-content.service';
import { slugify } from '@cms/utilities';

@Injectable()
export class PublicationsService {
  constructor(
    private prisma: PrismaService,
    private universalService: UniversalContentService,
  ) {}

  generateCitations(title: string, authors: string[], journal?: string, year = new Date().getFullYear()) {
    const authorStr = Array.isArray(authors) ? authors.join(', ') : 'Sandip Thapa';
    const apa = `${authorStr} (${year}). ${title}. ${journal || 'Academic Repository'}.`;
    const mla = `${authorStr}. "${title}." ${journal || 'Academic Repository'}, ${year}.`;
    const chicago = `${authorStr}. "${title}." ${journal || 'Academic Repository'} (${year}).`;
    const oscola = `${authorStr}, '${title}' (${year}) ${journal || 'Acad Rep'}.`;
    const bibtex = `@article{thapa${year},\n  author = {${authorStr}},\n  title = {${title}},\n  journal = {${journal || 'Academic Repository'}},\n  year = {${year}}\n}`;

    return { apa, mla, chicago, oscola, bibtex };
  }

  async createPublication(tenantId: string, data: any) {
    const citations = this.generateCitations(data.title, data.authors || ['Sandip Thapa'], data.journal);

    return this.universalService.createContent({
      tenantId,
      title: data.title,
      slug: data.slug || slugify(data.title || 'untitled-publication'),
      summary: data.abstract || '',
      content: data.abstract || '',
      contentTypes: ['Publication'],
      authors: data.authors || ['Sandip Thapa'],
      status: 'PUBLISHED',
      customFields: {
        type: data.type || 'journal',
        journal: data.journal,
        publisher: data.publisher,
        doi: data.doi,
        pdfUrl: data.pdfUrl,
        citations,
      },
    });
  }

  async getPublications(tenantId: string) {
    const res = this.universalService.getAllContent({
      contentType: 'Publication',
      limit: 100,
    });
    return res.items;
  }

  async updatePublication(tenantId: string, id: string, data: any) {
    return this.universalService.updateContent(id, data);
  }

  async deletePublication(tenantId: string, id: string) {
    this.universalService.softDeleteContent(id);
    return { success: true, message: `Publication ${id} deleted` };
  }

  // Research Projects
  async getResearchProjects(tenantId: string) {
    const res = this.universalService.getAllContent({
      contentType: 'Research',
      limit: 100,
    });
    return res.items;
  }

  async createResearchProject(tenantId: string, data: any) {
    return this.universalService.createContent({
      tenantId,
      title: data.title,
      slug: data.slug || slugify(data.title || 'untitled-research'),
      summary: data.description || '',
      content: data.description || '',
      contentTypes: ['Research'],
      authors: ['Sandip Thapa'],
      status: 'PUBLISHED',
      customFields: {
        type: data.type || 'project',
        timeline: data.timeline || '2025 - 2026',
      },
    });
  }
}
