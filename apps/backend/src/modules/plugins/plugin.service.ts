import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface IPluginManifest {
  name: string;
  version: string;
  description?: string;
  configSchema?: Record<string, unknown>;
}

@Injectable()
export class PluginService {
  constructor(private prisma: PrismaService) {}

  async registerPlugin(manifest: IPluginManifest) {
    return this.prisma.plugin.upsert({
      where: { name: manifest.name },
      update: {
        version: manifest.version,
        config_json: (manifest.configSchema as any) || {},
      },
      create: {
        name: manifest.name,
        version: manifest.version,
        config_json: (manifest.configSchema as any) || {},
        is_active: false,
      },
    });
  }

  async togglePlugin(name: string, isActive: boolean) {
    const plugin = await this.prisma.plugin.findUnique({ where: { name } });
    if (!plugin) throw new NotFoundException(`Plugin '${name}' not registered`);

    return this.prisma.plugin.update({
      where: { name },
      data: { is_active: isActive },
    });
  }

  async getInstalledPlugins() {
    return this.prisma.plugin.findMany({
      orderBy: { installed_at: 'desc' },
    });
  }
}
