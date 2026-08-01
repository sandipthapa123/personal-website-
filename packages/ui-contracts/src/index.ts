import { IPageRenderSchema } from '@cms/shared-types';

export interface IApiResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta: {
    tenantId?: string;
    timestamp: string;
    version: string;
  };
}

export interface IPaginatedMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  timestamp: string;
}

export interface IPaginatedApiResponseEnvelope<T> {
  success: boolean;
  statusCode: number;
  data: T[];
  meta: IPaginatedMeta;
}

export type IPageRenderResponse = IApiResponseEnvelope<IPageRenderSchema>;
