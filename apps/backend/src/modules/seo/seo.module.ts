import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SlugGeneratorService } from './slug-generator.service';
import { RedirectManagerService } from './redirect-manager.service';
import { SchemaGeneratorService } from './schema-generator.service';
import { SitemapGeneratorService } from './sitemap-generator.service';
import { RssFeedService } from './rss-feed.service';
import { SeoAnalyzerService } from './seo-analyzer.service';

@Module({
  controllers: [SeoController],
  providers: [
    SlugGeneratorService,
    RedirectManagerService,
    SchemaGeneratorService,
    SitemapGeneratorService,
    RssFeedService,
    SeoAnalyzerService,
  ],
  exports: [
    SlugGeneratorService,
    RedirectManagerService,
    SchemaGeneratorService,
    SitemapGeneratorService,
    RssFeedService,
    SeoAnalyzerService,
  ],
})
export class SeoModule {}
