import { Injectable } from '@nestjs/common';

export interface IFeedItem {
  id: string;
  title: string;
  url: string;
  summary: string;
  contentHtml?: string;
  datePublished: string;
  authorName?: string;
  category?: string;
}

@Injectable()
export class RssFeedService {
  private readonly SITE_TITLE = 'Sandip Thapa — Academic Research, Law & Accessibility';
  private readonly SITE_URL = 'https://thapasandip.com.np';
  private readonly SITE_DESC = 'Official academic research, legal publication, and policy consulting platform of Sandip Thapa.';

  generateRssXml(items: IFeedItem[]): string {
    const itemsXml = items
      .map(
        (it) => `    <item>
      <title>${this.escapeXml(it.title)}</title>
      <link>${it.url.startsWith('http') ? it.url : `${this.SITE_URL}${it.url}`}</link>
      <guid isPermaLink="true">${it.url.startsWith('http') ? it.url : `${this.SITE_URL}${it.url}`}</guid>
      <description><![CDATA[${it.summary || ''}]]></description>
      <pubDate>${new Date(it.datePublished).toUTCString()}</pubDate>
      <author>${it.authorName || 'Sandip Thapa'}</author>
      ${it.category ? `<category>${this.escapeXml(it.category)}</category>` : ''}
    </item>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${this.escapeXml(this.SITE_TITLE)}</title>
    <link>${this.SITE_URL}</link>
    <description>${this.escapeXml(this.SITE_DESC)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${this.SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
  }

  generateAtomXml(items: IFeedItem[]): string {
    const entriesXml = items
      .map(
        (it) => `  <entry>
    <title>${this.escapeXml(it.title)}</title>
    <link href="${it.url.startsWith('http') ? it.url : `${this.SITE_URL}${it.url}`}" />
    <id>${it.url.startsWith('http') ? it.url : `${this.SITE_URL}${it.url}`}</id>
    <updated>${new Date(it.datePublished).toISOString()}</updated>
    <summary>${this.escapeXml(it.summary || '')}</summary>
    <author>
      <name>${it.authorName || 'Sandip Thapa'}</name>
    </author>
  </entry>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${this.escapeXml(this.SITE_TITLE)}</title>
  <link href="${this.SITE_URL}" />
  <link href="${this.SITE_URL}/atom.xml" rel="self" />
  <updated>${new Date().toISOString()}</updated>
  <id>${this.SITE_URL}/</id>
${entriesXml}
</feed>`;
  }

  generateJsonFeed(items: IFeedItem[]): Record<string, any> {
    return {
      version: 'https://jsonfeed.org/version/1.1',
      title: this.SITE_TITLE,
      home_page_url: this.SITE_URL,
      feed_url: `${this.SITE_URL}/feed.json`,
      description: this.SITE_DESC,
      authors: [{ name: 'Sandip Thapa', url: this.SITE_URL }],
      items: items.map((it) => ({
        id: it.id,
        url: it.url.startsWith('http') ? it.url : `${this.SITE_URL}${it.url}`,
        title: it.title,
        summary: it.summary,
        content_html: it.contentHtml || it.summary,
        date_published: new Date(it.datePublished).toISOString(),
      })),
    };
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
