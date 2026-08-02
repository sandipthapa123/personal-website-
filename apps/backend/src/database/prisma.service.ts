import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.$connect()
      .then(() => {
        this.logger.log('Connected to Database successfully.');
      })
      .catch((err: any) => {
        this.logger.warn(
          `Database server offline (${err?.message || err}). Server running in API mode. Start PostgreSQL at localhost:5432 for DB storage.`,
        );
      });
  }

  async onModuleDestroy() {
    this.$disconnect().catch(() => {});
  }
}
