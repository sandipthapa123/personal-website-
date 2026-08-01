import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PublicationsService {
  constructor(private prisma: PrismaService) {}

  generateCitations(title: string, authors: string[], journal?: string, year = new Date().getFullYear()) {
    const authorStr = authors.join(', ');
    const apa = `${authorStr} (${year}). ${title}. ${journal || 'Academic Repository'}.`;
    const mla = `${authorStr}. "${title}." ${journal || 'Academic Repository'}, ${year}.`;
    const chicago = `${authorStr}. "${title}." ${journal || 'Academic Repository'} (${year}).`;
    return { apa, mla, chicago };
  }

  async createPublication(
    tenantId: string,
    data: {
      title: string;
      authors: string[];
      abstract: string;
      journal?: string;
      publisher?: string;
      doi?: string;
      pdfUrl?: string;
    },
  ) {
    const citations = this.generateCitations(data.title, data.authors, data.journal);

    return this.prisma.publication.create({
      data: {
        tenant_id: tenantId,
        title: data.title,
        authors: data.authors,
        abstract: data.abstract,
        journal: data.journal,
        publisher: data.publisher,
        doi: data.doi,
        pdf_url: data.pdfUrl,
        citation_apa: citations.apa,
        citation_mla: citations.mla,
        citation_chi: citations.chicago,
        published_date: new Date(),
      },
    });
  }

  async getPublications(tenantId: string) {
    return this.prisma.publication.findMany({
      where: { tenant_id: tenantId },
      orderBy: { published_date: 'desc' },
    });
  }
}
