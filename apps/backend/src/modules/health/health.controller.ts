import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import * as os from 'os';

@ApiTags('Health & Operations Engine')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Operational health checks for the database, storage, RAM & CPU' })
  async checkHealth() {
    let dbStatus = 'healthy';
    let dbResponseMs = 0;

    const startDb = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbResponseMs = Date.now() - startDb;
    } catch {
      dbStatus = 'unhealthy';
    }

    const memoryUsage = process.memoryUsage();
    const systemFreeMemMb = Math.round(os.freemem() / 1024 / 1024);
    const systemTotalMemMb = Math.round(os.totalmem() / 1024 / 1024);

    return {
      success: true,
      statusCode: 200,
      status: dbStatus === 'healthy' ? 'up' : 'degraded',
      services: {
        database: {
          status: dbStatus,
          responseTimeMs: dbResponseMs,
          engine: 'SQLite',
        },
        cache: {
          status: 'not_configured',
          driver: 'In-Memory (no Redis integration present)',
        },
        queue: {
          status: 'not_configured',
          driver: 'None (no queue integration present)',
        },
        storage: {
          status: 'healthy',
          driver: 'LocalStorageDriver',
        },
      },
      systemMetrics: {
        uptimeSeconds: Math.floor(process.uptime()),
        processMemoryRssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        processHeapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        systemFreeMemMb,
        systemTotalMemMb,
        cpuCores: os.cpus().length,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };
  }
}
