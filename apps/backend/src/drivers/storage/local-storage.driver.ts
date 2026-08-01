import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageDriver, IUploadFileOptions, IStoredFileResult } from './storage.driver.interface';

@Injectable()
export class LocalStorageDriver implements IStorageDriver {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(options: IUploadFileOptions): Promise<IStoredFileResult> {
    const subfolder = options.folder ? path.join(this.uploadDir, options.folder) : this.uploadDir;
    if (!fs.existsSync(subfolder)) {
      fs.mkdirSync(subfolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${options.filename}`;
    const filePath = path.join(subfolder, uniqueName);
    await fs.promises.writeFile(filePath, options.buffer);

    const storageKey = options.folder ? `${options.folder}/${uniqueName}` : uniqueName;

    return {
      storageKey,
      publicUrl: `/uploads/${storageKey}`,
      sizeBytes: options.buffer.length,
    };
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }

  getFileUrl(storageKey: string): string {
    return `/uploads/${storageKey}`;
  }
}
