import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PublicationsService {
  private inMemoryPublications: any[] = [
    {
      id: 'pub-1',
      tenant_id: 'default-tenant-id',
      title: 'A Critical Examination of Inclusive Education Policies for Persons with Disabilities in Nepal',
      authors: ['Sandip Thapa'],
      abstract: 'Analyzing policy implementation gaps in inclusive education mandates across Nepal.',
      type: 'journal',
      journal: 'Kathmandu Law Review',
      citation_apa: 'Thapa, S. (2026). A Critical Examination of Inclusive Education Policies in Nepal. Kathmandu Law Review, 14(2), 45-68.',
      citation_mla: 'Thapa, Sandip. "A Critical Examination of Inclusive Education Policies in Nepal." Kathmandu Law Review, vol. 14, no. 2, 2026, pp. 45-68.',
      published_date: new Date('2026-06-15T00:00:00Z'),
    },
  ];

  private inMemoryResearch: any[] = [
    {
      id: 'res-1',
      tenant_id: 'default-tenant-id',
      title: 'Disability Rights & Legal Capacity under UN CRPD in Nepal',
      slug: 'disability-rights-legal-capacity',
      type: 'project',
      status: 'Ongoing Project',
      description: 'Comprehensive analysis of legal capacity frameworks and supported decision-making models in Nepalese jurisprudence.',
      timeline: '2025 - 2026',
    },
  ];

  constructor(private prisma: PrismaService) {}

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

    try {
      return await this.prisma.publication.create({
        data: {
          tenant_id: tenantId,
          title: data.title,
          subtitle: data.subtitle,
          authors: data.authors || ['Sandip Thapa'],
          abstract: data.abstract || '',
          type: data.type || 'journal',
          journal: data.journal,
          publisher: data.publisher,
          doi: data.doi,
          pdf_url: data.pdfUrl,
          citation_apa: citations.apa,
          citation_mla: citations.mla,
          citation_chi: citations.chicago,
          citation_oscola: citations.oscola,
          citation_bibtex: citations.bibtex,
          published_date: data.publishedDate ? new Date(data.publishedDate) : new Date(),
        },
      });
    } catch (err) {
      const pub = {
        id: `pub-${Date.now()}`,
        tenant_id: tenantId,
        title: data.title,
        authors: data.authors || ['Sandip Thapa'],
        abstract: data.abstract || '',
        type: data.type || 'journal',
        journal: data.journal,
        citation_apa: citations.apa,
        citation_mla: citations.mla,
        citation_chi: citations.chicago,
        published_date: new Date(),
      };
      this.inMemoryPublications.unshift(pub);
      return pub;
    }
  }

  async getPublications(tenantId: string) {
    try {
      return await this.prisma.publication.findMany({
        where: { tenant_id: tenantId },
        orderBy: { published_date: 'desc' },
      });
    } catch (err) {
      return this.inMemoryPublications;
    }
  }

  async updatePublication(tenantId: string, id: string, data: any) {
    try {
      return await this.prisma.publication.update({
        where: { id },
        data: {
          title: data.title,
          abstract: data.abstract,
          journal: data.journal,
          publisher: data.publisher,
          doi: data.doi,
          pdf_url: data.pdfUrl,
        },
      });
    } catch (err) {
      const idx = this.inMemoryPublications.findIndex((p) => p.id === id);
      if (idx !== -1) {
        this.inMemoryPublications[idx] = { ...this.inMemoryPublications[idx], ...data };
        return this.inMemoryPublications[idx];
      }
      throw new NotFoundException(`Publication ${id} not found`);
    }
  }

  async deletePublication(tenantId: string, id: string) {
    try {
      await this.prisma.publication.delete({ where: { id } });
    } catch (err) {
      this.inMemoryPublications = this.inMemoryPublications.filter((p) => p.id !== id);
    }
    return { success: true, message: `Publication ${id} deleted` };
  }

  // Research Projects
  async getResearchProjects(tenantId: string) {
    try {
      return await this.prisma.researchProject.findMany({ where: { tenant_id: tenantId } });
    } catch (err) {
      return this.inMemoryResearch;
    }
  }

  async createResearchProject(tenantId: string, data: any) {
    try {
      return await this.prisma.researchProject.create({
        data: {
          tenant_id: tenantId,
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
          type: data.type || 'project',
          status: data.status || 'active',
          description: data.description || '',
          timeline: data.timeline || '2025 - 2026',
        },
      });
    } catch (err) {
      const res = {
        id: `res-${Date.now()}`,
        tenant_id: tenantId,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        type: data.type || 'project',
        status: data.status || 'active',
        description: data.description || '',
        timeline: data.timeline || '2025 - 2026',
      };
      this.inMemoryResearch.unshift(res);
      return res;
    }
  }
}
