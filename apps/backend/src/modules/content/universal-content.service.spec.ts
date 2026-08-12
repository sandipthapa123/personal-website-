import { Test, TestingModule } from '@nestjs/testing';
import { UniversalContentService } from './universal-content.service';
import { PrismaService } from '../../database/prisma.service';
import { SlugGeneratorService } from '../seo/slug-generator.service';

/**
 * Regression coverage for the two defects that broke the admin console:
 *  - an unmapped `sortBy` reaching Prisma's `orderBy` (500 on every content list,
 *    which the admin UI rendered as a permanently empty table), and
 *  - `getContentStats` returning only {total, published}, leaving every sidebar
 *    badge and dashboard tile blank.
 */
describe('UniversalContentService', () => {
  let service: UniversalContentService;
  let findMany: jest.Mock;
  let count: jest.Mock;
  let groupBy: jest.Mock;
  let aggregate: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn().mockResolvedValue([]);
    count = jest.fn().mockResolvedValue(0);
    groupBy = jest.fn().mockResolvedValue([]);
    aggregate = jest.fn().mockResolvedValue({ _sum: { views: null, word_count: null } });

    const prismaMock = {
      universalContent: { findMany, count, groupBy, aggregate },
      category: { count: jest.fn().mockResolvedValue(0) },
      tag: { count: jest.fn().mockResolvedValue(0) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversalContentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SlugGeneratorService, useValue: { ensureUniqueSlug: jest.fn(), generateSlug: jest.fn() } },
      ],
    }).compile();

    service = module.get(UniversalContentService);
  });

  describe('searchContent sort handling', () => {
    it('maps the camelCase sort keys the admin console sends onto real columns', async () => {
      await service.searchContent({ sortBy: 'updatedAt', sortOrder: 'desc' });
      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { updated_at: 'desc' } }));
    });

    it('falls back to updated_at for an unknown sort key instead of passing it to Prisma', async () => {
      await service.searchContent({ sortBy: 'bogus; DROP TABLE', sortOrder: 'desc' });
      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { updated_at: 'desc' } }));
    });

    it('accepts snake_case keys unchanged and normalises the direction', async () => {
      await service.searchContent({ sortBy: 'published_at', sortOrder: 'ASC' as any });
      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { published_at: 'asc' } }));
    });

    it('clamps pagination to sane bounds', async () => {
      await service.searchContent({ page: 0, limit: 100000 });
      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 200 }));
    });

    it('excludes soft-deleted rows by default', async () => {
      await service.searchContent({});
      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ deleted_at: null }) }),
      );
    });
  });

  describe('getContentStats', () => {
    it('returns per-type and per-status counts for the sidebar badges', async () => {
      count.mockResolvedValue(3);
      groupBy.mockResolvedValue([
        { content_type: 'Article', _count: { _all: 2 } },
        { content_type: 'Poem', _count: { _all: 1 } },
      ]);

      const stats = await service.getContentStats();

      expect(stats.byType.Article).toBe(2);
      expect(stats.byType.Poem).toBe(1);
      // Types with no rows must still be present so the badge renders 0, not blank.
      expect(stats.byType.Research).toBe(0);
      expect(stats).toEqual(
        expect.objectContaining({
          total: expect.any(Number),
          published: expect.any(Number),
          drafts: expect.any(Number),
          scheduled: expect.any(Number),
          archived: expect.any(Number),
          trash: expect.any(Number),
          categoriesCount: expect.any(Number),
          tagsCount: expect.any(Number),
        }),
      );
    });
  });
});
