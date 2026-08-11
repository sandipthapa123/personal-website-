import { Injectable, Logger } from '@nestjs/common';
import { translate } from '@vitalets/google-translate-api';
import { PrismaService } from '../../database/prisma.service';

/**
 * Translates arbitrary title text to English, caching every result in the
 * database so the same source string is never sent to the translation API
 * more than once.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(private prisma: PrismaService) {}

  /** True if the text contains any character outside the basic ASCII range. */
  hasNonEnglishCharacters(text: string): boolean {
    return /[^\x00-\x7F]/.test(text || '');
  }

  /**
   * Translates the given text to English. Returns the original text unchanged
   * if it is already plain ASCII, if it is empty, or if the translation
   * request fails (caller is responsible for a further fallback in that case).
   */
  async translateToEnglish(text: string): Promise<string> {
    const trimmed = (text || '').trim();
    if (!trimmed) return trimmed;

    if (!this.hasNonEnglishCharacters(trimmed)) {
      return trimmed;
    }

    const cached = await this.getCached(trimmed);
    if (cached) return cached;

    try {
      const result = await translate(trimmed, { to: 'en' });
      const translated = (result?.text || '').trim();
      if (translated) {
        await this.saveToCache(trimmed, translated, result?.raw?.src || 'auto');
        return translated;
      }
    } catch (err) {
      this.logger.warn(`Translation API request failed for "${trimmed}": ${(err as Error).message}`);
    }

    return trimmed;
  }

  private async getCached(sourceText: string): Promise<string | null> {
    try {
      const row = await this.prisma.translationCache.findUnique({ where: { source_text: sourceText } });
      return row?.translated_text || null;
    } catch (err) {
      return null;
    }
  }

  private async saveToCache(sourceText: string, translatedText: string, sourceLang: string): Promise<void> {
    try {
      await this.prisma.translationCache.upsert({
        where: { source_text: sourceText },
        update: { translated_text: translatedText },
        create: {
          source_text: sourceText,
          translated_text: translatedText,
          source_lang: sourceLang,
          target_lang: 'en',
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to cache translation for "${sourceText}": ${(err as Error).message}`);
    }
  }
}
