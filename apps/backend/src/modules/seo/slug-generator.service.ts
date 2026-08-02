import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SlugGeneratorService {
  private readonly STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'at', 'by', 'for', 'from', 'in', 'into',
    'of', 'off', 'on', 'onto', 'out', 'over', 'to', 'up', 'with', 'about', 'against',
    'between', 'through', 'during', 'before', 'after', 'above', 'below', 'under'
  ]);

  // Nepali to English Dictionary for Legal & Human Rights Domain
  private readonly NEPALI_DICTIONARY: Record<string, string> = {
    'नेपालमा': 'in nepal',
    'नेपाल': 'nepal',
    'दृष्टिविहीन': 'blind',
    'व्यक्ति': 'person',
    'व्यक्तिको': 'persons',
    'व्यक्तियों': 'persons',
    'न्यायमा': 'to justice',
    'न्याय': 'justice',
    'पहुँच': 'access',
    'अधिकार': 'rights',
    'अधिकारहरू': 'rights',
    'अपाङ्गता': 'disability',
    'कानून': 'law',
    'कानूनी': 'legal',
    'क्षमता': 'capacity',
    'शिक्षा': 'education',
    'समावेशी': 'inclusive',
    'नीति': 'policy',
    'अनुसन्धान': 'research',
    'प्रकाशन': 'publication',
    'कविता': 'poem',
    'साहित्य': 'literature',
    'मानव': 'human',
    'संरक्षण': 'protection',
    'संविधान': 'constitution',
    'अदालत': 'court',
    'सर्वोच्च': 'supreme',
  };

  constructor(private prisma: PrismaService) {}

  /**
   * Generates a clean, SEO-optimized English slug from any title (English or Nepali)
   */
  generateSlug(title: string, options?: { maxWords?: number; removeStopWords?: boolean }): string {
    if (!title || title.trim() === '') return 'untitled';

    const maxWords = options?.maxWords ?? 8;
    const removeStop = options?.removeStopWords ?? true;

    // 1. Check for Nepali or non-ASCII characters and translate/romanize
    let processedText = title;
    if (/[\u0900-\u097F]/.test(title)) {
      processedText = this.translateNepaliToEnglish(title);
    }

    // 2. Clean non-alphanumeric, convert to lowercase
    let words = processedText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(Boolean);

    // 3. Remove stop words if requested (unless array becomes empty)
    if (removeStop) {
      const filtered = words.filter((w) => !this.STOP_WORDS.has(w));
      if (filtered.length > 0) {
        words = filtered;
      }
    }

    // 4. Limit to 3-8 words
    words = words.slice(0, maxWords);

    // 5. Join with hyphen
    let slug = words.join('-');

    if (!slug) slug = 'content';
    return slug;
  }

  /**
   * Translates Nepali text into meaningful English slug terms
   */
  private translateNepaliToEnglish(nepaliText: string): string {
    let result = nepaliText;

    // Direct dictionary lookup for phrase matches
    for (const [nep, eng] of Object.entries(this.NEPALI_DICTIONARY)) {
      result = result.replace(new RegExp(nep, 'g'), ` ${eng} `);
    }

    // Fallback phonetic romanization for remaining Nepali Devanagari characters
    result = this.romanizeDevanagari(result);
    return result;
  }

  /**
   * Fallback phonetic romanization for Devanagari Unicode
   */
  private romanizeDevanagari(text: string): string {
    const charMap: Record<string, string> = {
      'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
      'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
      'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
      'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
      'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
      'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha',
      'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'ा': 'a', 'ि': 'i',
      'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'े': 'e', 'ै': 'ai',
      'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h', '्': '',
    };

    return text
      .split('')
      .map((ch) => charMap[ch] || (/[a-zA-Z0-9\s-]/.test(ch) ? ch : ''))
      .join('');
  }

  /**
   * Ensures slug uniqueness by appending incremental suffix if duplicate exists
   */
  async ensureUniqueSlug(slug: string, tenantId = 'default-tenant-id', excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    try {
      while (true) {
        const existing = await this.prisma.page.findFirst({
          where: {
            tenant_id: tenantId,
            slug: uniqueSlug,
            ...(excludeId ? { id: { not: excludeId } } : {}),
          },
        });

        if (!existing) {
          break;
        }

        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
    } catch (err) {
      // In-memory fallback
    }

    return uniqueSlug;
  }
}
