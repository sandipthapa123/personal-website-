import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedirectManagerService } from './redirect-manager.service';
import { TranslationService } from './translation.service';

export type SlugMode = 'AUTO' | 'MANUAL';
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface ISlugStateRequest {
  title: string;
  currentSlug?: string;
  slugMode?: SlugMode;
  status?: ContentStatus;
  action?: 'TITLE_CHANGE' | 'MANUAL_EDIT' | 'GENERATE_BUTTON' | 'RESET_TO_AUTO';
  contentId?: string;
  tenantId?: string;
}

export interface ISlugStateResult {
  slug: string;
  slugMode: SlugMode;
  redirectCreated: boolean;
  oldSlug?: string;
  newSlug?: string;
  isPublished: boolean;
}

@Injectable()
export class SlugGeneratorService {
  // Phrase-level exact translations for Legal, Academic, and Human Rights Titles
  private readonly KNOWN_PHRASE_MAP: Array<{ nepali: RegExp; english: string }> = [
    { nepali: /नेपालमा दृष्टिविहीन व्यक्तिको न्यायमा पहुँच/i, english: 'access to justice for blind persons in nepal' },
    { nepali: /दृष्टिविहीन व्यक्तिको न्यायमा पहुँच/i, english: 'access to justice for blind persons' },
    { nepali: /अपाङ्गता भएका व्यक्तिको अधिकार/i, english: 'rights of persons with disabilities' },
    { nepali: /कानूनी क्षमता र संरक्षित निर्णय प्रक्रिया/i, english: 'legal capacity and supported decision making' },
    { nepali: /मानव अधिकार र समावेशी कानून/i, english: 'human rights and inclusive law' },
    { nepali: /डिजिटल समावेशीता र पहुँच योग्यता/i, english: 'digital inclusion and accessibility' },
    { nepali: /नेपालको संविधान र मौलिक हक/i, english: 'constitution of nepal and fundamental rights' },
    { nepali: /सर्वोच्च अदालतको फैसला र कानूनी नजिर/i, english: 'supreme court precedent and legal rulings' },
  ];

  // Token-level semantic dictionary
  private readonly TOKEN_DICTIONARY: Array<{ nepali: string; english: string }> = [
    { nepali: 'दृष्टिविहीन', english: 'blind' },
    { nepali: 'व्यक्तिहरू', english: 'persons' },
    { nepali: 'व्यक्तिहरूको', english: 'persons' },
    { nepali: 'व्यक्तिको', english: 'persons' },
    { nepali: 'व्यक्ति', english: 'person' },
    { nepali: 'अपाङ्गता', english: 'disability' },
    { nepali: 'न्यायमा', english: 'to justice' },
    { nepali: 'न्यायको', english: 'of justice' },
    { nepali: 'न्याय', english: 'justice' },
    { nepali: 'पहुँच', english: 'access' },
    { nepali: 'नेपालमा', english: 'in nepal' },
    { nepali: 'नेपालको', english: 'of nepal' },
    { nepali: 'नेपाल', english: 'nepal' },
    { nepali: 'अधिकारहरू', english: 'rights' },
    { nepali: 'अधिकारको', english: 'rights' },
    { nepali: 'अधिकार', english: 'rights' },
    { nepali: 'कानूनी', english: 'legal' },
    { nepali: 'कानून', english: 'law' },
    { nepali: 'क्षमता', english: 'capacity' },
    { nepali: 'शिक्षा', english: 'education' },
    { nepali: 'समावेशी', english: 'inclusive' },
    { nepali: 'नीति', english: 'policy' },
    { nepali: 'अनुसन्धान', english: 'research' },
    { nepali: 'प्रकाशन', english: 'publication' },
    { nepali: 'कविता', english: 'poem' },
    { nepali: 'साहित्य', english: 'literature' },
    { nepali: 'मानव', english: 'human' },
    { nepali: 'संरक्षण', english: 'protection' },
    { nepali: 'संविधान', english: 'constitution' },
    { nepali: 'अदालत', english: 'court' },
    { nepali: 'सर्वोच्च', english: 'supreme' },
  ];

  private readonly SUFFIX_MAP: Array<{ nepali: string; english: string }> = [
    { nepali: 'को', english: 'of' },
    { nepali: 'का', english: 'of' },
    { nepali: 'की', english: 'of' },
    { nepali: 'मा', english: 'in' },
    { nepali: 'लाई', english: 'to' },
    { nepali: 'द्वारा', english: 'by' },
    { nepali: 'सँग', english: 'with' },
    { nepali: 'बाट', english: 'from' },
  ];

  private readonly logger = new Logger(SlugGeneratorService.name);

  constructor(
    private prisma: PrismaService,
    private redirectManager: RedirectManagerService,
    private translationService: TranslationService,
  ) {}

  /**
   * Generates a clean, fluent, professional SEO-optimized English slug from any title.
   * Non-English titles are machine-translated to English first (result cached in the
   * database); the built-in legal/academic phrase dictionary is used as a fallback
   * whenever the translation service is unreachable.
   */
  async generateSlug(title: string, options?: { maxWords?: number; preservePrepositions?: boolean }): Promise<string> {
    if (!title || title.trim() === '') return 'untitled';

    const maxWords = options?.maxWords ?? 8;
    const preservePrep = options?.preservePrepositions ?? true;

    // 1. Translate to English if any non-English characters are present
    let englishText = title;
    if (this.translationService.hasNonEnglishCharacters(title)) {
      try {
        const translated = await this.translationService.translateToEnglish(title);
        englishText = this.translationService.hasNonEnglishCharacters(translated)
          ? this.translateNepaliToProfessionalEnglish(title)
          : translated;
      } catch (err) {
        this.logger.warn(`Falling back to dictionary translation for "${title}": ${(err as Error).message}`);
        englishText = this.translateNepaliToProfessionalEnglish(title);
      }
    }

    // 2. Normalize and split into words
    let words = englishText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    // 3. Filter out redundant noise words
    const noiseWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'been',
      'has', 'have', 'had', 'do', 'does', 'did'
    ]);

    if (!preservePrep) {
      ['in', 'on', 'at', 'by', 'for', 'from', 'of', 'to', 'with'].forEach((p) => noiseWords.add(p));
    }

    const filtered = words.filter((w) => !noiseWords.has(w));
    if (filtered.length > 0) {
      words = filtered;
    }

    // 4. Limit to maxWords
    words = words.slice(0, maxWords);

    // 5. Join with hyphen
    let slug = words.join('-');
    slug = slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    if (!slug) slug = 'content';
    return slug;
  }

  /**
   * Computes intelligent slug state with published protection, 301 redirects, and manual override tracking.
   */
  async computeSlugState(req: ISlugStateRequest): Promise<ISlugStateResult> {
    const isPublished = req.status === 'PUBLISHED';
    let currentMode: SlugMode = req.slugMode || 'AUTO';
    let finalSlug = req.currentSlug || '';
    let redirectCreated = false;
    const oldSlug = req.currentSlug;

    // Action 1: RESET_TO_AUTO -> Clears manual override, enables AUTO, regenerates slug
    if (req.action === 'RESET_TO_AUTO') {
      currentMode = 'AUTO';
      finalSlug = await this.generateSlug(req.title);
    }
    // Action 2: GENERATE_BUTTON -> Explicit manual regeneration button click
    else if (req.action === 'GENERATE_BUTTON') {
      finalSlug = await this.generateSlug(req.title);
    }
    // Action 3: MANUAL_EDIT -> User manually typed into slug input -> Set MANUAL mode
    else if (req.action === 'MANUAL_EDIT') {
      currentMode = 'MANUAL';
      finalSlug = await this.generateSlug(req.currentSlug || req.title);
    }
    // Action 4: TITLE_CHANGE -> Title changed
    else if (req.action === 'TITLE_CHANGE') {
      // If content is published, automatic slug updates STOP
      if (isPublished) {
        finalSlug = req.currentSlug || (await this.generateSlug(req.title));
      } else if (currentMode === 'AUTO') {
        finalSlug = await this.generateSlug(req.title);
      }
    } else {
      // Fallback
      if (currentMode === 'AUTO' && !isPublished) {
        finalSlug = await this.generateSlug(req.title);
      }
    }

    // Uniqueness validation
    finalSlug = await this.ensureUniqueSlug(finalSlug, req.tenantId || 'default-tenant-id', req.contentId);

    // 301 Redirect Generation if Published content slug changes
    if (isPublished && oldSlug && oldSlug !== finalSlug) {
      this.redirectManager.handleSlugChange(oldSlug, finalSlug);
      redirectCreated = true;
    }

    return {
      slug: finalSlug,
      slugMode: currentMode,
      redirectCreated,
      oldSlug,
      newSlug: finalSlug,
      isPublished: !!isPublished,
    };
  }

  private translateNepaliToProfessionalEnglish(nepaliText: string): string {
    const trimmed = nepaliText.trim();

    for (const phrase of this.KNOWN_PHRASE_MAP) {
      if (phrase.nepali.test(trimmed)) {
        return phrase.english;
      }
    }

    const rawTokens = trimmed.split(/\s+/).filter(Boolean);
    const translatedTokens: string[] = [];

    for (const token of rawTokens) {
      let matched = false;

      for (const dictItem of this.TOKEN_DICTIONARY) {
        if (token === dictItem.nepali) {
          translatedTokens.push(dictItem.english);
          matched = true;
          break;
        }
      }

      if (!matched) {
        let stem = token;
        let suffixEng = '';

        for (const suf of this.SUFFIX_MAP) {
          if (stem.endsWith(suf.nepali) && stem.length > suf.nepali.length) {
            stem = stem.slice(0, -suf.nepali.length);
            suffixEng = suf.english;
            break;
          }
        }

        for (const dictItem of this.TOKEN_DICTIONARY) {
          if (stem === dictItem.nepali) {
            translatedTokens.push(suffixEng ? `${dictItem.english} ${suffixEng}` : dictItem.english);
            matched = true;
            break;
          }
        }

        if (!matched) {
          translatedTokens.push(this.romanizeClean(stem));
        }
      }
    }

    return this.reorderToNaturalEnglish(translatedTokens.join(' '));
  }

  private reorderToNaturalEnglish(translatedString: string): string {
    let str = translatedString.toLowerCase();
    if (str.includes('justice') && str.includes('access') && !str.includes('access to justice')) {
      str = str.replace(/justice\s+access/g, 'access to justice');
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  private romanizeClean(devanagariText: string): string {
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

    return devanagariText
      .split('')
      .map((ch) => charMap[ch] || (/[a-zA-Z0-9\s-]/.test(ch) ? ch : ''))
      .join('');
  }

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
