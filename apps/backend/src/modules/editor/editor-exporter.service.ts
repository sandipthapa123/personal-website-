import { Injectable } from '@nestjs/common';

export interface IExportResult {
  html: string;
  markdown: string;
  plainText: string;
  rssXml: string;
  epubStructure: Record<string, any>;
  wordCount: number;
  readingTimeMinutes: number;
}

@Injectable()
export class EditorExporterService {
  
  exportBlocks(blocks: any[], pageTitle = 'Untitled Page', pageUrl = 'https://thapasandip.com.np'): IExportResult {
    const htmlParts: string[] = [];
    const mdParts: string[] = [];
    const textParts: string[] = [];

    for (const b of blocks || []) {
      const { type, props } = b;

      switch (type) {
        case 'HEADING': {
          const level = props.level || 2;
          const text = props.text || '';
          htmlParts.push(`<h${level} id="${props.anchorId || ''}">${text}</h${level}>`);
          mdParts.push(`${'#'.repeat(parseInt(level, 10))} ${text}\n`);
          textParts.push(text);
          break;
        }
        case 'RICH_TEXT':
        case 'TEXT_BLOCK':
        case 'PARAGRAPH': {
          const htmlContent = props.html || props.content || props.text || '';
          const cleanText = htmlContent.replace(/<[^>]*>/g, '');
          htmlParts.push(`<div>${htmlContent}</div>`);
          mdParts.push(`${cleanText}\n`);
          textParts.push(cleanText);
          break;
        }
        case 'QUOTE': {
          const text = props.text || '';
          const attr = props.attribution ? `<cite>— ${props.attribution}</cite>` : '';
          htmlParts.push(`<blockquote><p>${text}</p>${attr}</blockquote>`);
          mdParts.push(`> ${text}\n${props.attribution ? `> — ${props.attribution}` : ''}\n`);
          textParts.push(`"${text}" ${props.attribution || ''}`);
          break;
        }
        case 'CODE_BLOCK': {
          const code = props.code || '';
          const lang = props.language || '';
          htmlParts.push(`<pre><code class="language-${lang}">${this.escapeHtml(code)}</code></pre>`);
          mdParts.push(`\`\`\`${lang}\n${code}\n\`\`\`\n`);
          textParts.push(code);
          break;
        }
        case 'IMAGE': {
          const alt = props.alt || '';
          const src = props.src || '';
          const cap = props.caption ? `<figcaption>${props.caption}</figcaption>` : '';
          htmlParts.push(`<figure><img src="${src}" alt="${alt}" />${cap}</figure>`);
          mdParts.push(`![${alt}](${src})\n${props.caption ? `*${props.caption}*` : ''}\n`);
          textParts.push(`[Image: ${alt}]`);
          break;
        }
        case 'ORDERED_LIST':
        case 'UNORDERED_LIST': {
          const isOrdered = type === 'ORDERED_LIST';
          const items = Array.isArray(props.items) ? props.items : [];
          const tag = isOrdered ? 'ol' : 'ul';
          const listHtml = items.map((it: any) => `<li>${it.text || it}</li>`).join('');
          htmlParts.push(`<${tag}>${listHtml}</${tag}>`);
          mdParts.push(items.map((it: any, i: number) => `${isOrdered ? `${i + 1}.` : '-'} ${it.text || it}`).join('\n') + '\n');
          textParts.push(items.map((it: any) => it.text || it).join(', '));
          break;
        }
        case 'TABLE': {
          const headers = Array.isArray(props.headers) ? props.headers : [];
          const rows = Array.isArray(props.rows) ? props.rows : [];
          const cap = props.caption ? `<caption>${props.caption}</caption>` : '';
          const thHtml = headers.map((h: string) => `<th scope="col">${h}</th>`).join('');
          const trHtml = rows.map((r: string[]) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
          htmlParts.push(`<table>${cap}<thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table>`);
          
          const mdHeader = `| ${headers.join(' | ')} |`;
          const mdDivider = `| ${headers.map(() => '---').join(' | ')} |`;
          const mdRows = rows.map((r: string[]) => `| ${r.join(' | ')} |`).join('\n');
          mdParts.push(`${mdHeader}\n${mdDivider}\n${mdRows}\n`);
          textParts.push(headers.join(' ') + ' ' + rows.flat().join(' '));
          break;
        }
        case 'CALLOUT': {
          htmlParts.push(`<div class="callout callout-${props.variant || 'info'}"><strong>${props.title || ''}</strong><p>${props.message || ''}</p></div>`);
          mdParts.push(`> **${props.title || 'Note'}**: ${props.message || ''}\n`);
          textParts.push(`${props.title || ''}: ${props.message || ''}`);
          break;
        }
        case 'DIVIDER': {
          htmlParts.push('<hr />');
          mdParts.push('---\n');
          break;
        }
        default: {
          if (props.title || props.heading || props.content || props.text) {
            const val = props.title || props.heading || props.content || props.text;
            htmlParts.push(`<div>${val}</div>`);
            textParts.push(val);
          }
          break;
        }
      }
    }

    const html = htmlParts.join('\n');
    const markdown = mdParts.join('\n');
    const plainText = textParts.join('\n\n').trim();

    // Word count & reading time
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

    // RSS XML
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${this.escapeHtml(pageTitle)}</title>
    <link>${pageUrl}</link>
    <description>Exported RSS Item from Sandip Thapa Personal CMS</description>
    <item>
      <title>${this.escapeHtml(pageTitle)}</title>
      <link>${pageUrl}</link>
      <description><![CDATA[${html}]]></description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

    // EPUB Structure
    const epubStructure = {
      title: pageTitle,
      creator: 'Sandip Thapa',
      publisher: 'thapasandip.com.np',
      language: 'en',
      identifier: pageUrl,
      modified: new Date().toISOString(),
      sections: [
        {
          id: 'chapter-1',
          title: pageTitle,
          contentHtml: html,
        },
      ],
    };

    return {
      html,
      markdown,
      plainText,
      rssXml,
      epubStructure,
      wordCount: words,
      readingTimeMinutes,
    };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
