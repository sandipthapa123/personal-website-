import { ContentStatus, UserStatus, BlockTypes, LayoutRegionKeys } from '@cms/constants';

export interface ITenant {
  id: string;
  slug: string;
  domain: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: UserStatus;
  totpEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDesignToken {
  id: string;
  tenantId: string;
  category: string;
  tokenName: string;
  tokenValue: string;
  darkValue?: string;
  unit?: string;
}

export interface IBlockInstance {
  blockId: string;
  type: BlockTypes | string;
  props: Record<string, unknown>;
  style?: Record<string, string>;
  visibility?: {
    devices?: string[];
    schedule?: {
      start?: string;
      end?: string;
    };
  };
  animations?: {
    variant?: string;
    duration?: number;
    delay?: number;
  };
}

export interface ILayoutRegionMap {
  [LayoutRegionKeys.HEADER]?: IBlockInstance[];
  [LayoutRegionKeys.SIDEBAR]?: IBlockInstance[];
  [LayoutRegionKeys.MAIN]?: IBlockInstance[];
  [LayoutRegionKeys.FOOTER]?: IBlockInstance[];
  [key: string]: IBlockInstance[] | undefined;
}

export interface IPageRenderSchema {
  tenant: {
    id: string;
    slug: string;
    name: string;
    domain: string;
  };
  page: {
    id: string;
    slug: string;
    title: string;
    locale: string;
    status: ContentStatus;
    publishedAt?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    openGraphImage?: string;
  };
  layout: {
    id: string;
    name: string;
    regions: ILayoutRegionMap;
  };
}
