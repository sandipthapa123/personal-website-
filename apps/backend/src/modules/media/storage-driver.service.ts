import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export type StorageDriverType = 'local_disk' | 's3' | 'r2' | 'minio' | 'gcs' | 'azure';

export interface StorageConfig {
  driver: StorageDriverType;
  localPath?: string;
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export interface UploadResult {
  storageKey: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  driver: StorageDriverType;
}

export interface MulterFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

export interface IStorageDriver {
  upload(file: MulterFileLike, folder?: string): Promise<UploadResult>;
  delete(storageKey: string): Promise<boolean>;
  getUrl(storageKey: string): string;
}

@Injectable()
export class StorageDriverService implements IStorageDriver {
  private config: StorageConfig = {
    driver: (process.env.STORAGE_DRIVER as StorageDriverType) || 'local_disk',
    localPath: path.resolve(process.cwd(), 'uploads'),
  };

  constructor() {
    if (!fs.existsSync(this.config.localPath!)) {
      fs.mkdirSync(this.config.localPath!, { recursive: true });
    }
  }

  setDriverConfig(newConfig: Partial<StorageConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getDriverConfig(): StorageConfig {
    return { ...this.config };
  }

  async upload(file: MulterFileLike, folder = 'general'): Promise<UploadResult> {
    switch (this.config.driver) {
      case 's3':
      case 'r2':
      case 'minio':
        return this.uploadCloudS3Compatible(file, folder);
      case 'gcs':
        return this.uploadGcs(file, folder);
      case 'azure':
        return this.uploadAzure(file, folder);
      case 'local_disk':
      default:
        return this.uploadLocalDisk(file, folder);
    }
  }

  private async uploadLocalDisk(file: MulterFileLike, folder: string): Promise<UploadResult> {
    const targetDir = path.join(this.config.localPath!, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeFilename = `${path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '')}-${uniqueSuffix}${ext}`;
    const filePath = path.join(targetDir, safeFilename);

    if (file.buffer) {
      await fs.promises.writeFile(filePath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, filePath);
    }

    const storageKey = `${folder}/${safeFilename}`;
    const publicUrl = `${process.env.APP_URL || 'http://localhost:4000'}/uploads/${storageKey}`;

    return {
      storageKey,
      publicUrl,
      filename: safeFilename,
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size || (file.buffer ? file.buffer.length : 0),
      driver: 'local_disk',
    };
  }

  private async uploadCloudS3Compatible(file: MulterFileLike, folder: string): Promise<UploadResult> {
    const storageKey = `${folder}/${Date.now()}-${file.originalname}`;
    const endpoint = this.config.endpoint || 'https://s3.amazonaws.com';
    const publicUrl = `${endpoint}/${this.config.bucket || 'cms-assets'}/${storageKey}`;

    return {
      storageKey,
      publicUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      driver: this.config.driver,
    };
  }

  private async uploadGcs(file: MulterFileLike, folder: string): Promise<UploadResult> {
    const storageKey = `${folder}/${Date.now()}-${file.originalname}`;
    const publicUrl = `https://storage.googleapis.com/${this.config.bucket || 'cms-assets'}/${storageKey}`;

    return {
      storageKey,
      publicUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      driver: 'gcs',
    };
  }

  private async uploadAzure(file: MulterFileLike, folder: string): Promise<UploadResult> {
    const storageKey = `${folder}/${Date.now()}-${file.originalname}`;
    const publicUrl = `https://${this.config.bucket || 'account'}.blob.core.windows.net/container/${storageKey}`;

    return {
      storageKey,
      publicUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      driver: 'azure',
    };
  }

  async delete(storageKey: string): Promise<boolean> {
    if (this.config.driver === 'local_disk') {
      const filePath = path.join(this.config.localPath!, storageKey);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    }
    return true;
  }

  getUrl(storageKey: string): string {
    if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) {
      return storageKey;
    }
    return `${process.env.APP_URL || 'http://localhost:4000'}/uploads/${storageKey}`;
  }
}
