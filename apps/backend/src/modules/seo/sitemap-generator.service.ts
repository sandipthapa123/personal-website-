import { Injectable } from '@nestjs/common';

export interface ISitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  title?: string;
  publicationDate?: string;
  images?: Array<{ url: string; title?: string; caption?: string }>;
  videos?: Array<{ url: string; title: string; description: string; thumbnailUrl: string }>;
}

@Injectable()
export class SitemapGeneratorService {
  private readonly BASE_URL = 'https://thapasandip.com.np';

  private readonly CORE_PAGES: ISitemapEntry[] = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/about', priority: 0.8, changefreq: 'monthly' },
    { url: '/about/biography', priority: 0.7, changefreq: 'monthly' },
    { url: '/about/education', priority: 0.7, changefreq: 'monthly' },
    { url: '/about/experience', priority: 0.7, changefreq: 'monthly' },
    { url: '/about/skills', priority: 0.6, changefreq: 'monthly' },
    { url: '/about/resume', priority: 0.8, changefreq: 'monthly' },
    { url: '/articles', priority: 0.9, changefreq: 'daily' },
    { url: '/articles/categories', priority: 0.6, changefreq: 'weekly' },
    { url: '/articles/tags', priority: 0.6, changefreq: 'weekly' },
    { url: '/articles/series', priority: 0.6, changefreq: 'weekly' },
    { url: '/research', priority: 0.9, changefreq: 'weekly' },
    { url: '/research/projects', priority: 0.8, changefreq: 'weekly' },
    { url: '/research/working-papers', priority: 0.8, changefreq: 'weekly' },
    { url: '/research/policy-briefs', priority: 0.8, changefreq: 'weekly' },
    { url: '/research/reports', priority: 0.7, changefreq: 'weekly' },
    { url: '/publications', priority: 0.9, changefreq: 'weekly' },
    { url: '/publications/journal-articles', priority: 0.8, changefreq: 'monthly' },
    { url: '/publications/book-chapters', priority: 0.7, changefreq: 'monthly' },
    { url: '/publications/conference-papers', priority: 0.7, changefreq: 'monthly' },
    { url: '/publications/books', priority: 0.8, changefreq: 'monthly' },
    { url: '/poems', priority: 0.7, changefreq: 'weekly' },
    { url: '/poems/collections', priority: 0.6, changefreq: 'monthly' },
    { url: '/translations', priority: 0.7, changefreq: 'monthly' },
    { url: '/projects', priority: 0.8, changefreq: 'monthly' },
    { url: '/media', priority: 0.7, changefreq: 'weekly' },
    { url: '/services', priority: 0.8, changefreq: 'monthly' },
    { url: '/testimonials', priority: 0.6, changefreq: 'monthly' },
    { url: '/faq', priority: 0.6, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'yearly' },
  ];

  generateMainSitemap(dynamicEntries: ISitemapEntry[] = []): string {
    const allEntries = [...this.CORE_PAGES, ...dynamicEntries];
    const now = new Date().toISOString().split('T')[0];

    const urlsXml = allEntries
      .map((entry) => {
        const loc = entry.url.startsWith('http') ? entry.url : `${this.BASE_URL}${entry.url}`;
        const lastmod = entry.lastmod || now;
        const changefreq = entry.changefreq || 'weekly';
        const priority = entry.priority !== undefined ? entry.priority : 0.7;

        return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
  }

  generateNewsSitemap(newsEntries: ISitemapEntry[] = []): string {
    const entries = newsEntries.length > 0 ? newsEntries : [
      {
        url: '/articles/legal-capacity-under-crpd-nepal',
        title: 'Legal Capacity & Supported Decision-Making in Nepalese Jurisprudence',
        publicationDate: new Date().toISOString(),
      },
    ];

    const xmlItems = entries
      .map((e) => {
        const loc = e.url.startsWith('http') ? e.url : `${this.BASE_URL}${e.url}`;
        const pubDate = e.publicationDate || new Date().toISOString();

        return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>Sandip Thapa Legal & Academic Portal</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${this.escapeXml(e.title || 'News Item')}</news:title>
    </news:news>
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${xmlItems}
</urlset>`;
  }

  generateImageSitemap(entries: ISitemapEntry[] = []): string {
    const defaultImages: ISitemapEntry[] = [
      {
        url: '/about/biography',
        images: [
          { url: `${this.BASE_URL}/sandip-thapa-profile.jpg`, title: 'Sandip Thapa Profile Photo', caption: 'Sandip Thapa — Legal Scholar & Disability Rights Researcher' },
        ],
      },
    ];

    const allEntries = entries.length > 0 ? entries : defaultImages;

    const xmlItems = allEntries
      .filter((e) => e.images && e.images.length > 0)
      .map((e) => {
        const loc = e.url.startsWith('http') ? e.url : `${this.BASE_URL}${e.url}`;
        const imgXml = e.images!
          .map(
            (img) => `    <image:image>
      <image:loc>${this.escapeXml(img.url)}</image:loc>
      <image:title>${this.escapeXml(img.title || '')}</image:title>
      <image:caption>${this.escapeXml(img.caption || '')}</image:caption>
    </image:image>`
          )
          .join('\n');

        return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
${imgXml}
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlItems}
</urlset>`;
  }

  generateVideoSitemap(entries: ISitemapEntry[] = []): string {
    const defaultVideos: ISitemapEntry[] = [
      {
        url: '/media/videos',
        videos: [
          {
            url: 'https://youtube.com/watch?v=example',
            title: 'Digital Accessibility & Human Rights Keynote Address',
            description: 'Keynote lecture on WCAG 2.2 AAA digital accessibility compliance in South Asia.',
            thumbnailUrl: `${this.BASE_URL}/video-thumb.jpg`,
          },
        ],
      },
    ];

    const allEntries = entries.length > 0 ? entries : defaultVideos;

    const xmlItems = allEntries
      .filter((e) => e.videos && e.videos.length > 0)
      .map((e) => {
        const loc = e.url.startsWith('http') ? e.url : `${this.BASE_URL}${e.url}`;
        const vidXml = e.videos!
          .map(
            (v) => `    <video:video>
      <video:thumbnail_loc>${this.escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${this.escapeXml(v.title)}</video:title>
      <video:description>${this.escapeXml(v.description)}</video:description>
      <video:player_loc>${this.escapeXml(v.url)}</video:player_loc>
    </video:video>`
          )
          .join('\n');

        return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
${vidXml}
  </url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlItems}
</urlset>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
