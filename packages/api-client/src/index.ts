import { IPageRenderResponse } from '@cms/ui-contracts';

export interface IApiClientConfig {
  baseUrl: string;
  tenantId?: string;
}

export class CmsApiClient {
  private baseUrl: string;
  private tenantId?: string;

  constructor(config: IApiClientConfig) {
    this.baseUrl = config.baseUrl;
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
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch page render schema: ${res.statusText}`);
    }
    return (await res.json()) as IPageRenderResponse;
  }
}
