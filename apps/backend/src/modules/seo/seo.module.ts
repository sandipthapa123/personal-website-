import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SlugGeneratorService } from './slug-generator.service';
import { TranslationService } from './translation.service';
import { RedirectManagerService } from './redirect-manager.service';
import { SchemaGeneratorService } from './schema-generator.service';
import { SitemapGeneratorService } from './sitemap-generator.service';
import { RssFeedService } from './rss-feed.service';
import { SeoAnalyzerService } from './seo-analyzer.service';

@Module({
  controllers: [SeoController],
  providers: [
    SlugGeneratorService,
    TranslationService,
    RedirectManagerService,
    SchemaGeneratorService,
    SitemapGeneratorService,
    RssFeedService,
    SeoAnalyzerService,
  ],
  exports: [
    SlugGeneratorService,
    TranslationService,
    RedirectManagerService,
    SchemaGeneratorService,
    SitemapGeneratorService,
    RssFeedService,
    SeoAnalyzerService,
  ],
})
export class SeoModule {}
