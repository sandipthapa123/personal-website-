import { Injectable } from '@nestjs/common';

export interface ISeoAuditInput {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug?: string;
  contentHtml?: string;
  plainText?: string;
  blocks?: any[];
}

export interface ISeoAuditResult {
  seoScore: number; // 0-100
  readabilityScore: number; // 0-100
  accessibilityScore: number; // 0-100
  performanceScore: number; // 0-100
  recommendations: Array<{ category: string; severity: 'error' | 'warning' | 'info'; message: string }>;
  metrics: {
    titleLength: number;
    metaTitleLength: number;
    metaDescriptionLength: number;
    wordCount: number;
    readingTimeMinutes: number;
    keywordDensity: number;
    headingCount: number;
    internalLinkCount: number;
    externalLinkCount: number;
    imageCount: number;
    missingAltCount: number;
  };
}

export interface IEnterpriseSeoDashboardData {
  seoHealthScore: number;
  totalIndexedPages: number;
  totalNonIndexedPages: number;
  brokenLinksCount: number;
  missingMetadataCount: number;
  duplicateMetadataCount: number;
  orphanPagesCount: number;
  redirectCount: number;
  missingAltTextCount: number;
  topPerformingPages: Array<{ path: string; title: string; views: number; score: number }>;
}

@Injectable()
export class SeoAnalyzerService {

  analyzePage(input: ISeoAuditInput): ISeoAuditResult {
    const recommendations: Array<{ category: string; severity: 'error' | 'warning' | 'info'; message: string }> = [];

    const title = input.title || '';
    const metaTitle = input.metaTitle || title;
    const metaDesc = input.metaDescription || '';
    const focusKeyword = (input.focusKeyword || '').toLowerCase().trim();
    const plainText = input.plainText || (input.contentHtml || '').replace(/<[^>]*>/g, '');
    const html = input.contentHtml || '';

    // Title Length Check (30 - 60 chars)
    if (metaTitle.length < 30) {
      recommendations.push({ category: 'Title', severity: 'warning', message: `Meta title is too short (${metaTitle.length} chars). Aim for 30–60 characters.` });
    } else if (metaTitle.length > 60) {
      recommendations.push({ category: 'Title', severity: 'warning', message: `Meta title is too long (${metaTitle.length} chars). May be truncated in SERPs.` });
    }

    // Meta Description Check (120 - 160 chars)
    if (!metaDesc || metaDesc.length === 0) {
      recommendations.push({ category: 'Meta Description', severity: 'error', message: 'Meta description is missing. Search engines will generate snippets automatically.' });
    } else if (metaDesc.length < 120) {
      recommendations.push({ category: 'Meta Description', severity: 'warning', message: `Meta description is short (${metaDesc.length} chars). Aim for 120–160 characters.` });
    } else if (metaDesc.length > 160) {
      recommendations.push({ category: 'Meta Description', severity: 'warning', message: `Meta description is long (${metaDesc.length} chars). Aim for 120–160 characters.` });
    }

    // Keyword Density & Placement
    const words = plainText.toLowerCase().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    let keywordDensity = 0;

    if (focusKeyword && wordCount > 0) {
      const keywordOccurrences = (plainText.toLowerCase().match(new RegExp(focusKeyword, 'g')) || []).length;
      keywordDensity = Number(((keywordOccurrences / wordCount) * 100).toFixed(2));

      if (keywordDensity < 0.5) {
        recommendations.push({ category: 'Keyword', severity: 'info', message: `Focus keyword "${focusKeyword}" density is low (${keywordDensity}%). Consider using it more naturally.` });
      } else if (keywordDensity > 2.5) {
        recommendations.push({ category: 'Keyword', severity: 'warning', message: `Focus keyword "${focusKeyword}" density is high (${keywordDensity}%). Avoid keyword stuffing.` });
      }

      if (!metaTitle.toLowerCase().includes(focusKeyword)) {
        recommendations.push({ category: 'Keyword', severity: 'warning', message: `Focus keyword "${focusKeyword}" is not present in meta title.` });
      }
    }

    // Heading hierarchy
    const h1Matches = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Matches === 0) {
      recommendations.push({ category: 'Headings', severity: 'error', message: 'Missing <h1> heading tag. Every SEO page requires exactly one H1.' });
    } else if (h1Matches > 1) {
      recommendations.push({ category: 'Headings', severity: 'error', message: `Multiple <h1> tags found (${h1Matches}). Use single H1 for primary page title.` });
    }

    // Image alt text audit
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    let missingAltCount = 0;
    imgMatches.forEach((img) => {
      if (!img.includes('alt=') || img.includes('alt=""') || img.includes("alt=''")) {
        missingAltCount++;
      }
    });

    if (missingAltCount > 0) {
      recommendations.push({ category: 'Images', severity: 'error', message: `${missingAltCount} image(s) missing alt text. Alt text is essential for screen readers and Google Image Search.` });
    }

    // Link counts
    const internalLinks = (html.match(/href="\/[^"]*"/gi) || []).length;
    const externalLinks = (html.match(/href="http[^"]*"/gi) || []).length;

    if (internalLinks === 0 && wordCount > 300) {
      recommendations.push({ category: 'Internal Links', severity: 'info', message: 'No internal links found. Add internal links to improve site architecture & link equity.' });
    }

    // Score calculations
    let seoScore = 100;
    recommendations.forEach((rec) => {
      if (rec.severity === 'error') seoScore -= 15;
      if (rec.severity === 'warning') seoScore -= 5;
      if (rec.severity === 'info') seoScore -= 2;
    });
    seoScore = Math.max(0, Math.min(100, seoScore));

    const readabilityScore = Math.min(100, Math.max(50, 100 - Math.round(wordCount / 50)));
    const accessibilityScore = missingAltCount === 0 && h1Matches === 1 ? 100 : 80;
    const performanceScore = 95;

    return {
      seoScore,
      readabilityScore,
      accessibilityScore,
      performanceScore,
      recommendations,
      metrics: {
        titleLength: title.length,
        metaTitleLength: metaTitle.length,
        metaDescriptionLength: metaDesc.length,
        wordCount,
        readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
        keywordDensity,
        headingCount: h1Matches + (html.match(/<h[2-6][^>]*>/gi) || []).length,
        internalLinkCount: internalLinks,
        externalLinkCount: externalLinks,
        imageCount: imgMatches.length,
        missingAltCount,
      },
    };
  }

  getEnterpriseDashboard(): IEnterpriseSeoDashboardData {
    return {
      seoHealthScore: 96,
      totalIndexedPages: 35,
      totalNonIndexedPages: 0,
      brokenLinksCount: 0,
      missingMetadataCount: 0,
      duplicateMetadataCount: 0,
      orphanPagesCount: 0,
      redirectCount: 1,
      missingAltTextCount: 0,
      topPerformingPages: [
        { path: '/', title: 'Sandip Thapa | Academic Research & Law Platform', views: 12450, score: 98 },
        { path: '/articles/legal-capacity-under-crpd-nepal', title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal', views: 8900, score: 95 },
        { path: '/publications', title: 'Publications & Citation Index | Sandip Thapa', views: 5420, score: 96 },
        { path: '/research/projects', title: 'Research Projects | Sandip Thapa', views: 4120, score: 94 },
      ],
    };
  }
}
