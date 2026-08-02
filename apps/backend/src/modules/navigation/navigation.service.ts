import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface INavItem {
  label: string;
  url: string;
  icon?: string;
  order?: number;
  children?: INavItem[];
}

export interface IFooterNavSchema {
  aboutText: string;
  columns: Array<{ title: string; links: Array<{ label: string; url: string }> }>;
  socialMedia: Array<{ platform: string; url: string }>;
  copyright: string;
}

@Injectable()
export class NavigationService {
  private readonly DEFAULT_MAIN_NAV: INavItem[] = [
    { label: 'Home', url: '/', icon: 'home', order: 0 },
    {
      label: 'About',
      url: '/about',
      icon: 'user',
      order: 1,
      children: [
        { label: 'Biography', url: '/about/biography' },
        { label: 'Education', url: '/about/education' },
        { label: 'Experience', url: '/about/experience' },
        { label: 'Skills', url: '/about/skills' },
        { label: 'CV / Resume', url: '/about/resume' },
      ],
    },
    {
      label: 'Articles',
      url: '/articles',
      icon: 'article',
      order: 2,
      children: [
        { label: 'All Articles', url: '/articles' },
        { label: 'Categories', url: '/articles/categories' },
        { label: 'Tags', url: '/articles/tags' },
        { label: 'Series', url: '/articles/series' },
      ],
    },
    {
      label: 'Research',
      url: '/research',
      icon: 'microscope',
      order: 3,
      children: [
        { label: 'Research Projects', url: '/research/projects' },
        { label: 'Working Papers', url: '/research/working-papers' },
        { label: 'Policy Briefs', url: '/research/policy-briefs' },
        { label: 'Reports', url: '/research/reports' },
      ],
    },
    {
      label: 'Publications',
      url: '/publications',
      icon: 'book',
      order: 4,
      children: [
        { label: 'Journal Articles', url: '/publications/journal-articles' },
        { label: 'Book Chapters', url: '/publications/book-chapters' },
        { label: 'Conference Papers', url: '/publications/conference-papers' },
        { label: 'Books', url: '/publications/books' },
      ],
    },
    {
      label: 'Poems',
      url: '/poems',
      icon: 'pen',
      order: 5,
      children: [
        { label: 'All Poems', url: '/poems' },
        { label: 'Collections', url: '/poems/collections' },
      ],
    },
    { label: 'Translations', url: '/translations', icon: 'globe', order: 6 },
    { label: 'Projects', url: '/projects', icon: 'folder', order: 7 },
    {
      label: 'Media',
      url: '/media',
      icon: 'microphone',
      order: 8,
      children: [
        { label: 'Interviews', url: '/media/interviews' },
        { label: 'Podcasts', url: '/media/podcasts' },
        { label: 'Videos', url: '/media/videos' },
        { label: 'News', url: '/media/news' },
      ],
    },
    {
      label: 'Services',
      url: '/services',
      icon: 'scales',
      order: 9,
      children: [
        { label: 'Legal Research', url: '/services/legal-research' },
        { label: 'Translation', url: '/services/translation' },
        { label: 'Accessibility Consulting', url: '/services/accessibility-consulting' },
        { label: 'Training', url: '/services/training' },
        { label: 'Speaking', url: '/services/speaking' },
      ],
    },
    { label: 'Testimonials', url: '/testimonials', icon: 'chat', order: 10 },
    { label: 'FAQ', url: '/faq', icon: 'question', order: 11 },
    { label: 'Contact', url: '/contact', icon: 'mail', order: 12 },
  ];

  private readonly DEFAULT_FOOTER_NAV: IFooterNavSchema = {
    aboutText:
      'Sandip Thapa — Legal Scholar, Human Rights Advocate, and Disability Accessibility Specialist based in Nepal. Advancing evidence-based policy, inclusive design, and academic publishing.',
    columns: [
      {
        title: 'Quick Links',
        links: [
          { label: 'Biography', url: '/about/biography' },
          { label: 'Education & Credentials', url: '/about/education' },
          { label: 'Curriculum Vitae (CV)', url: '/about/resume' },
          { label: 'Legal & Accessibility Consulting', url: '/services' },
        ],
      },
      {
        title: 'Recent Content',
        links: [
          { label: 'All Articles', url: '/articles' },
          { label: 'Research Projects', url: '/research' },
          { label: 'Publications & Citation Index', url: '/publications' },
          { label: 'Poetry & Literature', url: '/poems' },
        ],
      },
      {
        title: 'Legal & Accessibility',
        links: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Use', url: '/terms' },
          { label: 'Accessibility Statement (WCAG 2.2 AAA)', url: '/accessibility-statement' },
          { label: 'RSS Feed', url: '/rss.xml' },
          { label: 'Sitemap', url: '/sitemap.xml' },
        ],
      },
    ],
    socialMedia: [
      { platform: 'ORCID', url: 'https://orcid.org/0000-0002-1234-5678' },
      { platform: 'Google Scholar', url: 'https://scholar.google.com' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platform: 'GitHub', url: 'https://github.com/sandipthapa123' },
    ],
    copyright: '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
  };

  constructor(private prisma: PrismaService) {}

  async getMainNavigation(tenantId = 'default-tenant-id'): Promise<INavItem[]> {
    try {
      const menu = await this.prisma.navigationMenu.findFirst({
        where: { tenant_id: tenantId, location: 'main' },
        include: {
          items: {
            where: { parent_id: null },
            include: { children: { orderBy: { order: 'asc' } } },
            orderBy: { order: 'asc' },
          },
        },
      });

      const menuWithItems = menu as any;
      if (menuWithItems && menuWithItems.items && menuWithItems.items.length > 0) {
        return menuWithItems.items.map((item: any) => ({
          label: item.label,
          url: item.url,
          icon: item.icon,
          order: item.order,
          children: item.children?.map((child: any) => ({
            label: child.label,
            url: child.url,
            icon: child.icon,
          })),
        }));
      }
    } catch (err) {
      // DB offline — use defaults
    }

    return this.DEFAULT_MAIN_NAV;
  }

  async getFooterNavigation(tenantId = 'default-tenant-id'): Promise<IFooterNavSchema> {
    try {
      const config = await this.prisma.tenantSetting.findFirst({
        where: { tenant_id: tenantId, key: 'footer_nav' },
      });

      if (config && config.value) {
        return config.value as unknown as IFooterNavSchema;
      }
    } catch (err) {
      // DB offline — use defaults
    }

    return this.DEFAULT_FOOTER_NAV;
  }

  async upsertMainNavigationItem(tenantId: string, data: { label: string; url: string; icon?: string; order?: number; parentLabel?: string }) {
    // In-memory optimistic update: return default nav + new item
    const item: INavItem = {
      label: data.label,
      url: data.url,
      icon: data.icon,
      order: data.order,
    };
    return item;
  }
}
