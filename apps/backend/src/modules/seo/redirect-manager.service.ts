import { Injectable } from '@nestjs/common';

export interface IRedirectRule {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  statusCode: 301 | 302 | 307 | 410;
  isAutomatic: boolean;
  createdAt: string;
}

@Injectable()
export class RedirectManagerService {
  private redirects: Map<string, IRedirectRule> = new Map();

  constructor() {
    // Seed default redirect rule
    this.addRedirect('/old-disability-policy', '/research/projects', 301, true);
  }

  addRedirect(sourceUrl: string, targetUrl: string, statusCode: 301 | 302 | 307 | 410 = 301, isAutomatic = false): IRedirectRule {
    const cleanSource = this.normalizeUrl(sourceUrl);
    const cleanTarget = this.normalizeUrl(targetUrl);

    const rule: IRedirectRule = {
      id: `redirect-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceUrl: cleanSource,
      targetUrl: cleanTarget,
      statusCode,
      isAutomatic,
      createdAt: new Date().toISOString(),
    };

    this.redirects.set(cleanSource, rule);
    return rule;
  }

  /**
   * Automatically creates a 301 redirect if a published slug changes
   */
  handleSlugChange(oldSlug: string, newSlug: string, prefix = '') {
    if (!oldSlug || !newSlug || oldSlug === newSlug) return;

    const oldPath = this.normalizeUrl(`${prefix}/${oldSlug}`);
    const newPath = this.normalizeUrl(`${prefix}/${newSlug}`);

    this.addRedirect(oldPath, newPath, 301, true);
  }

  findRedirect(sourceUrl: string): IRedirectRule | undefined {
    const cleanSource = this.normalizeUrl(sourceUrl);
    return this.redirects.get(cleanSource);
  }

  getAllRedirects(): IRedirectRule[] {
    return Array.from(this.redirects.values());
  }

  deleteRedirect(id: string): boolean {
    for (const [key, rule] of this.redirects.entries()) {
      if (rule.id === id) {
        this.redirects.delete(key);
        return true;
      }
    }
    return false;
  }

  private normalizeUrl(url: string): string {
    return url.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  }
}
