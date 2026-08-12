import { Controller, Get, Post, Body, Query, Res, HttpStatus, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { SlugGeneratorService } from './slug-generator.service';
import { RedirectManagerService } from './redirect-manager.service';
import { SchemaGeneratorService } from './schema-generator.service';
import { SitemapGeneratorService } from './sitemap-generator.service';
import { RssFeedService } from './rss-feed.service';
import { SeoAnalyzerService } from './seo-analyzer.service';

@ApiTags('Enterprise SEO & Intelligent Slug Engine')
@Controller()
export class SeoController {
  constructor(
    private slugGenerator: SlugGeneratorService,
    private redirectManager: RedirectManagerService,
    private schemaGenerator: SchemaGeneratorService,
    private sitemapGenerator: SitemapGeneratorService,
    private rssFeed: RssFeedService,
    private seoAnalyzer: SeoAnalyzerService,
  ) {}

  // ─── 1. INTELLIGENT SLUG GENERATOR ────────────────────────────────────────

  @Post('seo/generate-slug')
  @ApiOperation({ summary: 'Generate clean, SEO-friendly English slug from title (supports Nepali translation)' })
  async generateSlug(@Body() body: { title: string; maxWords?: number; excludeId?: string }) {
    const rawSlug = await this.slugGenerator.generateSlug(body.title, { maxWords: body.maxWords });
    const uniqueSlug = await this.slugGenerator.ensureUniqueSlug(rawSlug, 'default-tenant-id', body.excludeId);
    return {
      success: true,
      data: {
        title: body.title,
        generatedSlug: uniqueSlug,
        rawSlug,
      },
    };
  }

  @Post('seo/compute-slug-state')
  @ApiOperation({ summary: 'Compute intelligent slug state, mode (AUTO/MANUAL), 301 redirects, and published protection' })
  async computeSlugState(@Body() body: {
    title: string;
    currentSlug?: string;
    slugMode?: 'AUTO' | 'MANUAL';
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    action?: 'TITLE_CHANGE' | 'MANUAL_EDIT' | 'GENERATE_BUTTON' | 'RESET_TO_AUTO';
    contentId?: string;
  }) {
    const state = await this.slugGenerator.computeSlugState(body);
    return {
      success: true,
      data: state,
    };
  }

  // ─── 2. LIVE SEO ANALYSIS PANEL ──────────────────────────────────────────

  @Post('seo/analyze')
  @ApiOperation({ summary: 'Evaluate live SEO score, readability, accessibility, and performance recommendations' })
  async analyzeSeo(@Body() body: any) {
    const audit = this.seoAnalyzer.analyzePage({
      title: body.title,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      focusKeyword: body.focusKeyword,
      contentHtml: body.contentHtml,
      plainText: body.plainText,
    });
    return {
      success: true,
      data: audit,
    };
  }

  // ─── 3. ENTERPRISE SEO DASHBOARD ──────────────────────────────────────────

  @Get('seo/dashboard')
  @ApiOperation({ summary: 'Get Enterprise SEO Health Dashboard metrics' })
  async getDashboard() {
    const data = await this.seoAnalyzer.getEnterpriseDashboard();
    return {
      success: true,
      data,
    };
  }

  // ─── 4. XML SITEMAPS ──────────────────────────────────────────────────────

  @Get('sitemap.xml')
  @ApiOperation({ summary: 'Generate primary XML sitemap' })
  async getSitemapXml(@Res() res: Response) {
    const xml = this.sitemapGenerator.generateMainSitemap();
    res.setHeader('Content-Type', 'application/xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  @Get('news-sitemap.xml')
  @ApiOperation({ summary: 'Generate Google News XML sitemap' })
  async getNewsSitemapXml(@Res() res: Response) {
    const xml = this.sitemapGenerator.generateNewsSitemap();
    res.setHeader('Content-Type', 'application/xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  @Get('image-sitemap.xml')
  @ApiOperation({ summary: 'Generate Google Image XML sitemap' })
  async getImageSitemapXml(@Res() res: Response) {
    const xml = this.sitemapGenerator.generateImageSitemap();
    res.setHeader('Content-Type', 'application/xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  @Get('video-sitemap.xml')
  @ApiOperation({ summary: 'Generate Google Video XML sitemap' })
  async getVideoSitemapXml(@Res() res: Response) {
    const xml = this.sitemapGenerator.generateVideoSitemap();
    res.setHeader('Content-Type', 'application/xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  // ─── 5. ROBOTS.TXT ───────────────────────────────────────────────────────

  @Get('robots.txt')
  @ApiOperation({ summary: 'Generate dynamic robots.txt' })
  async getRobotsTxt(@Res() res: Response) {
    const txt = `# Dynamic Enterprise robots.txt — Sandip Thapa Platform
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://thapasandip.com.np/sitemap.xml
Sitemap: https://thapasandip.com.np/news-sitemap.xml
Sitemap: https://thapasandip.com.np/image-sitemap.xml
Sitemap: https://thapasandip.com.np/video-sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain');
    return res.status(HttpStatus.OK).send(txt);
  }

  // ─── 6. RSS, ATOM & JSON FEEDS ───────────────────────────────────────────

  @Get('rss.xml')
  @ApiOperation({ summary: 'Generate RSS 2.0 XML feed' })
  async getRssXml(@Res() res: Response) {
    const items = [
      {
        id: '1',
        title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal',
        url: '/articles/legal-capacity-under-crpd-nepal',
        summary: 'Comprehensive legal critique on guardianship statutes and Article 12 CRPD implementation.',
        datePublished: new Date().toISOString(),
        authorName: 'Sandip Thapa',
        category: 'Legal Research',
      },
    ];
    const xml = this.rssFeed.generateRssXml(items);
    res.setHeader('Content-Type', 'application/xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  @Get('atom.xml')
  @ApiOperation({ summary: 'Generate Atom 1.0 XML feed' })
  async getAtomXml(@Res() res: Response) {
    const items = [
      {
        id: '1',
        title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal',
        url: '/articles/legal-capacity-under-crpd-nepal',
        summary: 'Comprehensive legal critique on guardianship statutes and Article 12 CRPD implementation.',
        datePublished: new Date().toISOString(),
        authorName: 'Sandip Thapa',
      },
    ];
    const xml = this.rssFeed.generateAtomXml(items);
    res.setHeader('Content-Type', 'application/atom+xml');
    return res.status(HttpStatus.OK).send(xml);
  }

  @Get('feed.json')
  @ApiOperation({ summary: 'Generate JSON Feed 1.1' })
  async getJsonFeed(@Res() res: Response) {
    const items = [
      {
        id: '1',
        title: 'Legal Capacity & Supported Decision-Making under UN CRPD in Nepal',
        url: '/articles/legal-capacity-under-crpd-nepal',
        summary: 'Comprehensive legal critique on guardianship statutes and Article 12 CRPD implementation.',
        datePublished: new Date().toISOString(),
        authorName: 'Sandip Thapa',
      },
    ];
    const json = this.rssFeed.generateJsonFeed(items);
    res.setHeader('Content-Type', 'application/json');
    return res.status(HttpStatus.OK).send(json);
  }

  // ─── 7. REDIRECT MANAGER API ─────────────────────────────────────────────

  @Get('seo/redirects')
  @ApiOperation({ summary: 'List all active HTTP redirect rules (301, 302, 307, 410)' })
  async getRedirects() {
    return {
      success: true,
      data: this.redirectManager.getAllRedirects(),
    };
  }

  @Post('seo/redirects')
  @ApiOperation({ summary: 'Add a new manual or automatic HTTP redirect rule' })
  async addRedirect(@Body() body: { sourceUrl: string; targetUrl: string; statusCode?: 301 | 302 | 307 | 410 }) {
    const rule = this.redirectManager.addRedirect(body.sourceUrl, body.targetUrl, body.statusCode || 301);
    return {
      success: true,
      data: rule,
    };
  }

  @Delete('seo/redirects/:id')
  @ApiOperation({ summary: 'Delete a redirect rule' })
  async deleteRedirect(@Param('id') id: string) {
    const ok = this.redirectManager.deleteRedirect(id);
    return {
      success: ok,
    };
  }

  // ─── 8. SEARCH ENGINE VERIFICATION & ANALYTICS SETTINGS ─────────────────

  @Get('seo/settings')
  @ApiOperation({ summary: 'Get Search Engine Verification & Analytics Config' })
  async getSeoSettings() {
    return {
      verification: {
        googleSearchConsole: 'google-site-verification-token-example',
        bingWebmaster: 'bing-verification-token-example',
        yandexWebmaster: 'yandex-verification-token-example',
        baiduWebmaster: 'baidu-verification-token-example',
      },
      analytics: {
        googleAnalytics4: 'G-XXXXXXXXXX',
        googleTagManager: 'GTM-XXXXXX',
        microsoftClarity: 'clarity-id',
        plausibleDomain: 'thapasandip.com.np',
        matomoUrl: 'https://analytics.thapasandip.com.np',
      },
    };
  }
}
