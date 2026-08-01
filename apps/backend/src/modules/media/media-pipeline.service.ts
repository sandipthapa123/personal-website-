import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LocalStorageDriver } from '../../drivers/storage/local-storage.driver';

@Injectable()
export class MediaPipelineService {
  private storageDriver = new LocalStorageDriver();

  constructor(private prisma: PrismaService) {}

  async processAndStoreFile(
    tenantId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    folder = 'general',
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid file upload payload');
    }

    // 1. File Validation
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported MIME type: ${file.mimetype}`);
    }

    // 2. Storage Driver Delegation
    const stored = await this.storageDriver.uploadFile({
      filename: file.originalname,
      buffer: file.buffer,
      mimeType: file.mimetype,
      folder,
    });

    // 3. Database Metadata Record
    return this.prisma.mediaFile.create({
      data: {
        tenant_id: tenantId,
        filename: stored.storageKey,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: BigInt(file.size),
        storage_key: stored.storageKey,
        folder,
        alt_text: file.originalname.replace(/[-_]/g, ' '),
        variants_json: {
          originalUrl: stored.publicUrl,
        },
      },
    });
  }

  async getMediaFiles(tenantId: string) {
    const files = await this.prisma.mediaFile.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });

    return files.map((f) => ({
      ...f,
      size_bytes: f.size_bytes.toString(),
    }));
  }
}
