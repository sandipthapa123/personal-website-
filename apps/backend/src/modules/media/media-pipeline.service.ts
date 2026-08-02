import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LocalStorageDriver } from '../../drivers/storage/local-storage.driver';

@Injectable()
export class MediaPipelineService {
  private storageDriver: LocalStorageDriver;

  constructor(private prisma: PrismaService) {
    this.storageDriver = new LocalStorageDriver();
  }

  async processAndUploadMedia(
    tenantId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    altText?: string,
    caption?: string,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Invalid media payload');
    }

    const uploadResult = await this.storageDriver.uploadFile({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
    });

    const sizeBytes = BigInt(file.buffer.length);

    return this.prisma.mediaFile.create({
      data: {
        tenant_id: tenantId,
        filename: file.originalname,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: sizeBytes,
        storage_key: uploadResult.storageKey,
        alt_text: altText || file.originalname,
        caption,
      },
    });
  }

  async processAndStoreFile(tenantId: string, file: any) {
    return this.processAndUploadMedia(tenantId, file);
  }

  async getMediaAsset(tenantId: string, id: string) {
    return this.prisma.mediaFile.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
    });
  }

  async listMediaAssets(tenantId: string, skip = 0, take = 20) {
    const [total, files] = await Promise.all([
      this.prisma.mediaFile.count({ where: { tenant_id: tenantId } }),
      this.prisma.mediaFile.findMany({
        where: { tenant_id: tenantId },
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return {
      total,
      skip,
      take,
      items: files.map((f: any) => ({
        id: f.id,
        filename: f.filename,
        url: `http://localhost:4000/uploads/${f.storage_key}`,
        mimeType: f.mime_type,
        sizeBytes: Number(f.size_bytes),
        altText: f.alt_text,
        caption: f.caption,
      })),
    };
  }

  async getMediaFiles(tenantId: string) {
    return this.listMediaAssets(tenantId);
  }
}
