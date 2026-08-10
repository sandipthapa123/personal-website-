import { IPageRenderResponse } from '@cms/ui-contracts';

export interface IApiClientConfig {
  baseUrl: string;
  tenantId?: string;
}

export class CmsApiClient {
  private baseUrl: string;
  private tenantId?: string;

  constructor(config: IApiClientConfig) {
    // Accept either the bare origin (http://host:port) or an origin that already
    // includes the /api/v1 prefix (as NEXT_PUBLIC_API_URL is configured) — normalize
    // to the bare origin since every method here appends /api/v1 itself.
    this.baseUrl = config.baseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    this.tenantId = config.tenantId;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.tenantId) {
      headers['x-tenant-id'] = this.tenantId;
    }
    return headers;
  }

  async getRenderPage(slug: string, locale = 'en'): Promise<IPageRenderResponse> {
    const url = `${this.baseUrl}/api/v1/renderer/page?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      // Content is backend/admin-driven and must always reflect the latest published
      // state — Next.js's default indefinite fetch cache would otherwise pin pages to
      // whatever was first rendered.
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch page render schema: ${res.statusText}`);
    }
    return (await res.json()) as IPageRenderResponse;
  }
}
