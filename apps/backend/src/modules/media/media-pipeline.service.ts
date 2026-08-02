import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LocalStorageDriver } from '../../drivers/storage/local-storage.driver';

@Injectable()
export class MediaPipelineService {
  private storageDriver: LocalStorageDriver;

  // In-memory fallback store when DB is offline
  private memoryAssets: any[] = [
    {
      id: 'media-sample-1',
      filename: 'sandip-thapa-profile.jpg',
      url: '/uploads/sandip-thapa-profile.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 245760,
      altText: 'Sandip Thapa - Legal Scholar and Human Rights Advocate',
      caption: 'Portrait of Sandip Thapa',
      folder: '/profile',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'media-sample-2',
      filename: 'crpd-article-12-analysis.pdf',
      url: '/uploads/crpd-article-12-analysis.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1048576,
      altText: 'CRPD Article 12 Legal Analysis',
      caption: 'Legal research publication on UN CRPD Article 12',
      folder: '/publications',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'media-sample-3',
      filename: 'disability-rights-nepal-report.pdf',
      url: '/uploads/disability-rights-nepal-report.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 2097152,
      altText: 'Disability Rights Nepal Report 2026',
      caption: 'Annual Disability Rights Advocacy Report - Nepal 2026',
      folder: '/research',
      createdAt: new Date().toISOString(),
    },
  ];

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
    const newAsset = {
      id: `media-${Date.now()}`,
      filename: file.originalname,
      url: `/uploads/${uploadResult.storageKey}`,
      mimeType: file.mimetype,
      sizeBytes: Number(file.buffer.length),
      altText: altText || file.originalname,
      caption: caption || '',
      folder: '/',
      createdAt: new Date().toISOString(),
    };

    // Try to persist to DB, fall back to in-memory
    try {
      const dbResult = await this.prisma.mediaFile.create({
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
      // Normalize BigInt for serialization
      return {
        ...dbResult,
        size_bytes: dbResult.size_bytes.toString(),
      };
    } catch (err) {
      this.memoryAssets.unshift(newAsset);
      return newAsset;
    }
  }

  async processAndStoreFile(tenantId: string, file: any) {
    return this.processAndUploadMedia(tenantId, file);
  }

  async getMediaAsset(tenantId: string, id: string) {
    try {
      return await this.prisma.mediaFile.findFirst({
        where: { id, tenant_id: tenantId },
      });
    } catch (err) {
      return this.memoryAssets.find((a) => a.id === id) || null;
    }
  }

  async listMediaAssets(tenantId: string, skip = 0, take = 20) {
    try {
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
          url: `/uploads/${f.storage_key}`,
          mimeType: f.mime_type,
          sizeBytes: Number(f.size_bytes),
          altText: f.alt_text,
          caption: f.caption,
          folder: f.folder || '/',
          createdAt: f.created_at,
        })),
      };
    } catch (err) {
      // DB offline — return in-memory fallback
      const sliced = this.memoryAssets.slice(skip, skip + take);
      return {
        total: this.memoryAssets.length,
        skip,
        take,
        items: sliced,
        source: 'in-memory-fallback',
      };
    }
  }

  async getMediaFiles(tenantId: string) {
    return this.listMediaAssets(tenantId);
  }

  async deleteMediaAsset(tenantId: string, id: string): Promise<{ success: boolean }> {
    try {
      await this.prisma.mediaFile.deleteMany({ where: { id, tenant_id: tenantId } });
      return { success: true };
    } catch (err) {
      const idx = this.memoryAssets.findIndex((a) => a.id === id);
      if (idx !== -1) this.memoryAssets.splice(idx, 1);
      return { success: true };
    }
  }
}
