import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('navigation')
@Controller('navigation')
export class NavigationController {
  @Get('main')
  @ApiOperation({ summary: 'Get main global navigation tree (Backend-Driven)' })
  getMainNavigation() {
    return {
      items: [
        { label: 'Home', url: '/', icon: 'home' },
        {
          label: 'About',
          url: '/about',
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
          children: [
            { label: 'All Poems', url: '/poems' },
            { label: 'Collections', url: '/poems/collections' },
          ],
        },
        { label: 'Translations', url: '/translations' },
        { label: 'Projects', url: '/projects' },
        {
          label: 'Media',
          url: '/media',
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
          children: [
            { label: 'Legal Research', url: '/services/legal-research' },
            { label: 'Translation', url: '/services/translation' },
            { label: 'Accessibility Consulting', url: '/services/accessibility-consulting' },
            { label: 'Training', url: '/services/training' },
            { label: 'Speaking', url: '/services/speaking' },
          ],
        },
        { label: 'Testimonials', url: '/testimonials' },
        { label: 'FAQ', url: '/faq' },
        { label: 'Contact', url: '/contact' },
      ],
    };
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get backend-driven footer layout contract' })
  getFooterNavigation() {
    return {
      aboutText: 'Sandip Thapa - Enterprise CMS Platform for Law, Human Rights, Disability & Academic Research.',
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
            { label: 'Accessibility Statement (WCAG 2.1 AAA)', url: '/accessibility-statement' },
            { label: 'RSS Feed', url: '/rss.xml' },
            { label: 'Sitemap', url: '/sitemap.xml' },
          ],
        },
      ],
      socialMedia: [
        { platform: 'ORCID', url: 'https://orcid.org' },
        { platform: 'Google Scholar', url: 'https://scholar.google.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
        { platform: 'GitHub', url: 'https://github.com/sandipthapa123' },
      ],
      copyright: '© 2083 BS / 2026 AD Sandip Thapa. All rights reserved.',
    };
  }
}
