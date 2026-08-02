import { Injectable } from '@nestjs/common';

export interface ISchemaContext {
  title: string;
  description?: string;
  url: string;
  authorName?: string;
  authorUrl?: string;
  publishedAt?: string;
  modifiedAt?: string;
  imageUrl?: string;
  schemaType?: string;
  doi?: string;
  journal?: string;
  faqItems?: Array<{ question: string; answer: string }>;
  eventData?: { dateAd?: string; location?: string; registrationUrl?: string };
  videoData?: { videoUrl?: string; uploadDate?: string; duration?: string };
  breadcrumbItems?: Array<{ name: string; url: string }>;
}

@Injectable()
export class SchemaGeneratorService {
  private readonly DEFAULT_PERSON = {
    '@type': 'Person',
    name: 'Sandip Thapa',
    jobTitle: 'Legal Scholar & Disability Rights Researcher',
    url: 'https://thapasandip.com.np',
    sameAs: [
      'https://orcid.org/0000-0002-1234-5678',
      'https://scholar.google.com',
      'https://linkedin.com',
    ],
  };

  private readonly DEFAULT_ORGANIZATION = {
    '@type': 'Organization',
    name: 'Sandip Thapa Research Portal',
    url: 'https://thapasandip.com.np',
    logo: 'https://thapasandip.com.np/logo.png',
  };

  generateStructuredData(ctx: ISchemaContext): Record<string, any>[] {
    const schemas: Record<string, any>[] = [];
    const mainType = ctx.schemaType || 'Article';

    // 1. WebSite Base Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Sandip Thapa - Legal Research & Academic Platform',
      url: 'https://thapasandip.com.np',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://thapasandip.com.np/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    });

    // 2. Primary Content Entity Schema
    switch (mainType) {
      case 'ScholarlyArticle':
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'ScholarlyArticle',
          headline: ctx.title,
          description: ctx.description,
          url: ctx.url,
          author: this.DEFAULT_PERSON,
          publisher: this.DEFAULT_ORGANIZATION,
          datePublished: ctx.publishedAt || new Date().toISOString(),
          dateModified: ctx.modifiedAt || new Date().toISOString(),
          image: ctx.imageUrl || undefined,
          sameAs: ctx.doi ? `https://doi.org/${ctx.doi}` : undefined,
          publication: ctx.journal ? { '@type': 'PublicationEvent', name: ctx.journal } : undefined,
        });
        break;

      case 'ResearchProject':
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'ResearchProject',
          name: ctx.title,
          description: ctx.description,
          url: ctx.url,
          collector: this.DEFAULT_PERSON,
          parentOrganization: this.DEFAULT_ORGANIZATION,
        });
        break;

      case 'FAQPage':
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: (ctx.faqItems || []).map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        });
        break;

      case 'Event':
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: ctx.title,
          description: ctx.description,
          startDate: ctx.eventData?.dateAd || new Date().toISOString(),
          location: ctx.eventData?.location
            ? { '@type': 'Place', name: ctx.eventData.location }
            : { '@type': 'VirtualLocation', url: ctx.url },
          organizer: this.DEFAULT_PERSON,
        });
        break;

      case 'VideoObject':
        schemas.push({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: ctx.title,
          description: ctx.description,
          thumbnailUrl: ctx.imageUrl || 'https://thapasandip.com.np/video-thumbnail.jpg',
          uploadDate: ctx.videoData?.uploadDate || ctx.publishedAt || new Date().toISOString(),
          contentUrl: ctx.videoData?.videoUrl || ctx.url,
        });
        break;

      case 'BlogPosting':
      case 'NewsArticle':
      case 'Article':
      default:
        schemas.push({
          '@context': 'https://schema.org',
          '@type': mainType,
          headline: ctx.title,
          description: ctx.description,
          url: ctx.url,
          author: this.DEFAULT_PERSON,
          publisher: this.DEFAULT_ORGANIZATION,
          datePublished: ctx.publishedAt || new Date().toISOString(),
          dateModified: ctx.modifiedAt || new Date().toISOString(),
          image: ctx.imageUrl || undefined,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': ctx.url,
          },
        });
        break;
    }

    // 3. BreadcrumbList Schema
    if (ctx.breadcrumbItems && ctx.breadcrumbItems.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: ctx.breadcrumbItems.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.url,
        })),
      });
    }

    return schemas;
  }
}
