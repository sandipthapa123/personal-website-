export interface IUploadFileOptions {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  folder?: string;
}

export interface IStoredFileResult {
  storageKey: string;
  publicUrl: string;
  sizeBytes: number;
}

export interface IStorageDriver {
  uploadFile(options: IUploadFileOptions): Promise<IStoredFileResult>;
  deleteFile(storageKey: string): Promise<boolean>;
  getFileUrl(storageKey: string): string;
}

export const STORAGE_DRIVER_TOKEN = Symbol('STORAGE_DRIVER_TOKEN');
