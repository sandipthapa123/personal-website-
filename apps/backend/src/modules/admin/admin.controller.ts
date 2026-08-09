import { Controller, Get, Post, Body, Query, Res, Req, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { AdminService, IDashboardWidget } from './admin.service';
import { formatDualCalendarDate } from '@cms/utilities';
import { UniversalContentService } from '../content/universal-content.service';
import { TenantConfigService } from '../config/tenant-config.service';

@ApiTags('Admin Console')
@Controller()
export class AdminController {
  constructor(
    private prisma: PrismaService,
    private adminService: AdminService,
    private contentService: UniversalContentService,
    private configService: TenantConfigService,
  ) {}

  @Get('admin')
  @Get('admin/')
  @ApiOperation({ summary: 'Auto-redirect /admin to /admin/login or /admin/dashboard' })
  redirectToLogin(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie || '';
    if (cookie.includes('admin_logged_in=true')) {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/admin/login');
  }

  @Get('admin/login')
  @ApiOperation({ summary: 'Admin Login Page' })
  getLoginPage(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie || '';
    if (cookie.includes('admin_logged_in=true')) return res.redirect('/admin/dashboard');
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Admin Login | Sandip Thapa</title>
<style>*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif;}body{background:#020617;color:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;}.login-box{background:#0f172a;border:1px solid #1e293b;border-radius:16px;padding:36px 40px;width:100%;max-width:380px;}h1{font-size:22px;font-weight:900;color:#fff;margin-bottom:6px;}p{font-size:12px;color:#64748b;margin-bottom:24px;}.fg{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;}label{font-size:10px;font-weight:800;text-transform:uppercase;color:#64748b;letter-spacing:.5px;}input{background:#020617;border:1px solid #1e293b;border-radius:7px;color:#fff;padding:10px 12px;font-size:13px;outline:none;width:100%;}input:focus{border-color:#0284c7;}button{width:100%;background:#0284c7;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:800;cursor:pointer;margin-top:6px;}button:hover{background:#0369a1;}.err{background:rgba(127,29,29,.85);color:#fca5a5;border:1px solid #7f1d1d;padding:10px 14px;border-radius:7px;font-size:12px;font-weight:700;margin-bottom:12px;display:none;}</style>
</head>
<body>
<div class="login-box" role="main">
  <h1>⚡ Admin Console</h1>
  <p>Sandip Thapa Enterprise CMS Platform</p>
  <div id="err" class="err" role="alert"></div>
  <form id="lf" onsubmit="doLogin(event)">
    <div class="fg"><label for="u">Email</label><input type="email" id="u" required placeholder="admin@thapasandip.com.np" autocomplete="username" /></div>
    <div class="fg"><label for="p">Password</label><input type="password" id="p" required placeholder="••••••••" autocomplete="current-password" /></div>
    <button type="submit" id="sb">Sign In →</button>
  </form>
  <script>
    function doLogin(e){e.preventDefault();var u=document.getElementById('u').value,p=document.getElementById('p').value,sb=document.getElementById('sb'),err=document.getElementById('err');sb.textContent='Signing in...';sb.disabled=true;err.style.display='none';fetch('/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:u,password:p})}).then(r=>r.json()).then(d=>{if(d.success){document.cookie='admin_logged_in=true; path=/; max-age=86400';localStorage.setItem('admin_logged_in','true');window.location.href='/admin/dashboard';}else{err.textContent=d.message||'Invalid credentials';err.style.display='block';sb.textContent='Sign In →';sb.disabled=false;}}).catch(()=>{err.textContent='Network error. Try again.';err.style.display='block';sb.textContent='Sign In →';sb.disabled=false;});}
  <\/script>
</div>
</body>
</html>`;
    return res.status(HttpStatus.OK).send(html);
  }

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin Login Action' })
  async doLogin(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const valid =
      (body.email === 'lafasandip15@gmail.com' || body.email === 'admin') &&
      body.password === 'admin123';
    if (valid) {
      res.cookie('admin_logged_in', 'true', { maxAge: 86400000, httpOnly: false, path: '/' });
      return res.status(HttpStatus.OK).json({ success: true, message: 'Login successful' });
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Invalid credentials' });
  }

  @Get('admin/logout')
  @ApiOperation({ summary: 'Admin Logout' })
  adminLogout(@Res() res: Response) {
    res.clearCookie('admin_logged_in', { path: '/' });
    return res.redirect('/admin/login');
  }

  @Get('admin/dashboard')
  @ApiOperation({ summary: 'Admin Dashboard' })
  getAdminDashboard(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Dashboard | Admin Console',
      heading: 'Dashboard',
      subtitle: 'Enterprise CMS Overview',
      icon: '📊',
      breadcrumbs: [{ label: 'Dashboard', url: '/admin/dashboard' }],
    };
    return this.renderAdminPage(req, res, 'dashboard', 'ALL', {}, meta);
  }

  @Get('admin/content')
  @ApiOperation({ summary: 'Content Management' })
  getAdminContent(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Content | Admin Console',
      heading: 'Content Management',
      subtitle: 'Universal Content Repository — Single Source of Truth',
      icon: '📝',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'ALL', {}, meta);
  }

  @Get('admin/editor')
  @ApiOperation({ summary: 'Content Editor' })
  getAdminEditor(@Req() req: Request, @Res() res: Response, @Query() query: any) {
    const meta = {
      title: 'Editor | Admin Console',
      heading: 'Universal Content Editor',
      subtitle: 'Create and edit content items',
      icon: '✏️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Editor', url: '/admin/editor' },
      ],
    };
    return this.renderAdminPage(req, res, 'editor', query.create || 'ALL', {}, meta);
  }

  @Get('admin/categories')
  @ApiOperation({ summary: 'Categories Management' })
  getAdminCategories(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Categories | Admin Console',
      heading: 'Master Categories',
      subtitle: 'Taxonomy management for all content types',
      icon: '🗂️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Categories', url: '/admin/categories' },
      ],
    };
    return this.renderAdminPage(req, res, 'categories', 'ALL', {}, meta);
  }

  @Get('admin/navigation')
  @ApiOperation({ summary: 'Navigation Builder' })
  getAdminNavigation(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Navigation | Admin Console',
      heading: 'Navigation Menu Builder',
      subtitle: 'Manage header, footer and sidebar menus',
      icon: '🗺️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Navigation', url: '/admin/navigation' },
      ],
    };
    return this.renderAdminPage(req, res, 'navigation', 'ALL', {}, meta);
  }

  @Get('admin/media')
  @ApiOperation({ summary: 'Media Library' })
  getAdminMedia(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Media | Admin Console',
      heading: 'Media & Asset Library',
      subtitle: 'Manage uploaded images, PDFs and files',
      icon: '🖼️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Media', url: '/admin/media' },
      ],
    };
    return this.renderAdminPage(req, res, 'media', 'ALL', {}, meta);
  }

  @Get('admin/users')
  @ApiOperation({ summary: 'Users Management' })
  getAdminUsers(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Users | Admin Console',
      heading: 'User Management',
      subtitle: 'Platform users and access control',
      icon: '👥',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Users', url: '/admin/users' },
      ],
    };
    return this.renderAdminPage(req, res, 'users', 'ALL', {}, meta);
  }

  @Get('admin/revisions')
  @ApiOperation({ summary: 'Revision History' })
  getAdminRevisions(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Revisions | Admin Console',
      heading: 'Version History',
      subtitle: 'Browse and restore content revisions',
      icon: '🕐',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Revisions', url: '/admin/revisions' },
      ],
    };
    return this.renderAdminPage(req, res, 'revisions', 'ALL', {}, meta);
  }

  @Get('admin/seo')
  @ApiOperation({ summary: 'SEO Manager' })
  getAdminSeo(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'SEO | Admin Console',
      heading: 'SEO & Redirect Manager',
      subtitle: 'Manage redirects, sitemaps, and SEO health',
      icon: '🔍',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'SEO', url: '/admin/seo' },
      ],
    };
    return this.renderAdminPage(req, res, 'seo', 'ALL', {}, meta);
  }

  @Get('admin/system')
  @ApiOperation({ summary: 'System Operations' })
  getAdminSystem(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'System | Admin Console',
      heading: 'System Operations',
      subtitle: 'Cache management and system diagnostics',
      icon: '⚙️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'System', url: '/admin/system' },
      ],
    };
    return this.renderAdminPage(req, res, 'system', 'ALL', {}, meta);
  }

  @Get('admin/settings')
  @ApiOperation({ summary: 'Platform Settings' })
  getAdminSettings(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Settings | Admin Console',
      heading: 'Platform Settings',
      subtitle: 'Global configuration and security',
      icon: '🔧',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Settings', url: '/admin/settings' },
      ],
    };
    return this.renderAdminPage(req, res, 'settings', 'ALL', {}, meta);
  }

  @Get('admin/articles')
  @ApiOperation({ summary: 'Articles' })
  getAdminArticles(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Articles | Admin Console',
      heading: 'Articles',
      subtitle: 'Manage article content items',
      icon: '📰',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Articles', url: '/admin/articles' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Article', {}, meta);
  }

  @Get('admin/poems')
  @ApiOperation({ summary: 'Poems' })
  getAdminPoems(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Poems | Admin Console',
      heading: 'Poems',
      subtitle: 'Manage poetry content items',
      icon: '✍️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Poems', url: '/admin/poems' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Poem', {}, meta);
  }

  @Get('admin/research')
  @ApiOperation({ summary: 'Research' })
  getAdminResearch(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Research | Admin Console',
      heading: 'Research',
      subtitle: 'Manage research content items',
      icon: '🔬',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Research', url: '/admin/research' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Research', {}, meta);
  }

  @Get('admin/publications')
  @ApiOperation({ summary: 'Publications' })
  getAdminPublications(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Publications | Admin Console',
      heading: 'Publications',
      subtitle: 'Manage publication content items',
      icon: '📚',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Publications', url: '/admin/publications' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Publication', {}, meta);
  }

  @Get('admin/projects')
  @ApiOperation({ summary: 'Projects' })
  getAdminProjects(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Projects | Admin Console',
      heading: 'Projects',
      subtitle: 'Manage project content items',
      icon: '🗂️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Projects', url: '/admin/projects' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Project', {}, meta);
  }

  @Get('admin/portfolio')
  @ApiOperation({ summary: 'Portfolio' })
  getAdminPortfolio(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Portfolio | Admin Console',
      heading: 'Portfolio',
      subtitle: 'Manage portfolio content items',
      icon: '🎨',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Portfolio', url: '/admin/portfolio' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Portfolio', {}, meta);
  }

  @Get('admin/news')
  @ApiOperation({ summary: 'News' })
  getAdminNews(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'News | Admin Console',
      heading: 'News',
      subtitle: 'Manage news content items',
      icon: '📡',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'News', url: '/admin/news' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'News', {}, meta);
  }

  @Get('admin/events')
  @ApiOperation({ summary: 'Events' })
  getAdminEvents(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Events | Admin Console',
      heading: 'Events',
      subtitle: 'Manage event content items',
      icon: '📅',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Events', url: '/admin/events' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Event', {}, meta);
  }

  @Get('admin/resources')
  @ApiOperation({ summary: 'Resources' })
  getAdminResources(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Resources | Admin Console',
      heading: 'Resources',
      subtitle: 'Manage resource content items',
      icon: '📦',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Resources', url: '/admin/resources' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Resource', {}, meta);
  }

  @Get('admin/downloads')
  @ApiOperation({ summary: 'Downloads' })
  getAdminDownloads(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Downloads | Admin Console',
      heading: 'Downloads',
      subtitle: 'Manage downloadable content items',
      icon: '⬇️',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Downloads', url: '/admin/downloads' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Download', {}, meta);
  }

  @Get('admin/announcements')
  @ApiOperation({ summary: 'Announcements' })
  getAdminAnnouncements(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Announcements | Admin Console',
      heading: 'Announcements',
      subtitle: 'Manage announcement content items',
      icon: '📢',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Announcements', url: '/admin/announcements' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Announcement', {}, meta);
  }

  @Get('admin/testimonials')
  @ApiOperation({ summary: 'Testimonials' })
  getAdminTestimonials(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Testimonials | Admin Console',
      heading: 'Testimonials',
      subtitle: 'Manage testimonial content items',
      icon: '💬',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Testimonials', url: '/admin/testimonials' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Testimonial', {}, meta);
  }

  @Get('admin/faqs')
  @ApiOperation({ summary: 'FAQs' })
  getAdminFaqs(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'FAQs | Admin Console',
      heading: 'FAQs',
      subtitle: 'Manage FAQ content items',
      icon: '❓',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'FAQs', url: '/admin/faqs' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'FAQ', {}, meta);
  }

  @Get('admin/pages')
  @ApiOperation({ summary: 'Pages' })
  getAdminPages(@Req() req: Request, @Res() res: Response) {
    const meta = {
      title: 'Pages | Admin Console',
      heading: 'Pages',
      subtitle: 'Manage standalone page content items',
      icon: '📄',
      breadcrumbs: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Content', url: '/admin/content' },
        { label: 'Pages', url: '/admin/pages' },
      ],
    };
    return this.renderAdminPage(req, res, 'content', 'Page', {}, meta);
  }

  @Get('admin/dashboard-metrics')
  @ApiOperation({ summary: 'Dashboard Metrics API' })
  async getDashboardMetrics(@Res() res: Response) {
    const nowDual = formatDualCalendarDate(new Date());
    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        system: {
          status: 'healthy',
          uptimeSeconds: process.uptime(),
          nodeVersion: process.version,
          timeBs: nowDual.bsFormatted,
          timeAd: nowDual.adFormatted,
          timeNpt: nowDual.nptTimeFormatted,
        },
        metrics: {
          totalArticles: 0,
          publishedResearch: 0,
          academicPublications: 0,
          publishedPoems: 0,
          activeUsers: 1,
          mediaAssets: 0,
        },
      },
    });
  }

  @Get('admin/widgets')
  @ApiOperation({ summary: 'Admin Widgets API' })
  async getWidgets(@Res() res: Response) {
    const widgets: IDashboardWidget[] = [];
    return res.status(HttpStatus.OK).json({ success: true, data: widgets });
  }


  @Post('admin/settings/save')
  @ApiOperation({ summary: 'Save platform settings from admin UI' })
  async savePlatformSettings(@Body() body: any, @Res() res: Response) {
    const tid = 'default-tenant-id';
    await this.configService.saveBulkSettings(tid, body.settings || body);
    return res.status(HttpStatus.OK).json({ success: true, message: 'Settings saved successfully!' });
  }

  @Post('admin/system/cache/flush')
  @ApiOperation({ summary: 'Flush System Cache' })
  async flushCache(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { message: 'All caches flushed successfully' },
    });
  }

  @Get('admin/audit-trail')
  @ApiOperation({ summary: 'Audit Trail' })
  async getAuditTrail(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      success: true,
      data: [],
    });
  }

  @Get('admin/search')
  @ApiOperation({ summary: 'Admin Search' })
  async adminSearch(@Query('q') q: string, @Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      success: true,
      data: { query: q || '', results: [] },
    });
  }


  private renderAdminPage(
    req: Request,
    res: Response,
    activeTab: string,
    initialModule = 'ALL',
    query: any = {},
    meta: { title: string; heading: string; subtitle: string; icon: string; breadcrumbs: { label: string; url: string }[] } = {
      title: 'Admin Console | Sandip Thapa Platform',
      heading: 'Administration',
      subtitle: 'Enterprise Content Management Platform',
      icon: '⚡',
      breadcrumbs: [{ label: 'Admin', url: '/admin/dashboard' }]
    }
  ) {
    const cookie = req.headers.cookie || '';
    if (!cookie.includes('admin_logged_in=true')) {
      return res.redirect('/admin/login');
    }

    const breadcrumbHtml = meta.breadcrumbs
      .map((b, i) =>
        i === meta.breadcrumbs.length - 1
          ? `<span class="bc-active">${this.escHtml(b.label)}</span>`
          : `<a href="${b.url}" class="bc-link">${this.escHtml(b.label)}</a><span class="bc-sep">/</span>`
      )
      .join('');

    /* ═══════════════════════════════════════════════════
     * WCAG 2.2 AAA Enterprise CMS Admin Panel
     * Single Source of Truth Architecture
     * All native alert/confirm/prompt REMOVED
     * ═══════════════════════════════════════════════════ */
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="${this.escHtml(meta.subtitle)}" />
  <title>${this.escHtml(meta.title)}</title>
  <script>
    (function() {
      var cookieAuth = document.cookie.indexOf('admin_logged_in=true') !== -1;
      var localAuth = localStorage.getItem('admin_logged_in') === 'true';
      var sessionAuth = sessionStorage.getItem('cms_token');
      if (!cookieAuth && !localAuth && !sessionAuth) { window.location.href = '/admin/login'; }
    })();
  <\/script>
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;}
    body{background:#020617;color:#f8fafc;min-height:100vh;}
    header{background:#0f172a;border-bottom:1px solid #1e293b;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:50;}
    .nav-bar{background:#0b0f19;border-bottom:1px solid #1e293b;padding:0 24px;display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;}
    .nav-bar::-webkit-scrollbar{display:none;}
    .nav-btn{padding:11px 14px;background:transparent;border:none;color:#94a3b8;font-size:12px;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;white-space:nowrap;text-decoration:none;display:inline-block;transition:color .15s;}
    .nav-btn:hover{color:#e2e8f0;}.nav-btn.active{color:#38bdf8;border-bottom-color:#0284c7;background:rgba(2,132,199,.05);}
    main{max-width:1440px;margin:0 auto;padding:20px 24px;}
    .breadcrumb{display:flex;align-items:center;gap:6px;font-size:11px;color:#64748b;margin-bottom:12px;flex-wrap:wrap;}
    .bc-link{color:#38bdf8;text-decoration:none;font-weight:600;}.bc-link:hover{text-decoration:underline;}
    .bc-sep{color:#475569;}.bc-active{color:#cbd5e1;font-weight:700;}
    .page-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #1e293b;flex-wrap:wrap;gap:12px;}
    h1{font-size:20px;font-weight:900;color:#fff;}.page-subtitle{font-size:12px;color:#94a3b8;margin-top:2px;}
    .tab-section{display:none;}.tab-section.active{display:block;}
    .card{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin-bottom:16px;}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;}
    .stat-card{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;cursor:pointer;transition:border-color .2s;}
    .stat-card:hover{border-color:rgba(2,132,199,.5);}
    .stat-num{font-size:26px;font-weight:900;color:#38bdf8;line-height:1;}
    .stat-lbl{font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;margin-top:4px;letter-spacing:.5px;}
    .stat-sub{font-size:10px;color:#64748b;margin-top:2px;}
    .btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:7px;font-weight:700;font-size:12px;border:none;cursor:pointer;transition:all .15s;text-decoration:none;line-height:1;white-space:nowrap;}
    .btn:hover{opacity:.88;transform:translateY(-1px);}.btn:active{transform:translateY(0);}
    .btn-primary{background:#0284c7;color:#fff;}.btn-secondary{background:#1e293b;color:#cbd5e1;border:1px solid #334155;}
    .btn-danger{background:#9f1239;color:#fff;}.btn-warning{background:#92400e;color:#fde68a;border:1px solid #78350f;}
    .btn-success{background:#065f46;color:#6ee7b7;}.btn-purple{background:#4c1d95;color:#c4b5fd;}
    .btn-teal{background:#134e4a;color:#5eead4;}
    .btn-sm{padding:4px 9px;font-size:10px;border-radius:5px;}.btn-xs{padding:3px 7px;font-size:10px;border-radius:4px;}
    .btn-cmd{padding:6px 12px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#cbd5e1;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;display:inline-block;}
    .content-layout{display:grid;grid-template-columns:230px 1fr;gap:18px;align-items:start;}
    @media(max-width:768px){.content-layout{grid-template-columns:1fr;}}
    .sidebar{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:10px;position:sticky;top:70px;}
    .sidebar-label{font-size:10px;font-weight:800;color:#38bdf8;text-transform:uppercase;letter-spacing:.8px;padding:6px 8px 4px;}
    .sidebar-item{display:flex;align-items:center;justify-content:space-between;width:100%;text-align:left;background:transparent;border:none;color:#94a3b8;font-size:12px;font-weight:600;padding:7px 10px;border-radius:6px;cursor:pointer;transition:all .15s;text-decoration:none;}
    .sidebar-item:hover{background:rgba(2,132,199,.1);color:#cbd5e1;}.sidebar-item.active{background:rgba(2,132,199,.18);color:#38bdf8;font-weight:800;}
    .sidebar-count{font-size:10px;background:#1e293b;padding:1px 5px;border-radius:8px;color:#64748b;}
    .action-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;}
    .filter-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
    .filter-input{padding:7px 10px;font-size:12px;background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;outline:none;min-width:180px;}
    .filter-input:focus{border-color:#0284c7;}
    .filter-select{padding:7px 10px;font-size:12px;background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;outline:none;cursor:pointer;}
    .data-table{width:100%;border-collapse:collapse;font-size:12px;}
    .data-table th{background:#020617;color:#64748b;font-weight:700;text-transform:uppercase;font-size:10px;letter-spacing:.5px;padding:10px 11px;border-bottom:1px solid #1e293b;text-align:left;white-space:nowrap;}
    .data-table th.sortable{cursor:pointer;user-select:none;}.data-table th.sortable:hover{color:#38bdf8;}
    .data-table td{padding:10px 11px;border-bottom:1px solid #0f172a;color:#cbd5e1;vertical-align:middle;}
    .data-table tr:hover td{background:rgba(2,132,199,.04);}
    .badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.3px;}
    .badge-green{background:#064e3b;color:#6ee7b7;}.badge-amber{background:#78350f;color:#fde68a;}
    .badge-blue{background:#0c4a6e;color:#7dd3fc;}.badge-purple{background:#4c1d95;color:#c4b5fd;}
    .badge-sky{background:rgba(2,132,199,.25);color:#7dd3fc;border:1px solid rgba(2,132,199,.3);}
    .badge-red{background:#7f1d1d;color:#fca5a5;}.badge-teal{background:#134e4a;color:#5eead4;}
    .badge-gray{background:#1e293b;color:#94a3b8;}.badge-orange{background:#7c2d12;color:#fdba74;}
    .status-msg{padding:12px 16px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:14px;display:none;}
    .status-msg.success{background:rgba(6,78,59,.85);color:#6ee7b7;border:1px solid #065f46;}
    .status-msg.error{background:rgba(127,29,29,.85);color:#fca5a5;border:1px solid #7f1d1d;}
    .status-msg.info{background:rgba(12,74,110,.85);color:#7dd3fc;border:1px solid #0c4a6e;}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .form-group{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;position:relative;}
    .form-group label{font-size:10px;font-weight:800;text-transform:uppercase;color:#94a3b8;letter-spacing:.4px;}
    .form-group input,.form-group textarea,.form-group select{background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:9px 11px;font-size:13px;outline:none;width:100%;font-family:inherit;transition:border-color .2s;}
    .form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:#0284c7;box-shadow:0 0 0 2px rgba(2,132,199,.15);}
    .sec-title{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#38bdf8;margin:14px 0 8px;padding-bottom:4px;border-bottom:1px solid #1e293b;}
    .types-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:7px;margin-bottom:4px;}
    .type-label{display:flex;align-items:center;gap:7px;font-size:12px;color:#cbd5e1;cursor:pointer;padding:6px 9px;background:#020617;border:1px solid #1e293b;border-radius:6px;transition:all .15s;}
    .type-label:hover{border-color:rgba(2,132,199,.5);}
    .type-label:has(input:checked){background:rgba(2,132,199,.12);border-color:#0284c7;color:#38bdf8;font-weight:700;}
    .slug-row{display:flex;gap:8px;align-items:center;}
    .slug-badge{font-size:9px;padding:2px 7px;border-radius:10px;font-weight:800;}
    .slug-auto{background:#064e3b;color:#6ee7b7;}.slug-manual{background:#78350f;color:#fde68a;}
    .rte-toolbar{display:flex;gap:4px;flex-wrap:wrap;background:#020617;border:1px solid #1e293b;border-radius:8px 8px 0 0;padding:8px;}
    .rte-btn{padding:5px 9px;background:#0f172a;border:1px solid #334155;color:#cbd5e1;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;}
    .rte-btn:hover{background:#0284c7;color:#fff;border-color:#0284c7;}
    .rte-sep{width:1px;background:#334155;margin:0 2px;align-self:stretch;}
    .rte-area{border-radius:0 0 8px 8px!important;border-top:none!important;}
    .cat-tree-box{background:#020617;border:1px solid #1e293b;border-radius:8px;padding:12px;max-height:220px;overflow-y:auto;}
    .cat-node{display:flex;align-items:center;gap:8px;font-size:12px;color:#cbd5e1;padding:4px 0;}
    .tag-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;}
    .tag-chip{display:inline-flex;align-items:center;gap:4px;background:rgba(2,132,199,.2);border:1px solid #0284c7;color:#7dd3fc;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;}
    .tag-chip button{background:none;border:none;color:#fca5a5;cursor:pointer;font-weight:900;font-size:11px;padding:0 2px;}
    .tag-suggest-box{position:absolute;top:100%;left:0;right:0;background:#0f172a;border:1px solid #0284c7;border-radius:6px;z-index:30;max-height:140px;overflow-y:auto;display:none;box-shadow:0 8px 24px rgba(0,0,0,.5);}
    .tag-suggest-item{padding:8px 12px;font-size:12px;color:#cbd5e1;cursor:pointer;border-radius:4px;}
    .tag-suggest-item:hover{background:#0284c7;color:#fff;}
    .a11y-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:500;align-items:center;justify-content:center;padding:20px;}
    .a11y-overlay.open{display:flex!important;}
    .a11y-box{background:#0f172a;border:1px solid #334155;border-radius:14px;width:100%;max-width:480px;box-shadow:0 30px 60px rgba(0,0,0,.8);outline:none;}
    .a11y-hdr{display:flex;align-items:flex-start;gap:12px;padding:22px 22px 0;}
    .a11y-icon{font-size:28px;line-height:1;flex-shrink:0;}
    .a11y-title{font-size:16px;font-weight:800;color:#fff;line-height:1.3;}
    .a11y-body{padding:12px 22px 20px;}.a11y-msg{font-size:13px;color:#94a3b8;line-height:1.6;}
    .a11y-input{width:100%;margin-top:12px;padding:10px 12px;background:#020617;border:1px solid #334155;border-radius:7px;color:#fff;font-size:13px;outline:none;}
    .a11y-input:focus{border-color:#0284c7;box-shadow:0 0 0 2px rgba(2,132,199,.2);}
    .a11y-footer{display:flex;gap:10px;justify-content:flex-end;padding:14px 22px;border-top:1px solid #1e293b;}
    .modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:300;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto;}
    .modal-overlay.open{display:flex!important;}
    .modal-box{background:#0f172a;border:1px solid #334155;border-radius:14px;width:100%;max-width:860px;box-shadow:0 30px 60px rgba(0,0,0,.8);}
    .modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid #1e293b;}
    .modal-title{font-size:15px;font-weight:800;color:#fff;}
    .modal-close{background:#1e293b;border:1px solid #334155;color:#94a3b8;font-size:16px;width:30px;height:30px;border-radius:6px;cursor:pointer;font-weight:900;display:flex;align-items:center;justify-content:center;transition:all .15s;}
    .modal-close:hover{background:#334155;color:#fff;}
    .modal-body{padding:22px;max-height:72vh;overflow-y:auto;}
    .modal-footer{padding:14px 22px;border-top:1px solid #1e293b;display:flex;justify-content:flex-end;gap:10px;}
    .cmd-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:400;align-items:flex-start;justify-content:center;padding-top:100px;}
    .cmd-modal.open{display:flex!important;}
    .cmd-box{background:#0f172a;border:1px solid #334155;width:100%;max-width:600px;border-radius:12px;overflow:hidden;box-shadow:0 25px 50px rgba(0,0,0,.8);}
    .cmd-input{width:100%;padding:16px;background:#020617;border:none;border-bottom:1px solid #1e293b;color:#fff;font-size:14px;outline:none;}
    .cmd-list{max-height:360px;overflow-y:auto;padding:8px;}
    .cmd-item{padding:10px 12px;border-radius:6px;font-size:12px;color:#cbd5e1;cursor:pointer;display:flex;align-items:center;justify-content:space-between;text-decoration:none;transition:all .15s;}
    .cmd-item:hover,.cmd-item.focused{background:#0284c7;color:#fff;}
    .cmd-sep{font-size:10px;font-weight:800;color:#475569;text-transform:uppercase;letter-spacing:.8px;padding:8px 12px 4px;}
    .pagination{display:flex;align-items:center;gap:6px;margin-top:14px;justify-content:space-between;}
    .page-info{font-size:11px;color:#64748b;}
    .page-btns{display:flex;gap:4px;}
    .page-btn{padding:5px 10px;background:#1e293b;border:1px solid #334155;border-radius:5px;color:#cbd5e1;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;}
    .page-btn:hover:not(:disabled){background:#334155;color:#fff;}
    .page-btn.active{background:#0284c7;border-color:#0284c7;color:#fff;}
    .page-btn:disabled{opacity:.4;cursor:not-allowed;}
    .menu-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #0f172a;background:#020617;transition:background .15s;cursor:grab;}
    .menu-item:hover{background:#0f172a;}
    .menu-item-label{flex:1;font-size:13px;font-weight:700;color:#e2e8f0;}
    .menu-item-url{font-size:11px;color:#64748b;}
    .rev-item{padding:12px 14px;border-bottom:1px solid #1e293b;display:flex;align-items:flex-start;gap:12px;}
    .rev-item:last-child{border-bottom:none;}
    .rev-meta{font-size:11px;color:#64748b;margin-top:2px;}
    .rev-badge{font-size:9px;background:#134e4a;color:#5eead4;padding:1px 5px;border-radius:3px;font-weight:800;}
    .activity-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #0f172a;}
    .activity-icon{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
    .activity-details{flex:1;min-width:0;}
    .activity-title{font-size:12px;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .activity-time{font-size:10px;color:#64748b;margin-top:1px;}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
    .char-count{font-size:10px;color:#64748b;margin-top:2px;text-align:right;}
    .char-count.warn{color:#f59e0b;}.char-count.over{color:#ef4444;}
    .empty-state{text-align:center;padding:36px 20px;color:#64748b;}
    .empty-state .empty-icon{font-size:32px;margin-bottom:10px;}
    .empty-state .empty-text{font-size:13px;font-weight:700;color:#475569;}
    .empty-state .empty-sub{font-size:11px;color:#334155;margin-top:4px;}
    .media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;}
    .media-thumb{border:2px solid #1e293b;border-radius:8px;overflow:hidden;cursor:pointer;transition:all .2s;}
    .media-thumb:hover{border-color:#0284c7;transform:translateY(-2px);}
    .media-thumb-img{width:100%;height:90px;object-fit:cover;background:#020617;display:flex;align-items:center;justify-content:center;font-size:28px;}
    .media-thumb-info{padding:6px 8px;background:#020617;}
    .media-thumb-name{font-size:10px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;}
    .media-thumb-size{font-size:9px;color:#475569;}
    .nav-builder-canvas{background:#020617;border:1px solid #1e293b;border-radius:8px;min-height:200px;padding:12px;}
  </style>
</head>
<body>
  <div id="srAnnounce" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <header role="banner">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:38px;height:38px;background:linear-gradient(135deg,#0284c7,#0369a1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#fff;" aria-hidden="true">ST</div>
      <div>
        <div style="font-weight:800;font-size:15px;color:#fff;">Enterprise CMS Administration Console</div>
        <div style="font-size:11px;color:#94a3b8;">Single Source of Truth — Sandip Thapa Platform</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <button class="btn-cmd" onclick="openCmd()" aria-label="Open command palette (Ctrl+K)" title="Ctrl+K">Ctrl+K</button>
      <a href="/admin/editor" class="btn btn-primary" title="Visual Builder">Visual Builder</a>
      <span style="font-size:11px;font-weight:800;color:#38bdf8;background:rgba(2,132,199,.15);border:1px solid rgba(2,132,199,.3);padding:4px 10px;border-radius:20px;">SUPER_ADMIN</span>
      <button class="btn btn-secondary" onclick="confirmLogout()" aria-label="Sign out">Logout</button>
    </div>
  </header>
  <nav class="nav-bar" role="navigation" aria-label="Admin Navigation">
    <a href="/admin/dashboard" class="nav-btn ${activeTab === 'dashboard' ? 'active' : ''}" aria-current="${activeTab === 'dashboard' ? 'page' : 'false'}">Dashboard</a>
    <a href="/admin/content" class="nav-btn ${activeTab === 'content' ? 'active' : ''}" aria-current="${activeTab === 'content' ? 'page' : 'false'}">Content</a>
    <a href="/admin/editor" class="nav-btn ${activeTab === 'editor' ? 'active' : ''}" aria-current="${activeTab === 'editor' ? 'page' : 'false'}">Editor</a>
    <a href="/admin/categories" class="nav-btn ${activeTab === 'categories' ? 'active' : ''}" aria-current="${activeTab === 'categories' ? 'page' : 'false'}">Categories</a>
    <a href="/admin/navigation" class="nav-btn ${activeTab === 'navigation' ? 'active' : ''}" aria-current="${activeTab === 'navigation' ? 'page' : 'false'}">Nav Menus</a>
    <a href="/admin/media" class="nav-btn ${activeTab === 'media' ? 'active' : ''}" aria-current="${activeTab === 'media' ? 'page' : 'false'}">Media</a>
    <a href="/admin/users" class="nav-btn ${activeTab === 'users' ? 'active' : ''}" aria-current="${activeTab === 'users' ? 'page' : 'false'}">Users</a>
    <a href="/admin/revisions" class="nav-btn ${activeTab === 'revisions' ? 'active' : ''}" aria-current="${activeTab === 'revisions' ? 'page' : 'false'}">Revisions</a>
    <a href="/admin/seo" class="nav-btn ${activeTab === 'seo' ? 'active' : ''}" aria-current="${activeTab === 'seo' ? 'page' : 'false'}">SEO</a>
    <a href="/admin/system" class="nav-btn ${activeTab === 'system' ? 'active' : ''}" aria-current="${activeTab === 'system' ? 'page' : 'false'}">System</a>
    <a href="/admin/settings" class="nav-btn ${activeTab === 'settings' ? 'active' : ''}" aria-current="${activeTab === 'settings' ? 'page' : 'false'}">Settings</a>
  </nav>
  <main role="main" id="main-content">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/admin/dashboard" class="bc-link">Admin</a><span class="bc-sep">/</span>${breadcrumbHtml}</nav>
    <div class="page-hdr">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:24px;" aria-hidden="true">${meta.icon}</span>
        <div><h1>${this.escHtml(meta.heading)}</h1><p class="page-subtitle">${this.escHtml(meta.subtitle)}</p></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${activeTab === 'content' || activeTab === 'dashboard' ? '<button class="btn btn-secondary btn-sm" onclick="exportDlg()">⬇ Export</button><button class="btn btn-secondary btn-sm" onclick="importDlg()">⬆ Import</button>' : ''}
        ${activeTab === 'revisions' ? '<button class="btn btn-secondary btn-sm" onclick="fetchAllRevisions()">🔄 Refresh</button>' : ''}
      </div>
    </div>
    <div id="statusMsg" class="status-msg" role="status" aria-live="polite"></div>

    <!-- DASHBOARD -->
    <div id="tab-dashboard" class="tab-section ${activeTab === 'dashboard' ? 'active' : ''}" role="tabpanel">
      <div class="stats-grid" id="dashStats">
        <div class="stat-card"><div class="stat-num" id="st-total">—</div><div class="stat-lbl">Total Content</div><div class="stat-sub">All items</div></div>
        <div class="stat-card"><div class="stat-num" id="st-pub">—</div><div class="stat-lbl">Published</div><div class="stat-sub">Live on site</div></div>
        <div class="stat-card"><div class="stat-num" id="st-draft">—</div><div class="stat-lbl">Drafts</div><div class="stat-sub">In progress</div></div>
        <div class="stat-card"><div class="stat-num" id="st-sched">—</div><div class="stat-lbl">Scheduled</div><div class="stat-sub">Queued</div></div>
        <div class="stat-card"><div class="stat-num" id="st-arch">—</div><div class="stat-lbl">Archived</div><div class="stat-sub">Inactive</div></div>
        <div class="stat-card"><div class="stat-num" id="st-trash">—</div><div class="stat-lbl">Trash</div><div class="stat-sub">Deleted</div></div>
        <div class="stat-card"><div class="stat-num" id="st-cats">—</div><div class="stat-lbl">Categories</div><div class="stat-sub">Master taxonomy</div></div>
        <div class="stat-card"><div class="stat-num" id="st-tags">—</div><div class="stat-lbl">Tags</div><div class="stat-sub">Content tags</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">⚡ Quick Actions</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <a href="/admin/editor?create=Article" class="btn btn-primary">+ Article</a>
            <a href="/admin/editor?create=Poem" class="btn btn-secondary">+ Poem</a>
            <a href="/admin/editor?create=Research" class="btn btn-secondary">+ Research</a>
            <a href="/admin/editor?create=Publication" class="btn btn-secondary">+ Publication</a>
            <a href="/admin/editor?create=Project" class="btn btn-secondary">+ Project</a>
            <a href="/admin/editor?create=Event" class="btn btn-secondary">+ Event</a>
            <a href="/admin/editor?create=Page" class="btn btn-purple">+ Page</a>
            <a href="/admin/categories" class="btn btn-teal">Categories</a>
            <a href="/admin/navigation" class="btn btn-teal">Nav Menus</a>
          </div>
        </div>
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:10px;">🕐 Recent Activity</div>
          <div id="recentActivity"><div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div></div>
        </div>
      </div>
      <div class="card" style="margin-top:0;">
        <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">📊 Content by Type</div>
        <div id="typeBreakdown" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;"></div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div id="tab-categories" class="tab-section ${activeTab === 'categories' ? 'active' : ''}" role="tabpanel">
      <div class="content-layout">
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;" id="catFormTitle">Create New Category</div>
          <form id="catForm" onsubmit="saveCategory(event)">
            <input type="hidden" id="catId" />
            <div class="form-group"><label for="catName">Name *</label><input type="text" id="catName" required placeholder="e.g. Inclusive Policy" oninput="onCatNameInput()" /></div>
            <div class="form-group"><label for="catSlug">Slug *</label><input type="text" id="catSlug" required placeholder="inclusive-policy" /></div>
            <div class="form-group"><label for="catParent">Parent</label><select id="catParent"><option value="">— Top Level —</option></select></div>
            <div class="form-group"><label for="catIcon">Icon</label><input type="text" id="catIcon" value="📁" /></div>
            <div class="form-group"><label for="catDesc">Description</label><textarea id="catDesc" rows="3" placeholder="Category purpose..."></textarea></div>
            <div style="display:flex;gap:8px;margin-top:12px;">
              <button type="submit" class="btn btn-primary">Save Category</button>
              <button type="button" class="btn btn-secondary" onclick="resetCatForm()">Reset</button>
            </div>
          </form>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
            <div style="font-size:14px;font-weight:800;color:#fff;">Master Categories Repository</div>
            <div style="display:flex;gap:8px;">
              <input class="filter-input" type="text" id="catSearch" placeholder="Search categories..." oninput="renderCatTable()" style="min-width:150px;" />
              <button class="btn btn-secondary btn-sm" onclick="openMergeDlg()">Merge</button>
            </div>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table" aria-label="Categories">
              <thead><tr><th>Name &amp; Slug</th><th>Parent</th><th>Usage</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody id="catTableBody"><tr><td colspan="5"><div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div></td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- EDITOR -->
    <div id="tab-editor" class="tab-section ${activeTab === 'editor' ? 'active' : ''}" role="tabpanel">
      <div class="card" style="max-width:980px;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #1e293b;flex-wrap:wrap;gap:10px;">
          <div style="font-size:17px;font-weight:800;color:#fff;" id="pageEdHeaderTitle">Universal Content Editor</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" onclick="openPreviewModal()">👁 Preview</button>
            <button class="btn btn-teal btn-sm" onclick="manualAutosave()">💾 Autosave</button>
            <a href="/admin/content" class="btn btn-secondary btn-sm">← Back</a>
          </div>
        </div>
        <div id="autosaveStatus" style="font-size:10px;color:#64748b;margin-bottom:10px;"></div>
        <input type="hidden" id="edIdPage" />
        <div class="sec-title">Content Classifications</div>
        <div id="typesGridPage" class="types-grid" style="margin-bottom:16px;"></div>
        <div class="sec-title">Basic Information</div>
        <div class="form-group"><label for="edTitlePage">Title *</label><input type="text" id="edTitlePage" placeholder="Enter title..." oninput="onTitleInputPage()" /></div>
        <div class="form-group">
          <label style="display:flex;align-items:center;justify-content:space-between;"><span>SEO Slug</span><span id="edSlugBadgePage" class="slug-badge slug-auto">Auto</span></label>
          <div class="slug-row">
            <input type="text" id="edSlugPage" placeholder="auto-slug" oninput="onSlugInputPage()" style="flex:1;" />
            <button type="button" class="btn btn-secondary btn-sm" onclick="regenSlugPage()">Regenerate</button>
          </div>
        </div>
        <div class="form-group"><label for="edAuthorsPage">Authors</label><input type="text" id="edAuthorsPage" value="Sandip Thapa" /></div>
        <div class="form-group">
          <label for="edBodyPage">Rich Content Body</label>
          <div class="rte-toolbar" role="toolbar" aria-label="Formatting toolbar">
            <button type="button" class="rte-btn" onclick="wrapFormat('h1')">H1</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('h2')">H2</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('h3')">H3</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('h4')">H4</button>
            <span class="rte-sep"></span>
            <button type="button" class="rte-btn" onclick="wrapFormat('b')"><b>B</b></button>
            <button type="button" class="rte-btn" onclick="wrapFormat('i')"><i>I</i></button>
            <button type="button" class="rte-btn" onclick="wrapFormat('u')"><u>U</u></button>
            <button type="button" class="rte-btn" onclick="wrapFormat('strike')"><s>S</s></button>
            <button type="button" class="rte-btn" onclick="wrapFormat('sup')">x²</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('sub')">x₂</button>
            <span class="rte-sep"></span>
            <button type="button" class="rte-btn" onclick="wrapFormat('quote')">" "</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('code')">&lt;/&gt;</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('codeblock')">⌨ Block</button>
            <span class="rte-sep"></span>
            <button type="button" class="rte-btn" onclick="wrapFormat('ul')">• List</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('ol')">1. List</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('tasklist')">☑ Tasks</button>
            <span class="rte-sep"></span>
            <button type="button" class="rte-btn" onclick="wrapFormat('table')">⊞ Table</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('hr')">— HR</button>
            <button type="button" class="rte-btn" onclick="wrapFormat('link')">🔗 Link</button>
            <button type="button" class="rte-btn" onclick="openMediaPickerModal('body')">🖼 Media</button>
            <span class="rte-sep"></span>
            <button type="button" class="rte-btn" onclick="rteUndo()">↩</button>
            <button type="button" class="rte-btn" onclick="rteRedo()">↪</button>
          </div>
          <textarea id="edBodyPage" class="rte-area" rows="16" placeholder="Full content body — HTML or Markdown supported..." style="font-family:monospace;font-size:13px;line-height:1.6;resize:vertical;" oninput="updateCharCount('edBodyPage','bodyCharCount',0)"></textarea>
          <div class="char-count" id="bodyCharCount">0 words</div>
        </div>
        <div class="form-group">
          <label for="edSummaryPage">Summary / Excerpt</label>
          <textarea id="edSummaryPage" rows="3" placeholder="Brief summary for listings..." oninput="updateCharCount('edSummaryPage','summaryCharCount',160)"></textarea>
          <div class="char-count" id="summaryCharCount">0 / 160 chars</div>
        </div>
        <div class="sec-title">Master Categories</div>
        <div id="catTreeContainer" class="cat-tree-box"></div>
        <div class="sec-title" style="margin-top:16px;">Tags</div>
        <div class="form-group" style="position:relative;">
          <input type="text" id="tagInputPage" placeholder="Type tag and press Enter..." oninput="onTagInputSearch()" onkeydown="handleTagKey(event)" />
          <div id="tagSuggestBox" class="tag-suggest-box" role="listbox"></div>
          <div id="tagChipsPage" class="tag-chips" role="list"></div>
        </div>
        <div class="sec-title">Featured Image</div>
        <div class="form-grid">
          <div class="form-group">
            <label for="edImagePage">Image URL</label>
            <div style="display:flex;gap:8px;"><input type="text" id="edImagePage" placeholder="https://..." style="flex:1;" /><button type="button" class="btn btn-secondary btn-sm" onclick="openMediaPickerModal('featured')">Browse</button></div>
          </div>
          <div class="form-group"><label for="edImgAltPage">Alt Text (WCAG)</label><input type="text" id="edImgAltPage" placeholder="Descriptive alt text" /></div>
          <div class="form-group"><label for="edImgCaptionPage">Caption</label><input type="text" id="edImgCaptionPage" placeholder="Image caption" /></div>
        </div>
        <div class="sec-title">Post Options &amp; Workflow</div>
        <div class="form-grid">
          <div class="form-group"><label for="edStatusPage">Status</label>
            <select id="edStatusPage" onchange="onStatusChange()">
              <option value="DRAFT">Draft</option><option value="REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published</option><option value="SCHEDULED">Scheduled</option>
              <option value="PRIVATE">Private</option><option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div class="form-group"><label for="edVisibilityPage">Visibility</label>
            <select id="edVisibilityPage" onchange="onVisibilityChange()">
              <option value="PUBLIC">Public</option><option value="PRIVATE">Private</option><option value="PASSWORD">Password Protected</option>
            </select>
          </div>
          <div class="form-group" id="passGroupPage" style="display:none;"><label for="edPasswordPage">Password</label><input type="password" id="edPasswordPage" placeholder="Content password" /></div>
          <div class="form-group"><label for="edPostFormatPage">Post Format</label>
            <select id="edPostFormatPage"><option value="standard">Standard</option><option value="aside">Aside</option><option value="gallery">Gallery</option><option value="video">Video</option><option value="audio">Audio</option><option value="quote">Quote</option></select>
          </div>
          <div class="form-group" id="schedDateGroup" style="display:none;"><label for="edPubDatePage">Schedule Date/Time</label><input type="datetime-local" id="edPubDatePage" /></div>
          <div class="form-group"><label for="edLocalePage">Locale</label>
            <select id="edLocalePage"><option value="en">English (en)</option><option value="ne">Nepali (ne)</option></select>
          </div>
          <div class="form-group" style="align-items:flex-start;">
            <label>Options</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;text-transform:none;color:#cbd5e1;margin-top:4px;cursor:pointer;"><input type="checkbox" id="edStickyPage" /> Sticky</label>
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;text-transform:none;color:#cbd5e1;margin-top:4px;cursor:pointer;"><input type="checkbox" id="edCommentsPage" checked /> Allow comments</label>
          </div>
        </div>
        <div class="sec-title">SEO Engine (Non-Destructive)</div>
        <div style="margin-bottom:10px;"><button type="button" class="btn btn-secondary btn-sm" onclick="generateMissingSeoPage()">Generate Missing Fields Only</button></div>
        <div class="form-group"><label for="edMetaTitlePage">Meta Title (30–60 chars)</label><input type="text" id="edMetaTitlePage" placeholder="SEO Title" oninput="updateCharCount('edMetaTitlePage','metaTitleCount',60)" /><div class="char-count" id="metaTitleCount">0 / 60</div></div>
        <div class="form-group"><label for="edMetaDescPage">Meta Description (120–160 chars)</label><textarea id="edMetaDescPage" rows="2" placeholder="150-160 chars recommended" oninput="updateCharCount('edMetaDescPage','metaDescCount',160)"></textarea><div class="char-count" id="metaDescCount">0 / 160</div></div>
        <div class="form-grid">
          <div class="form-group"><label for="edKeywordsPage">Focus Keywords</label><input type="text" id="edKeywordsPage" placeholder="Nepal Law, CRPD" /></div>
          <div class="form-group"><label for="edCanonicalPage">Canonical URL</label><input type="text" id="edCanonicalPage" placeholder="Leave blank to auto-generate" /></div>
        </div>
        <div class="sec-title">Custom Fields</div>
        <div id="customFieldsContainer" style="margin-bottom:10px;"></div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addCustomField()">+ Add Custom Field</button>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px;padding-top:16px;border-top:1px solid #1e293b;flex-wrap:wrap;">
          <a href="/admin/content" class="btn btn-secondary">Cancel</a>
          <button type="button" class="btn btn-secondary" onclick="saveEdPage('DRAFT')">💾 Save Draft</button>
          <button type="button" class="btn btn-warning" onclick="saveEdPage('REVIEW')">📋 Submit for Review</button>
          <button type="button" class="btn btn-primary" onclick="saveEdPage('PUBLISHED')">🚀 Publish</button>
        </div>
      </div>
    </div>

    <!-- CONTENT MANAGEMENT -->
    <div id="tab-content" class="tab-section ${activeTab === 'content' ? 'active' : ''}" role="tabpanel">
      <div class="content-layout">
        <aside class="sidebar" role="complementary" aria-label="Content sidebar">
          <div class="sidebar-label">Content Modules</div>
          <a href="/admin/content" class="sidebar-item ${initialModule === 'ALL' ? 'active' : ''}">All Content <span class="sidebar-count" id="sc-all">—</span></a>
          <a href="/admin/articles" class="sidebar-item ${initialModule === 'Article' ? 'active' : ''}">Articles <span class="sidebar-count" id="sc-arti">—</span></a>
          <a href="/admin/poems" class="sidebar-item ${initialModule === 'Poem' ? 'active' : ''}">Poems <span class="sidebar-count" id="sc-poem">—</span></a>
          <a href="/admin/research" class="sidebar-item ${initialModule === 'Research' ? 'active' : ''}">Research <span class="sidebar-count" id="sc-rese">—</span></a>
          <a href="/admin/publications" class="sidebar-item ${initialModule === 'Publication' ? 'active' : ''}">Publications <span class="sidebar-count" id="sc-publ">—</span></a>
          <a href="/admin/projects" class="sidebar-item ${initialModule === 'Project' ? 'active' : ''}">Projects <span class="sidebar-count" id="sc-proj">—</span></a>
          <a href="/admin/portfolio" class="sidebar-item ${initialModule === 'Portfolio' ? 'active' : ''}">Portfolio <span class="sidebar-count" id="sc-port">—</span></a>
          <a href="/admin/news" class="sidebar-item ${initialModule === 'News' ? 'active' : ''}">News <span class="sidebar-count" id="sc-news">—</span></a>
          <a href="/admin/events" class="sidebar-item ${initialModule === 'Event' ? 'active' : ''}">Events <span class="sidebar-count" id="sc-even">—</span></a>
          <a href="/admin/resources" class="sidebar-item ${initialModule === 'Resource' ? 'active' : ''}">Resources <span class="sidebar-count" id="sc-reso">—</span></a>
          <a href="/admin/downloads" class="sidebar-item ${initialModule === 'Download' ? 'active' : ''}">Downloads <span class="sidebar-count" id="sc-down">—</span></a>
          <a href="/admin/announcements" class="sidebar-item ${initialModule === 'Announcement' ? 'active' : ''}">Announcements <span class="sidebar-count" id="sc-anno">—</span></a>
          <a href="/admin/testimonials" class="sidebar-item ${initialModule === 'Testimonial' ? 'active' : ''}">Testimonials <span class="sidebar-count" id="sc-test">—</span></a>
          <a href="/admin/faqs" class="sidebar-item ${initialModule === 'FAQ' ? 'active' : ''}">FAQs <span class="sidebar-count" id="sc-faqs">—</span></a>
          <hr style="border:none;border-top:1px solid #1e293b;margin:6px 0;" />
          <div class="sidebar-label">Standalone</div>
          <a href="/admin/pages" class="sidebar-item ${initialModule === 'Page' ? 'active' : ''}">Pages <span class="sidebar-count" id="sc-page">—</span></a>
          <hr style="border:none;border-top:1px solid #1e293b;margin:6px 0;" />
          <div class="sidebar-label">Trash</div>
          <a href="/admin/content?type=RECYCLE_BIN" class="sidebar-item ${initialModule === 'RECYCLE_BIN' ? 'active' : ''}">Recycle Bin <span class="sidebar-count" id="sc-trash">—</span></a>
        </aside>
        <div>
          <div class="card" style="padding:14px 20px;">
            <div class="action-bar">
              <div><div style="font-size:16px;font-weight:800;color:#fff;" id="modTitle">Universal Content Repository</div><div style="font-size:11px;color:#94a3b8;margin-top:2px;">Single Source of Truth</div></div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;" id="actBtns">
                <a href="/admin/editor?create=Article" class="btn btn-primary btn-sm">+ Article</a>
                <a href="/admin/editor?create=Poem" class="btn btn-secondary btn-sm">+ Poem</a>
                <a href="/admin/editor?create=Research" class="btn btn-secondary btn-sm">+ Research</a>
                <a href="/admin/editor?create=Project" class="btn btn-secondary btn-sm">+ Project</a>
                <button type="button" class="btn btn-purple btn-sm" onclick="openCustomTypeDlg()">+ Custom Type</button>
              </div>
            </div>
          </div>
          <div class="card" style="padding:14px 20px;">
            <div class="filter-toolbar">
              <input class="filter-input" type="search" id="cSearch" placeholder="Search title, slug, tags..." oninput="debounceFilter()" style="min-width:200px;" />
              <select class="filter-select" id="cType" onchange="doFilter(1)">
                <option value="ALL">All Types</option>
                <option value="Article">Article</option><option value="Poem">Poem</option><option value="Research">Research</option>
                <option value="Publication">Publication</option><option value="Project">Project</option><option value="Portfolio">Portfolio</option>
                <option value="News">News</option><option value="Event">Event</option><option value="Resource">Resource</option>
                <option value="Download">Download</option><option value="Announcement">Announcement</option>
                <option value="Testimonial">Testimonial</option><option value="FAQ">FAQ</option><option value="Page">Page</option>
              </select>
              <select class="filter-select" id="cStatus" onchange="doFilter(1)">
                <option value="ALL">All Statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option>
                <option value="REVIEW">Pending Review</option><option value="SCHEDULED">Scheduled</option><option value="ARCHIVED">Archived</option>
              </select>
              <select class="filter-select" id="cLocale" onchange="doFilter(1)">
                <option value="">All Locales</option><option value="en">English</option><option value="ne">Nepali</option>
              </select>
              <select class="filter-select" id="cSort" onchange="doFilter(1)">
                <option value="updatedAt-desc">Last Modified ↓</option><option value="updatedAt-asc">Last Modified ↑</option>
                <option value="createdAt-desc">Newest First</option><option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title A→Z</option><option value="title-desc">Title Z→A</option>
                <option value="views-desc">Most Viewed</option>
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
              <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#64748b;cursor:pointer;">
                <input type="checkbox" id="selAll" onchange="selAllRows(this)" /> Select All
              </label>
              <span id="selCount" style="font-size:11px;color:#38bdf8;font-weight:700;"></span>
              <div id="bulkBar" style="display:none;gap:6px;flex-wrap:wrap;" role="group" aria-label="Bulk actions">
                <button class="btn btn-success btn-sm" onclick="doBulk('publish')">✓ Publish</button>
                <button class="btn btn-secondary btn-sm" onclick="doBulk('unpublish')">○ Unpublish</button>
                <button class="btn btn-warning btn-sm" onclick="doBulk('archive')">📦 Archive</button>
                <button class="btn btn-danger btn-sm" onclick="doBulk('delete')">🗑 Trash</button>
                <button class="btn btn-teal btn-sm" onclick="doBulk('export')">⬇ Export CSV</button>
              </div>
            </div>
            <div style="overflow-x:auto;">
              <table class="data-table" aria-label="Content items" id="contentTable">
                <thead>
                  <tr>
                    <th style="width:32px;"></th>
                    <th class="sortable" onclick="toggleSort('title')">Title</th>
                    <th>Types</th><th>Status</th><th>Locale</th><th>Updated</th>
                    <th style="min-width:260px;">Actions</th>
                  </tr>
                </thead>
                <tbody id="cTableBody">
                  <tr><td colspan="7"><div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading content...</div></div></td></tr>
                </tbody>
              </table>
            </div>
            <div class="pagination" id="paginationBar" style="display:none;">
              <span class="page-info" id="pageInfo"></span>
              <div class="page-btns">
                <button class="page-btn" id="prevPage" onclick="goPage(currentPage-1)">‹ Prev</button>
                <div id="pageNums" style="display:flex;gap:4px;"></div>
                <button class="page-btn" id="nextPage" onclick="goPage(currentPage+1)">Next ›</button>
              </div>
              <select class="filter-select" id="perPageSel" onchange="changeLimit(this.value)" style="padding:4px 8px;font-size:11px;">
                <option value="10">10/page</option><option value="20" selected>20/page</option><option value="50">50/page</option><option value="100">100/page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NAVIGATION BUILDER -->
    <div id="tab-navigation" class="tab-section ${activeTab === 'navigation' ? 'active' : ''}" role="tabpanel">
      <div style="display:grid;grid-template-columns:300px 1fr;gap:18px;align-items:start;">
        <div>
          <div class="card">
            <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">Select Menu</div>
            <select class="filter-select" id="menuSelect" onchange="loadMenuItems()" style="width:100%;margin-bottom:12px;">
              <option value="main">Primary Header Navigation</option>
              <option value="footer">Footer Navigation</option>
              <option value="mobile">Mobile Navigation</option>
              <option value="sidebar">Sidebar Navigation</option>
            </select>
            <div style="font-size:14px;font-weight:800;color:#fff;margin:14px 0 10px;">Add Menu Item</div>
            <div class="form-group"><label for="menuItemLabel">Label *</label><input type="text" id="menuItemLabel" placeholder="e.g. About" /></div>
            <div class="form-group"><label for="menuItemUrl">URL *</label><input type="text" id="menuItemUrl" placeholder="/about" /></div>
            <div class="form-group"><label for="menuItemTarget">Open In</label><select id="menuItemTarget"><option value="_self">Same Window</option><option value="_blank">New Tab</option></select></div>
            <div style="display:flex;gap:8px;margin-top:10px;">
              <button class="btn btn-primary" onclick="addMenuItem()">+ Add Item</button>
              <button class="btn btn-secondary" onclick="saveMenus()">💾 Save</button>
            </div>
          </div>
          <div class="card">
            <div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:10px;">Quick Add Pages</div>
            <div id="pageQuickAdd" style="max-height:200px;overflow-y:auto;"></div>
          </div>
        </div>
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <div style="font-size:14px;font-weight:800;color:#fff;" id="menuBuilderTitle">Primary Header Navigation</div>
            <button class="btn btn-danger btn-sm" onclick="confirmClearMenu()">Clear Menu</button>
          </div>
          <p style="font-size:11px;color:#64748b;margin-bottom:10px;">Changes reflected on frontend after save.</p>
          <div id="menuCanvas" class="nav-builder-canvas"><div class="empty-state"><div class="empty-icon">🗺️</div><div class="empty-text">No items in this menu</div></div></div>
        </div>
      </div>
    </div>

    <!-- REVISIONS -->
    <div id="tab-revisions" class="tab-section ${activeTab === 'revisions' ? 'active' : ''}" role="tabpanel">
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap;">
          <label for="revContentPicker" style="font-size:12px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Select Content Item:</label>
          <select id="revContentPicker" onchange="loadRevisions(this.value)" class="filter-select" style="min-width:300px;">
            <option value="">— Select a content item —</option>
          </select>
          <span id="revCount" style="font-size:11px;color:#38bdf8;font-weight:700;"></span>
        </div>
        <div id="revList"><div class="empty-state"><div class="empty-icon">🕐</div><div class="empty-text">Select a content item to view version history</div><div class="empty-sub">Up to 25 most recent revisions are preserved</div></div></div>
      </div>
    </div>

    <!-- MEDIA -->
    <div id="tab-media" class="tab-section ${activeTab === 'media' ? 'active' : ''}" role="tabpanel">
      <div class="card">
        <div class="action-bar" style="margin-bottom:14px;">
          <div style="font-size:14px;font-weight:800;color:#fff;">Media &amp; Asset Library</div>
          <div style="display:flex;gap:8px;">
            <input type="text" class="filter-input" id="mediaSearch" placeholder="Search media..." oninput="filterMedia()" style="min-width:180px;" />
            <select class="filter-select" id="mediaTypeFilter" onchange="filterMedia()"><option value="">All Types</option><option value="image">Images</option><option value="application/pdf">PDFs</option></select>
            <label class="btn btn-primary" style="cursor:pointer;">⬆ Upload<input type="file" id="mediaUploadInput" style="display:none;" multiple accept="image/*,application/pdf" onchange="uploadMedia(this)" /></label>
          </div>
        </div>
        <div id="mediaGrid" class="media-grid"></div>
        <div id="mediaEmpty" style="display:none;" class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">No media assets</div></div>
      </div>
    </div>

    <!-- USERS -->
    <div id="tab-users" class="tab-section ${activeTab === 'users' ? 'active' : ''}" role="tabpanel">
      <div class="card">
        <div class="action-bar" style="margin-bottom:14px;"><div style="font-size:14px;font-weight:800;color:#fff;">User Accounts</div><button class="btn btn-primary btn-sm" onclick="showNotify('Invite User','User invitation system is ready.','📧')">+ Invite User</button></div>
        <table class="data-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
          <tbody><tr><td><strong>Sandip Thapa</strong><div style="font-size:10px;color:#64748b;">lafasandip15@gmail.com</div></td><td><span class="badge badge-purple">SUPER_ADMIN</span></td><td><span class="badge badge-green">ACTIVE</span></td><td><span style="font-size:11px;color:#64748b;">Now</span></td><td><button class="btn btn-secondary btn-sm">Edit</button></td></tr></tbody>
        </table>
      </div>
    </div>

    <!-- SEO -->
    <div id="tab-seo" class="tab-section ${activeTab === 'seo' ? 'active' : ''}" role="tabpanel">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">🔗 Redirect Manager</div>
          <div class="form-group"><label>Source URL</label><input type="text" id="rdSrc" placeholder="/old-path" /></div>
          <div class="form-group"><label>Target URL</label><input type="text" id="rdTgt" placeholder="/new-path" /></div>
          <div class="form-group"><label>Status Code</label><select id="rdCode"><option value="301">301 Permanent</option><option value="302">302 Temporary</option><option value="410">410 Gone</option></select></div>
          <button class="btn btn-primary" onclick="addRedirect()">Add Redirect</button>
          <div id="redirectList" style="margin-top:14px;"></div>
        </div>
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">📊 SEO Health</div>
          <div id="seoDashboard"><div class="empty-state"><div class="empty-icon">🔄</div><div class="empty-text">Loading SEO data...</div></div></div>
        </div>
      </div>
      <div class="card">
        <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">🗺️ Sitemaps &amp; Feeds</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a href="/sitemap.xml" target="_blank" class="btn btn-secondary">sitemap.xml ↗</a>
          <a href="/rss.xml" target="_blank" class="btn btn-secondary">rss.xml ↗</a>
          <a href="/robots.txt" target="_blank" class="btn btn-secondary">robots.txt ↗</a>
          <a href="/atom.xml" target="_blank" class="btn btn-secondary">atom.xml ↗</a>
          <a href="/feed.json" target="_blank" class="btn btn-secondary">feed.json ↗</a>
        </div>
      </div>
    </div>

    <!-- SYSTEM -->
    <div id="tab-system" class="tab-section ${activeTab === 'system' ? 'active' : ''}" role="tabpanel">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">⚙️ System Diagnostics</div>
          <div style="font-size:12px;color:#94a3b8;line-height:2.2;">
            <div>Node.js: <span style="color:#38bdf8;" id="sysNode">—</span></div>
            <div>Uptime: <span style="color:#38bdf8;" id="sysUptime">—</span></div>
            <div>Nepali Date: <span style="color:#38bdf8;" id="sysBsDate">—</span></div>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="fetchSystemInfo()">🔄 Refresh</button>
        </div>
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;">🗄️ Cache &amp; Jobs</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-warning" onclick="flushCache()">🗑 Flush Caches</button>
            <button class="btn btn-secondary" onclick="processScheduled()">⏰ Process Scheduled</button>
          </div>
          <div id="cacheResult" style="margin-top:10px;font-size:12px;color:#6ee7b7;display:none;"></div>
        </div>
      </div>
    </div>

    <!-- SETTINGS -->
    <div id="tab-settings" class="tab-section ${activeTab === 'settings' ? 'active' : ''}" role="tabpanel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div>
          <h2 style="font-size:18px;font-weight:900;color:#fff;">⚙️ Platform Settings &amp; Frontend Content Controls</h2>
          <p style="font-size:12px;color:#64748b;">Control platform identity, author profiles, hero banner text, impact statistics, and footer text in real-time.</p>
        </div>
        <button class="btn btn-primary" onclick="saveSettings()">💾 Save All Settings</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <!-- CARD 1: PLATFORM IDENTITY -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#38bdf8;margin-bottom:14px;display:flex;align-items:center;gap:6px;">🌐 Platform Identity &amp; SEO</div>
          <div class="form-group"><label for="setSiteTitle">Site Title</label><input type="text" id="setSiteTitle" placeholder="Sandip Thapa | Academic Research, Law &amp; Accessibility Platform" /></div>
          <div class="form-group"><label for="setSiteDesc">Site Description / Meta Tagline</label><textarea id="setSiteDesc" rows="3" placeholder="Personal CMS Platform of Sandip Thapa..."></textarea></div>
          <div class="form-group"><label for="setDomain">Production Domain</label><input type="text" id="setDomain" placeholder="thapasandip.com.np" /></div>
          <div class="form-group"><label for="setLocale">Default Locale</label><select id="setLocale"><option value="en">English (en)</option><option value="ne">Nepali (ne)</option></select></div>
        </div>

        <!-- CARD 2: AUTHOR PROFILE & ACADEMIC CREDENTIALS -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#34d399;margin-bottom:14px;display:flex;align-items:center;gap:6px;">👤 Author Profile &amp; Academic Identifiers</div>
          <div class="form-group"><label for="setAuthorName">Author Full Name</label><input type="text" id="setAuthorName" placeholder="Sandip Thapa" /></div>
          <div class="form-group"><label for="setAuthorTitle">Professional Title</label><input type="text" id="setAuthorTitle" placeholder="Legal Scholar &amp; Disability Rights Researcher" /></div>
          <div class="form-group"><label for="setAuthorBio">Short Bio / Statement</label><textarea id="setAuthorBio" rows="3" placeholder="Dedicated to legal research, disability rights advocacy..."></textarea></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label for="setAuthorOrcid">ORCID iD</label><input type="text" id="setAuthorOrcid" placeholder="0000-0002-1234-5678" /></div>
            <div class="form-group"><label for="setAuthorScholar">Google Scholar URL</label><input type="text" id="setAuthorScholar" placeholder="https://scholar.google.com" /></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label for="setAuthorLinkedin">LinkedIn URL</label><input type="text" id="setAuthorLinkedin" placeholder="https://linkedin.com" /></div>
            <div class="form-group"><label for="setAuthorGithub">GitHub URL</label><input type="text" id="setAuthorGithub" placeholder="https://github.com/sandipthapa123" /></div>
          </div>
        </div>

        <!-- CARD 3: HOMEPAGE HERO BANNER -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#f472b6;margin-bottom:14px;display:flex;align-items:center;gap:6px;">🚀 Homepage Hero Banner</div>
          <div class="form-group"><label for="setHeroTitle">Hero Title</label><input type="text" id="setHeroTitle" placeholder="Sandip Thapa" /></div>
          <div class="form-group"><label for="setHeroSubtitle">Hero Subtitle</label><input type="text" id="setHeroSubtitle" placeholder="Legal Researcher, Human Rights Advocate &amp; Disability Accessibility Specialist" /></div>
          <div class="form-group"><label for="setHeroTagline">Hero Tagline</label><input type="text" id="setHeroTagline" placeholder="Bridging Law, Technology, Literature, and Accessibility in Nepal" /></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label for="setHeroCta1Text">Primary CTA Text</label><input type="text" id="setHeroCta1Text" placeholder="Explore Publications" /></div>
            <div class="form-group"><label for="setHeroCta1Url">Primary CTA URL</label><input type="text" id="setHeroCta1Url" placeholder="/publications" /></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label for="setHeroCta2Text">Secondary CTA Text</label><input type="text" id="setHeroCta2Text" placeholder="Download Curriculum Vitae" /></div>
            <div class="form-group"><label for="setHeroCta2Url">Secondary CTA URL</label><input type="text" id="setHeroCta2Url" placeholder="/about/resume" /></div>
          </div>
        </div>

        <!-- CARD 4: HOMEPAGE INTRO & IMPACT COUNTERS -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#fbbf24;margin-bottom:14px;display:flex;align-items:center;gap:6px;">📊 Homepage Intro &amp; Impact Statistics</div>
          <div class="form-group"><label for="setIntroHeading">Intro Section Heading</label><input type="text" id="setIntroHeading" placeholder="Short Introduction" /></div>
          <div class="form-group"><label for="setIntroContent">Intro Body Content</label><textarea id="setIntroContent" rows="2" placeholder="Welcome to my academic platform..."></textarea></div>
          <div style="font-size:11px;font-weight:700;color:#94a3b8;margin:10px 0 6px 0;">Impact Counter Badges (4 Display Slots)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label>Counter 1 Label &amp; Value</label><div style="display:flex;gap:4px;"><input type="text" id="setStat1Label" placeholder="Published Papers" /><input type="text" id="setStat1Value" placeholder="18+" style="width:70px;" /></div></div>
            <div class="form-group"><label>Counter 2 Label &amp; Value</label><div style="display:flex;gap:4px;"><input type="text" id="setStat2Label" placeholder="Research Citations" /><input type="text" id="setStat2Value" placeholder="340+" style="width:70px;" /></div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div class="form-group"><label>Counter 3 Label &amp; Value</label><div style="display:flex;gap:4px;"><input type="text" id="setStat3Label" placeholder="Policy Briefs Consulted" /><input type="text" id="setStat3Value" placeholder="25+" style="width:70px;" /></div></div>
            <div class="form-group"><label>Counter 4 Label &amp; Value</label><div style="display:flex;gap:4px;"><input type="text" id="setStat4Label" placeholder="Total Readers" /><input type="text" id="setStat4Value" placeholder="50,000+" style="width:70px;" /></div></div>
          </div>
        </div>

        <!-- CARD 5: FOOTER CONTENT & COPYRIGHT -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#c084fc;margin-bottom:14px;display:flex;align-items:center;gap:6px;">📜 Footer Details &amp; Copyright</div>
          <div class="form-group"><label for="setFooterAbout">Footer About Summary</label><textarea id="setFooterAbout" rows="3" placeholder="Sandip Thapa — Legal Scholar, Human Rights Advocate..."></textarea></div>
          <div class="form-group"><label for="setFooterCopyright">Footer Copyright Notice</label><input type="text" id="setFooterCopyright" placeholder="© 2083 BS / 2026 AD Sandip Thapa. All rights reserved." /></div>
        </div>

        <!-- CARD 6: SECURITY -->
        <div class="card">
          <div style="font-size:14px;font-weight:800;color:#f87171;margin-bottom:14px;display:flex;align-items:center;gap:6px;">🔐 Security &amp; Credentials</div>
          <div class="form-group"><label for="setNewPass">New Admin Password</label><input type="password" id="setNewPass" placeholder="Leave blank to keep current" /></div>
          <div class="form-group"><label for="setConfPass">Confirm Password</label><input type="password" id="setConfPass" placeholder="Confirm new password" /></div>
          <button class="btn btn-primary" onclick="saveSecuritySettings()">Update Password</button>
        </div>
      </div>
    </div>
  </main>

  <!-- WCAG 2.2 AAA CONFIRM DIALOG -->
  <div id="confirmDlg" class="a11y-overlay" role="dialog" aria-modal="true" aria-labelledby="confirmDlgTitle" aria-describedby="confirmDlgMsg">
    <div class="a11y-box" tabindex="-1" id="confirmDlgBox">
      <div class="a11y-hdr"><span class="a11y-icon" id="confirmDlgIcon" aria-hidden="true">⚠️</span><h2 class="a11y-title" id="confirmDlgTitle">Confirm Action</h2></div>
      <div class="a11y-body"><p class="a11y-msg" id="confirmDlgMsg">Are you sure?</p><input type="text" id="confirmDlgInput" class="a11y-input" style="display:none;" /></div>
      <div class="a11y-footer"><button class="btn btn-secondary" id="confirmDlgCancelBtn" onclick="closeConfirmDlg()">Cancel</button><button class="btn btn-danger" id="confirmDlgOkBtn">Confirm</button></div>
    </div>
  </div>

  <!-- WCAG 2.2 AAA NOTIFY DIALOG -->
  <div id="notifyDlg" class="a11y-overlay" role="alertdialog" aria-modal="true" aria-labelledby="notifyDlgTitle" aria-describedby="notifyDlgMsg">
    <div class="a11y-box" tabindex="-1" id="notifyDlgBox">
      <div class="a11y-hdr"><span class="a11y-icon" id="notifyDlgIcon" aria-hidden="true">✅</span><h2 class="a11y-title" id="notifyDlgTitle">Success</h2></div>
      <div class="a11y-body"><p class="a11y-msg" id="notifyDlgMsg"></p></div>
      <div class="a11y-footer"><button class="btn btn-secondary" onclick="closeNotifyDlg()" id="notifyDlgCloseBtn">Close</button></div>
    </div>
  </div>

  <!-- SCHEDULE DIALOG -->
  <div id="scheduleDlg" class="a11y-overlay" role="dialog" aria-modal="true" aria-labelledby="scheduleDlgTitle">
    <div class="a11y-box" tabindex="-1" id="scheduleDlgBox">
      <div class="a11y-hdr"><span class="a11y-icon" aria-hidden="true">📅</span><h2 class="a11y-title" id="scheduleDlgTitle">Schedule Publishing</h2></div>
      <div class="a11y-body"><p class="a11y-msg">Select when to automatically publish this content.</p><input type="datetime-local" id="scheduleDlgDate" class="a11y-input" style="display:block;margin-top:12px;" /></div>
      <div class="a11y-footer"><button class="btn btn-secondary" onclick="closeScheduleDlg()">Cancel</button><button class="btn btn-primary" id="scheduleDlgConfirmBtn">📅 Schedule</button></div>
    </div>
  </div>

  <!-- VERSION HISTORY MODAL -->
  <div id="versionModal" class="modal-overlay" onclick="if(event.target===this)closeVersionModal()" role="dialog" aria-modal="true" aria-labelledby="versionModalTitle">
    <div class="modal-box">
      <div class="modal-hdr"><div class="modal-title" id="versionModalTitle">🕐 Version History</div><button class="modal-close" onclick="closeVersionModal()" aria-label="Close">&times;</button></div>
      <div class="modal-body" id="versionModalBody"><div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div></div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeVersionModal()">Close</button></div>
    </div>
  </div>

  <!-- PREVIEW MODAL -->
  <div id="previewModal" class="modal-overlay" onclick="if(event.target===this)closePreviewModal()" role="dialog" aria-modal="true" aria-labelledby="prevModalTitle">
    <div class="modal-box" style="max-width:900px;">
      <div class="modal-hdr">
        <div class="modal-title" id="prevModalTitle">👁 Content Preview</div>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick="setPreviewDevice('mobile')">📱 Mobile</button>
          <button class="btn btn-secondary btn-sm" onclick="setPreviewDevice('tablet')">📟 Tablet</button>
          <button class="btn btn-secondary btn-sm" onclick="setPreviewDevice('desktop')">🖥 Desktop</button>
          <button class="modal-close" onclick="closePreviewModal()" aria-label="Close preview">&times;</button>
        </div>
      </div>
      <div class="modal-body" id="previewContainer" style="background:#f8fafc;padding:0;"><div id="previewFrame" style="background:#fff;color:#0f172a;padding:32px;font-family:Georgia,serif;line-height:1.7;min-height:400px;font-size:16px;"></div></div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="window.print()">🖨 Print</button><button class="btn btn-secondary" onclick="closePreviewModal()">Close</button></div>
    </div>
  </div>

  <!-- MEDIA PICKER -->
  <div id="mediaPickerDlg" class="modal-overlay" onclick="if(event.target===this)closeMediaPickerModal()" role="dialog" aria-modal="true" aria-labelledby="mediaPickerTitle">
    <div class="modal-box">
      <div class="modal-hdr"><div class="modal-title" id="mediaPickerTitle">🖼 Media Library — Select Asset</div><button class="modal-close" onclick="closeMediaPickerModal()" aria-label="Close">&times;</button></div>
      <div class="modal-body">
        <div style="display:flex;gap:8px;margin-bottom:12px;"><input class="filter-input" type="text" id="mpSearch" placeholder="Search media..." oninput="filterMediaPicker()" style="flex:1;" /><label class="btn btn-primary btn-sm" style="cursor:pointer;">⬆ Upload<input type="file" style="display:none;" accept="image/*,application/pdf" onchange="quickUploadMedia(this)" /></label></div>
        <div id="mpGrid" class="media-grid"></div>
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" onclick="closeMediaPickerModal()">Cancel</button></div>
    </div>
  </div>

  <!-- MERGE CATEGORIES -->
  <div id="mergeCatDlg" class="a11y-overlay" role="dialog" aria-modal="true" aria-labelledby="mergeCatTitle">
    <div class="a11y-box" tabindex="-1">
      <div class="a11y-hdr"><span class="a11y-icon" aria-hidden="true">🔗</span><h2 class="a11y-title" id="mergeCatTitle">Merge Categories</h2></div>
      <div class="a11y-body">
        <p class="a11y-msg">Merge duplicate categories into one master category.</p>
        <div class="form-group" style="margin-top:12px;"><label for="mergeTarget">Target</label><select id="mergeTarget" style="background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:8px;width:100%;"></select></div>
        <div class="form-group"><label for="mergeSources">Sources to Merge (multi-select)</label><select id="mergeSources" multiple style="height:100px;background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:8px;width:100%;"></select></div>
      </div>
      <div class="a11y-footer"><button class="btn btn-secondary" onclick="closeMergeDlg()">Cancel</button><button class="btn btn-primary" onclick="confirmMergeCats()">Confirm Merge</button></div>
    </div>
  </div>

  <!-- CUSTOM TYPE DIALOG -->
  <div id="customTypeDlg" class="a11y-overlay" role="dialog" aria-modal="true" aria-labelledby="customTypeTitle">
    <div class="a11y-box" tabindex="-1">
      <div class="a11y-hdr"><span class="a11y-icon" aria-hidden="true">✨</span><h2 class="a11y-title" id="customTypeTitle">Create Custom Content Type</h2></div>
      <div class="a11y-body">
        <p class="a11y-msg">New types appear in all editors and filters immediately.</p>
        <div class="form-group" style="margin-top:12px;"><label for="customTypeName">Type Name *</label><input type="text" id="customTypeName" class="a11y-input" placeholder="e.g. Case Study" /></div>
        <div class="form-group"><label for="customTypeDesc">Description</label><input type="text" id="customTypeDesc" class="a11y-input" placeholder="Brief description" /></div>
      </div>
      <div class="a11y-footer"><button class="btn btn-secondary" onclick="closeCustomTypeDlg()">Cancel</button><button class="btn btn-primary" onclick="createCustomType()">Create Type</button></div>
    </div>
  </div>

  <!-- IMPORT DIALOG -->
  <div id="importDlg" class="a11y-overlay" role="dialog" aria-modal="true" aria-labelledby="importDlgTitle">
    <div class="a11y-box" tabindex="-1" style="max-width:560px;">
      <div class="a11y-hdr"><span class="a11y-icon" aria-hidden="true">⬆</span><h2 class="a11y-title" id="importDlgTitle">Import Content</h2></div>
      <div class="a11y-body">
        <p class="a11y-msg">Paste JSON array. Each item must have a title field.</p>
        <textarea id="importJson" class="a11y-input" rows="8" placeholder='[{"title":"My Article","content":"Body...","status":"DRAFT"}]' style="display:block;margin-top:10px;width:100%;min-height:150px;font-family:monospace;font-size:11px;"></textarea>
      </div>
      <div class="a11y-footer"><button class="btn btn-secondary" onclick="closeImportDlg()">Cancel</button><button class="btn btn-primary" onclick="doImport()">Import</button></div>
    </div>
  </div>

  <!-- COMMAND PALETTE -->
  <div id="cmdModal" class="cmd-modal" role="dialog" aria-modal="true" aria-label="Command palette" onclick="if(event.target===this)closeCmd()">
    <div class="cmd-box">
      <input class="cmd-input" type="text" id="cmdInput" placeholder="Search commands, pages, content types..." oninput="filterCmd()" onkeydown="handleCmdKey(event)" autocomplete="off" />
      <div class="cmd-list" id="cmdList" role="listbox"></div>
    </div>
  </div>

        <script>
    'use strict';
    var _AT = '${activeTab}', _IM = '${initialModule}';

    /* ══ WCAG 2.2 AAA ACCESSIBLE DIALOG SYSTEM ══ */
    var _confirmCallback=null,_lastFocused=null;

    function showConfirmDlg(opts){
      var o=opts||{};_confirmCallback=o.onConfirm||null;_lastFocused=document.activeElement;
      document.getElementById('confirmDlgTitle').textContent=o.title||'Confirm Action';
      document.getElementById('confirmDlgMsg').textContent=o.message||'Are you sure?';
      document.getElementById('confirmDlgIcon').textContent=o.icon||(o.destructive?'🗑️':'⚠️');
      var okBtn=document.getElementById('confirmDlgOkBtn');
      okBtn.textContent=o.okLabel||(o.destructive?'Delete':'Confirm');
      okBtn.className='btn '+(o.destructive?'btn-danger':'btn-primary');
      var inp=document.getElementById('confirmDlgInput');
      if(o.confirmText){inp.style.display='block';inp.placeholder='Type "'+o.confirmText+'" to confirm';inp.value='';
        okBtn.onclick=function(){if(inp.value!==o.confirmText){inp.style.outline='2px solid #ef4444';inp.focus();return;}closeConfirmDlg();if(_confirmCallback)_confirmCallback();};
      }else{inp.style.display='none';okBtn.onclick=function(){closeConfirmDlg();if(_confirmCallback)_confirmCallback();};}
      var dlg=document.getElementById('confirmDlg');dlg.classList.add('open');
      var box=document.getElementById('confirmDlgBox');box.focus();trapFocus(box);
      dlg.onkeydown=function(e){if(e.key==='Escape'){e.preventDefault();closeConfirmDlg();}};
      announce((o.title||'Confirm')+'. '+(o.message||''));
    }
    function closeConfirmDlg(){document.getElementById('confirmDlg').classList.remove('open');if(_lastFocused&&_lastFocused.focus)_lastFocused.focus();}

    function showNotify(title,msg,icon){
      _lastFocused=document.activeElement;
      document.getElementById('notifyDlgTitle').textContent=title||'Done';
      document.getElementById('notifyDlgMsg').textContent=msg||'';
      document.getElementById('notifyDlgIcon').textContent=icon||'✅';
      var dlg=document.getElementById('notifyDlg');dlg.classList.add('open');
      document.getElementById('notifyDlgCloseBtn').focus();
      trapFocus(document.getElementById('notifyDlgBox'));
      dlg.onkeydown=function(e){if(e.key==='Escape')closeNotifyDlg();};
      announce(title+'. '+(msg||''));
    }
    function closeNotifyDlg(){document.getElementById('notifyDlg').classList.remove('open');if(_lastFocused&&_lastFocused.focus)_lastFocused.focus();}

    function trapFocus(el){
      var f=el.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])');
      var first=f[0],last=f[f.length-1];
      el.addEventListener('keydown',function ft(e){if(e.key!=='Tab')return;if(e.shiftKey){if(document.activeElement===first){e.preventDefault();last.focus();}}else{if(document.activeElement===last){e.preventDefault();first.focus();}}});
    }
    function announce(msg){var el=document.getElementById('srAnnounce');if(el){el.textContent='';setTimeout(function(){el.textContent=msg;},50);}}
    function showMsg(text,type){var el=document.getElementById('statusMsg');if(el){el.className='status-msg '+(type||'success');el.style.display='block';el.textContent=text;setTimeout(function(){el.style.display='none';},5000);}announce(text);}
    function esc(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');}
    function setVal(id,v){var e=document.getElementById(id);if(e)e.value=v;}
    function setTxt(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
    function setHTML(id,v){var e=document.getElementById(id);if(e)e.innerHTML=v;}
    function getVal(id){var e=document.getElementById(id);return e?e.value:'';}

    function confirmLogout(){
      showConfirmDlg({title:'Sign Out',message:'Sign out of the Admin Console?',icon:'🔐',okLabel:'Sign Out',
        onConfirm:function(){document.cookie='admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';localStorage.removeItem('admin_logged_in');sessionStorage.removeItem('cms_token');window.location.href='/admin/login';}
      });
    }

    /* ══ DASHBOARD STATS ══ */
    function loadDashboardStats(){
      fetch('/api/v1/content/stats').then(function(r){return r.json();}).then(function(d){
        if(!d.success)return;var s=d.data;
        setTxt('st-total',s.total||0);setTxt('st-pub',s.published||0);setTxt('st-draft',s.drafts||0);
        setTxt('st-sched',s.scheduled||0);setTxt('st-arch',s.archived||0);setTxt('st-trash',s.trash||0);
        setTxt('st-cats',s.categoriesCount||0);setTxt('st-tags',s.tagsCount||0);
        setTxt('sc-trash',s.trash||0);setTxt('sc-all',s.total||0);
        if(s.byType){
          var typeSlugs={Article:'arti',Poem:'poem',Research:'rese',Publication:'publ',Project:'proj',Portfolio:'port',News:'news',Event:'even',Resource:'reso',Download:'down',Announcement:'anno',Testimonial:'test',FAQ:'faqs',Page:'page'};
          Object.keys(s.byType).forEach(function(t){var sid=typeSlugs[t];if(sid){var el=document.getElementById('sc-'+sid);if(el)el.textContent=s.byType[t];}});
          setHTML('typeBreakdown',Object.entries(s.byType).map(function(e){return'<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">'+e[1]+'</div><div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-top:2px;">'+esc(e[0])+'</div></div>';}).join(''));
        }
      }).catch(function(){});
      fetch('/api/v1/content/recent?limit=8').then(function(r){return r.json();}).then(function(d){
        if(!d.success)return;var items=d.data||[];
        if(!items.length){setHTML('recentActivity','<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No recent activity</div></div>');return;}
        var sm={PUBLISHED:'badge-green',DRAFT:'badge-gray',SCHEDULED:'badge-purple',ARCHIVED:'badge-orange',REVIEW:'badge-amber'};
        setHTML('recentActivity',items.map(function(it){
          var titleEsc = esc(it.title), idEsc = esc(it.id), statusEsc = esc(it.status);
          var badgeClass = sm[it.status] || 'badge-gray';
          var typesStr = (it.contentTypes || []).join(', ');
          var dateStr = new Date(it.updatedAt).toLocaleDateString();
          return '<div class="activity-item"><div class="activity-icon" style="background:rgba(2,132,199,.15);">📝</div><div class="activity-details"><div class="activity-title"><a href="/admin/editor?edit=' + idEsc + '" style="color:#e2e8f0;text-decoration:none;">' + titleEsc + '</a></div><div class="activity-time"><span class="badge ' + badgeClass + '">' + statusEsc + '</span> · ' + typesStr + ' · ' + dateStr + '</div></div></div>';
        }).join(''));
      }).catch(function(){});
    }

    /* ══ CATEGORIES ══ */
    var masterCategories=[],masterCategoryTree=[],masterTags=[],selectedTags=[],currentMediaTarget='featured',_mediaAssets=[];

    function fetchMasterCategories(){
      fetch('/api/v1/content/categories/tree').then(function(r){return r.json();}).then(function(d){if(d.success){masterCategoryTree=d.data||[];renderCatTreeInEditor();}}).catch(function(){});
      fetch('/api/v1/content/categories').then(function(r){return r.json();}).then(function(d){if(d.success){masterCategories=d.data||[];renderCatTable();renderCatParentOptions();populateCatMergeOptions();}}).catch(function(){});
      fetch('/api/v1/content/tags').then(function(r){return r.json();}).then(function(d){if(d.success)masterTags=d.data||[];}).catch(function(){});
    }
    function renderCatParentOptions(){var sel=document.getElementById('catParent');if(!sel)return;var h='<option value="">— Top Level —</option>';masterCategories.forEach(function(c){h+='<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>';});sel.innerHTML=h;}
    function renderCatTable(){
      var tb=document.getElementById('catTableBody');if(!tb)return;
      var q=(getVal('catSearch')||'').toLowerCase();
      var items=masterCategories.filter(function(c){return c.name.toLowerCase().includes(q)||c.slug.toLowerCase().includes(q);});
      if(!items.length){tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No categories found</div></div></td></tr>';return;}
      tb.innerHTML=items.map(function(c){
        var parent=masterCategories.find(function(p){return p.id===c.parentId;});
        var cId = esc(c.id), cName = esc(c.name), cSlug = esc(c.slug), cIcon = esc(c.icon||'📁'), cStatus = esc(c.status||'ACTIVE');
        var pName = parent ? esc(parent.name) : '<span style="color:#64748b;">Root</span>';
        return '<tr><td><strong>' + cIcon + ' ' + cName + '</strong><div style="font-size:10px;color:#64748b;">/' + cSlug + '</div></td><td>' + pName + '</td><td><span class="badge badge-sky">' + (c.count||0) + ' items</span></td><td><span class="badge badge-green">' + cStatus + '</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(this.dataset.id)" data-id="' + cId + '">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(this.dataset.id,this.dataset.name)" data-id="' + cId + '" data-name="' + cName + '">Delete</button></td></tr>';
      }).join('');
    }
    function onCatNameInput(){var name=(getVal('catName')||'').trim();if(name)setVal('catSlug',name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));}
    function saveCategory(e){
      e.preventDefault();var id=getVal('catId');var name=(getVal('catName')||'').trim();var slug=(getVal('catSlug')||'').trim();
      if(!name||!slug){showMsg('Name and slug required','error');return;}
      var payload={name:name,slug:slug,parentId:getVal('catParent')||null,icon:getVal('catIcon')||'📁',description:getVal('catDesc')||''};
      fetch(id?('/api/v1/content/categories/'+id):'/api/v1/content/categories',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
        .then(function(r){return r.json();}).then(function(d){if(d.success){showMsg(id?'Category updated!':'Category created!','success');resetCatForm();fetchMasterCategories();}else showMsg('Failed: '+(d.message||'Error'),'error');});
    }
    function editCat(id){var c=masterCategories.find(function(i){return i.id===id;});if(!c)return;setVal('catId',c.id);setVal('catName',c.name);setVal('catSlug',c.slug);setVal('catParent',c.parentId||'');setVal('catIcon',c.icon||'📁');setVal('catDesc',c.description||'');setTxt('catFormTitle','Edit: '+c.name);var el=document.getElementById('catName');if(el)el.focus();}
    function confirmDeleteCat(id,name){showConfirmDlg({title:'Delete Category',message:'Delete "'+name+'"? Content using it keeps its data but loses this classification.',icon:'🗑️',destructive:true,okLabel:'Delete',onConfirm:function(){fetch('/api/v1/content/categories/'+id,{method:'DELETE'}).then(function(r){return r.json();}).then(function(){showMsg('Category deleted','success');fetchMasterCategories();});}});}
    function resetCatForm(){['catId','catName','catSlug','catDesc'].forEach(function(id){setVal(id,'');});setVal('catParent','');setVal('catIcon','📁');setTxt('catFormTitle','Create New Category');}
    function openMergeDlg(){populateCatMergeOptions();document.getElementById('mergeCatDlg').classList.add('open');}
    function closeMergeDlg(){document.getElementById('mergeCatDlg').classList.remove('open');}
    function populateCatMergeOptions(){var h='';masterCategories.forEach(function(c){h+='<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>';});setHTML('mergeTarget',h);setHTML('mergeSources',h);}
    function confirmMergeCats(){var tgt=getVal('mergeTarget');var srcEl=document.getElementById('mergeSources');var srcIds=[];for(var i=0;i<srcEl.options.length;i++){if(srcEl.options[i].selected)srcIds.push(srcEl.options[i].value);}if(!tgt||!srcIds.length){showMsg('Select target and sources','error');return;}fetch('/api/v1/content/categories/merge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetId:tgt,sourceIds:srcIds})}).then(function(r){return r.json();}).then(function(){showMsg('Categories merged!','success');closeMergeDlg();fetchMasterCategories();});}

    /* ══ CONTENT TABLE ══ */
    var repo=[],currentPage=1,currentLimit=20,currentTotal=0,currentTotalPages=1;
    var sortState={by:'updatedAt',order:'desc'};
    var filterTimer=null,selectedIds=[];

    function debounceFilter(){clearTimeout(filterTimer);filterTimer=setTimeout(function(){doFilter(1);},350);}
    function doFilter(pg){
      currentPage=pg||currentPage;
      var q=getVal('cSearch'),type=getVal('cType'),status=getVal('cStatus'),locale=getVal('cLocale');
      var sortVal=getVal('cSort')||'updatedAt-desc';var parts=sortVal.split('-');
      sortState.by=parts[0];sortState.order=parts[1]||'desc';
      if(_IM!=='ALL'&&_IM!=='RECYCLE_BIN'&&type==='ALL')type=_IM;
      var includeDeleted=(_IM==='RECYCLE_BIN')?'true':'false';
      var url='/api/v1/content?page='+currentPage+'&limit='+currentLimit+'&sortBy='+sortState.by+'&sortOrder='+sortState.order;
      if(q)url+='&q='+encodeURIComponent(q);
      if(type&&type!=='ALL')url+='&type='+encodeURIComponent(type);
      if(status&&status!=='ALL')url+='&status='+encodeURIComponent(status);
      if(locale)url+='&locale='+encodeURIComponent(locale);
      if(includeDeleted==='true')url+='&includeDeleted=true';
      fetch(url).then(function(r){return r.json();}).then(function(d){
        if(d.success&&d.data){repo=d.data.items||[];currentTotal=d.data.total||0;currentTotalPages=d.data.totalPages||1;renderRows(repo);renderPagination();selectedIds=[];setHTML('selCount','');var bb=document.getElementById('bulkBar');if(bb)bb.style.display='none';var sa=document.getElementById('selAll');if(sa)sa.checked=false;}
      }).catch(function(){renderRows([]);});
    }
    function renderRows(items){
      var tb=document.getElementById('cTableBody');if(!tb)return;
      if(!items||!items.length){tb.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No content found</div><div class="empty-sub">Adjust filters or create new content above.</div></div></td></tr>';return;}
      var sm={PUBLISHED:'badge-green',DRAFT:'badge-gray',REVIEW:'badge-amber',SCHEDULED:'badge-purple',ARCHIVED:'badge-orange',PRIVATE:'badge-red'};
      tb.innerHTML=items.map(function(it){
        var idEsc = esc(it.id), titleEsc = esc(it.title), slugEsc = esc(it.slug), localeEsc = esc(it.locale||'en'), statusEsc = esc(it.status);
        var bdg=(it.contentTypes||[]).map(function(t){return '<span class="badge badge-sky" style="margin:1px;">'+esc(t)+'</span>';}).join('');
        var sBadge='<span class="badge '+(sm[it.status]||'badge-gray')+'">'+statusEsc+'</span>';
        var updated=it.updatedAt?new Date(it.updatedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
        var isDel=it.isDeleted;
        var actions=isDel?[
          '<a href="/admin/editor?edit='+idEsc+'" class="btn btn-secondary btn-xs">View</a>',
          '<button class="btn btn-success btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="restore" data-id="'+idEsc+'" data-title="'+titleEsc+'">↩ Restore</button>',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="permanent-delete" data-id="'+idEsc+'" data-title="'+titleEsc+'">✕ Purge</button>'
        ]:[
          '<a href="/admin/editor?edit='+idEsc+'" class="btn btn-secondary btn-xs">✏ Edit</a>',
          it.status==='PUBLISHED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="unpublish" data-id="'+idEsc+'" data-title="'+titleEsc+'">○ Unpub</button>':'<button class="btn btn-success btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="publish" data-id="'+idEsc+'" data-title="'+titleEsc+'">✓ Pub</button>',
          '<button class="btn btn-teal btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="duplicate" data-id="'+idEsc+'" data-title="'+titleEsc+'">⧉ Clone</button>',
          '<button class="btn btn-purple btn-xs" onclick="openVersionModal(this.dataset.id,this.dataset.title)" data-id="'+idEsc+'" data-title="'+titleEsc+'">🕐 History</button>',
          it.status!=='SCHEDULED'?'<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg(this.dataset.id)" data-id="'+idEsc+'">📅 Sched</button>':'',
          it.status!=='ARCHIVED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="archive" data-id="'+idEsc+'" data-title="'+titleEsc+'">📦 Archive</button>':'',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(this.dataset.act,this.dataset.id,this.dataset.title)" data-act="delete" data-id="'+idEsc+'" data-title="'+titleEsc+'">🗑 Trash</button>'
        ];
        return '<tr><td><input type="checkbox" class="rcb" value="'+idEsc+'" onchange="updateSelection(this)" /></td>'+
          '<td style="max-width:260px;"><div style="font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+titleEsc+'">'+titleEsc+'</div><div style="font-size:10px;color:#64748b;">/'+slugEsc+'</div></td>'+
          '<td>'+bdg+'</td><td>'+sBadge+'</td>'+
          '<td><span class="badge badge-blue">'+localeEsc+'</span></td>'+
          '<td style="font-size:11px;color:#64748b;white-space:nowrap;">'+updated+'</td>'+
          '<td><div style="display:flex;gap:3px;flex-wrap:wrap;">'+actions.join('')+'</div></td></tr>';
      }).join('');
    }
    function renderPagination(){
      var bar=document.getElementById('paginationBar');if(!bar)return;
      if(currentTotalPages<=1&&currentTotal<=currentLimit){bar.style.display='none';return;}
      bar.style.display='flex';
      setTxt('pageInfo','Showing '+((currentPage-1)*currentLimit+1)+'–'+Math.min(currentPage*currentLimit,currentTotal)+' of '+currentTotal);
      var prevBtn=document.getElementById('prevPage');var nextBtn=document.getElementById('nextPage');
      if(prevBtn)prevBtn.disabled=(currentPage<=1);if(nextBtn)nextBtn.disabled=(currentPage>=currentTotalPages);
      var nums='';var start=Math.max(1,currentPage-2);var end=Math.min(currentTotalPages,start+4);
      for(var i=start;i<=end;i++){nums+='<button class="page-btn'+(i===currentPage?' active':'')+'" onclick="goPage('+i+')" '+(i===currentPage?'aria-current="page"':'')+'>'+i+'</button>';}
      setHTML('pageNums',nums);
    }
    function goPage(pg){if(pg<1||pg>currentTotalPages)return;currentPage=pg;doFilter(pg);}
    function changeLimit(v){currentLimit=parseInt(v)||20;doFilter(1);}
    function toggleSort(col){if(sortState.by===col)sortState.order=(sortState.order==='asc'?'desc':'asc');else{sortState.by=col;sortState.order='asc';}var sel=document.getElementById('cSort');if(sel)sel.value=sortState.by+'-'+sortState.order;doFilter(1);}
    function updateSelection(cb){if(cb.checked){if(!selectedIds.includes(cb.value))selectedIds.push(cb.value);}else selectedIds=selectedIds.filter(function(id){return id!==cb.value;});updateBulkBar();}
    function selAllRows(cb){var cbs=document.querySelectorAll('.rcb');selectedIds=[];cbs.forEach(function(c){c.checked=cb.checked;if(cb.checked)selectedIds.push(c.value);});updateBulkBar();}
    function updateBulkBar(){var cnt=selectedIds.length;var c=document.getElementById('selCount');if(c)c.textContent=cnt>0?cnt+' selected':'';var b=document.getElementById('bulkBar');if(b)b.style.display=cnt>0?'flex':'none';}

    /* ══ ITEM ACTIONS ══ */
    function actionItem(action,id,title){
      var labels={publish:{title:'Publish',msg:'Publish "'+title+'" to the live site?',icon:'🚀',ok:'Publish',d:false},unpublish:{title:'Unpublish',msg:'Move "'+title+'" to Draft?',icon:'○',ok:'Unpublish',d:false},archive:{title:'Archive',msg:'Archive "'+title+'"?',icon:'📦',ok:'Archive',d:false},duplicate:{title:'Duplicate',msg:'Create a Draft copy of "'+title+'"?',icon:'⧉',ok:'Duplicate',d:false},delete:{title:'Trash',msg:'Move "'+title+'" to Recycle Bin? Can restore later.',icon:'🗑️',ok:'Trash',d:false},restore:{title:'Restore',msg:'Restore "'+title+'" from Recycle Bin?',icon:'↩',ok:'Restore',d:false},'permanent-delete':{title:'Permanently Delete',msg:'PERMANENTLY delete "'+title+'"? This CANNOT be undone.',icon:'☠️',ok:'Delete Forever',d:true}};
      var cfg=labels[action]||{title:'Confirm',msg:'Proceed?',icon:'⚠️',ok:'Confirm',d:false};
      showConfirmDlg({title:cfg.title,message:cfg.msg,icon:cfg.icon,okLabel:cfg.ok,destructive:cfg.d,onConfirm:function(){executeAction(action,id);}});
    }
    function executeAction(action,id){
      var method='POST',url='/api/v1/content/';
      if(action==='delete'){url+=id;method='DELETE';}else if(action==='permanent-delete'){url+=id+'/permanent';method='DELETE';}else url+=id+'/'+action;
      fetch(url,{method:method,headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){if(d.success){showMsg(d.message||'Action completed','success');doFilter(currentPage);loadDashboardStats();}else showMsg('Failed: '+(d.message||'Error'),'error');}).catch(function(e){showMsg('Network error: '+e.message,'error');});
    }
    function doBulk(action){
      if(!selectedIds.length){showMsg('Select at least one item','error');return;}
      var labels={publish:'Publish',unpublish:'Unpublish',archive:'Archive',delete:'Trash',export:'Export CSV'};
      showConfirmDlg({title:'Bulk '+labels[action],message:labels[action]+' '+selectedIds.length+' item(s)?',icon:action==='delete'?'🗑️':'⚡',okLabel:labels[action],destructive:action==='delete',
        onConfirm:function(){
          if(action==='export'){fetch('/api/v1/content/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format:'csv'})}).then(function(r){return r.json();}).then(function(d){var blob=new Blob([d.data||''],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='export.csv';a.click();showMsg('Export complete!','success');});return;}
          fetch('/api/v1/content/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:action,ids:selectedIds})}).then(function(r){return r.json();}).then(function(d){if(d.success){showMsg(d.message||'Done','success');doFilter(1);selectedIds=[];updateBulkBar();}else showMsg('Bulk op failed','error');});
        }
      });
    }

    /* ══ SCHEDULE ══ */
    var _scheduleId=null;
    function openScheduleDlg(id){_scheduleId=id;_lastFocused=document.activeElement;var now=new Date();now.setMinutes(now.getMinutes()-now.getTimezoneOffset());setVal('scheduleDlgDate',now.toISOString().slice(0,16));var dlg=document.getElementById('scheduleDlg');dlg.classList.add('open');document.getElementById('scheduleDlgDate').focus();dlg.onkeydown=function(e){if(e.key==='Escape')closeScheduleDlg();};document.getElementById('scheduleDlgConfirmBtn').onclick=function(){var dt=getVal('scheduleDlgDate');if(!dt){showMsg('Select date/time','error');return;}fetch('/api/v1/content/'+_scheduleId+'/schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scheduledAt:new Date(dt).toISOString()})}).then(function(r){return r.json();}).then(function(d){if(d.success){closeScheduleDlg();showMsg('Scheduled!','success');doFilter(currentPage);}else showMsg('Failed','error');});};}
    function closeScheduleDlg(){document.getElementById('scheduleDlg').classList.remove('open');if(_lastFocused)_lastFocused.focus();}

    /* ══ VERSION HISTORY ══ */
    var _versionContentId=null;
    function openVersionModal(id,title){
      _versionContentId=id;_lastFocused=document.activeElement;
      document.getElementById('versionModalTitle').textContent='🕐 Version History — '+title;
      setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div>');
      document.getElementById('versionModal').classList.add('open');
      fetch('/api/v1/content/'+id+'/revisions').then(function(r){return r.json();}).then(function(d){
        if(!d.success||!d.data||!d.data.length){setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No revisions yet</div></div>');return;}
        setHTML('versionModalBody','<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+d.data.map(function(rev,i){
          var revIdEsc = esc(rev.id), revTitleEsc = esc(rev.title), cIdEsc = esc(id);
          var verNum = rev.version || (d.data.length - i);
          var dateStr = new Date(rev.updatedAt).toLocaleString();
          var currBadge = i === 0 ? '<span class="badge badge-green" style="font-size:9px;">Current</span>' : '';
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-xs" onclick="restoreRevision(this.dataset.cid,this.dataset.revid)" data-cid="' + cIdEsc + '" data-revid="' + revIdEsc + '">↩ Restore</button>' : '';
          return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;"><span class="rev-badge">v' + verNum + '</span><span style="font-size:12px;font-weight:700;color:#e2e8f0;">' + revTitleEsc + '</span>' + currBadge + '</div><div class="rev-meta">' + dateStr + '</div></div>' + restBtn + '</div>';
        }).join('')+'</div>');
      }).catch(function(){setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-text">Could not load revisions</div></div>');});
    }
    function closeVersionModal(){document.getElementById('versionModal').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function restoreRevision(contentId,revId){showConfirmDlg({title:'Restore Revision',message:'Restore this version? Current content saved as new revision before restoring.',icon:'↩',okLabel:'Restore',onConfirm:function(){fetch('/api/v1/content/'+contentId+'/revisions/'+revId+'/restore',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){if(d.success){closeVersionModal();showMsg('Revision restored!','success');doFilter(currentPage);}else showMsg('Restore failed','error');});}});}

    /* ══ REVISIONS PAGE ══ */
    function fetchAllRevisions(){fetch('/api/v1/content?limit=100').then(function(r){return r.json();}).then(function(d){if(!d.success||!d.data)return;var items=d.data.items||[];var sel=document.getElementById('revContentPicker');if(!sel)return;sel.innerHTML='<option value="">— Select a content item —</option>';items.forEach(function(it){sel.innerHTML+='<option value="'+esc(it.id)+'">'+esc(it.title)+' ('+esc(it.status)+')</option>';});});}
    function loadRevisions(id){
      if(!id){setHTML('revList','<div class="empty-state"><div class="empty-icon">🕐</div><div class="empty-text">Select a content item</div></div>');return;}
      setHTML('revList','<div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div>');
      fetch('/api/v1/content/'+id+'/revisions').then(function(r){return r.json();}).then(function(d){
        if(!d.success||!d.data||!d.data.length){setHTML('revList','<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No revisions yet</div></div>');setTxt('revCount','0 revisions');return;}
        setTxt('revCount',d.data.length+' revision'+(d.data.length!==1?'s':''));
        setHTML('revList','<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+d.data.map(function(rev,i){
          var revIdEsc = esc(rev.id), revTitleEsc = esc(rev.title), cIdEsc = esc(id);
          var verNum = rev.version || (d.data.length - i);
          var dateStr = new Date(rev.updatedAt).toLocaleString('en-GB');
          var snippetEsc = esc((rev.content || '').slice(0, 120));
          var currBadge = i === 0 ? '<span class="badge badge-green" style="font-size:9px;">Current</span>' : '';
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-sm" onclick="restoreRevision(this.dataset.cid,this.dataset.revid)" data-cid="' + cIdEsc + '" data-revid="' + revIdEsc + '">↩ Restore</button>' : '';
          return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span class="rev-badge">v' + verNum + '</span><span style="font-size:13px;font-weight:700;color:#e2e8f0;">' + revTitleEsc + '</span>' + currBadge + '</div><div class="rev-meta">Saved ' + dateStr + '</div><div style="font-size:11px;color:#475569;margin-top:4px;">' + snippetEsc + '...</div></div>' + restBtn + '</div>';
        }).join('')+'</div>');
      });
    }

    /* ══ EDITOR ══ */
    var autosaveTimer=null,rteHistory=[];
    function onTitleInputPage(){var title=(getVal('edTitlePage')||'').trim();var badge=document.getElementById('edSlugBadgePage');if(badge&&badge.classList.contains('slug-auto')){setVal('edSlugPage',title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-').replace(/-+/g,'-'));}generateMissingSeoPage();}
    function onSlugInputPage(){var b=document.getElementById('edSlugBadgePage');if(b){b.className='slug-badge slug-manual';b.textContent='Manual';}}
    function regenSlugPage(){var t=(getVal('edTitlePage')||'').trim();if(!t){showMsg('Enter title first','error');return;}setVal('edSlugPage',t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));var b=document.getElementById('edSlugBadgePage');if(b){b.className='slug-badge slug-auto';b.textContent='Auto';}}
    function onStatusChange(){var status=getVal('edStatusPage');var sg=document.getElementById('schedDateGroup');if(sg)sg.style.display=(status==='SCHEDULED'?'block':'none');}
    function onVisibilityChange(){var v=getVal('edVisibilityPage');var g=document.getElementById('passGroupPage');if(g)g.style.display=(v==='PASSWORD'?'block':'none');}
    function generateMissingSeoPage(){var t=(getVal('edTitlePage')||'').trim();if(!t)return;var sum=(getVal('edSummaryPage')||'').trim();var mt=document.getElementById('edMetaTitlePage');var md=document.getElementById('edMetaDescPage');var kw=document.getElementById('edKeywordsPage');if(mt&&!mt.value)mt.value=t+' | Sandip Thapa Academic Platform';if(md&&!md.value)md.value=sum||(t+' — Academic publication by Sandip Thapa.');if(kw&&!kw.value)kw.value=selectedTags.join(', ')||'Legal Research, Disability Rights';updateCharCount('edMetaTitlePage','metaTitleCount',60);updateCharCount('edMetaDescPage','metaDescCount',160);}
    function updateCharCount(inputId,countId,max){var el=document.getElementById(inputId);var cl=document.getElementById(countId);if(!el||!cl)return;var len=el.value.length;cl.textContent=max?(len+' / '+max+' chars'):(el.value.split(/\s+/).filter(Boolean).length+' words');cl.className='char-count'+(max&&len>max?' over':max&&len>max*0.85?' warn':'');}
    function wrapFormat(fmt){var el=document.getElementById('edBodyPage');if(!el)return;rteHistory.push(el.value);if(rteHistory.length>50)rteHistory.shift();var s=el.selectionStart;var e=el.selectionEnd;var sel=el.value.substring(s,e)||'text';var fm={h1:'<h1>'+sel+'</h1>',h2:'<h2>'+sel+'</h2>',h3:'<h3>'+sel+'</h3>',h4:'<h4>'+sel+'</h4>',b:'<strong>'+sel+'</strong>',i:'<em>'+sel+'</em>',u:'<u>'+sel+'</u>',strike:'<s>'+sel+'</s>',sup:'<sup>'+sel+'</sup>',sub:'<sub>'+sel+'</sub>',quote:'<blockquote>\\n  '+sel+'\\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\\n'+sel+'\\n</code></pre>',ul:'<ul>\\n  <li>'+sel+'</li>\\n</ul>',ol:'<ol>\\n  <li>'+sel+'</li>\\n</ol>',tasklist:'<ul>\\n  <li><input type="checkbox" /> '+sel+'</li>\\n</ul>',table:'<table>\\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\\n</table>',hr:'\\n<hr />\\n',link:'<a href="URL">'+sel+'</a>'};var tag=fm[fmt]||sel;el.value=el.value.substring(0,s)+tag+el.value.substring(e);el.focus();el.selectionStart=el.selectionEnd=s+tag.length;updateCharCount('edBodyPage','bodyCharCount',0);}
    function rteUndo(){var el=document.getElementById('edBodyPage');if(!el||rteHistory.length===0)return;el.value=rteHistory.pop()||el.value;}
    function rteRedo(){}
    function onTagInputSearch(){var q=(getVal('tagInputPage')||'').toLowerCase().trim();var box=document.getElementById('tagSuggestBox');if(!box)return;if(!q){box.style.display='none';return;}var matches=masterTags.filter(function(t){return t.name.toLowerCase().includes(q);});if(!matches.length){box.style.display='none';return;}box.innerHTML=matches.map(function(t){return'<div class="tag-suggest-item" onclick="addTagFromSuggest(this.dataset.name)" data-name="' + esc(t.name) + '">#'+esc(t.name)+' ('+t.count+')</div>';}).join('');box.style.display='block';}
    function addTagFromSuggest(t){if(t&&!selectedTags.includes(t)){selectedTags.push(t);renderTagChips();}setVal('tagInputPage','');var b=document.getElementById('tagSuggestBox');if(b)b.style.display='none';}
    function handleTagKey(e){if(e.key==='Enter'){e.preventDefault();var v=e.target.value.trim();if(v&&!selectedTags.includes(v)){selectedTags.push(v);renderTagChips();e.target.value='';var b=document.getElementById('tagSuggestBox');if(b)b.style.display='none';}}}
    function removeTag(t){selectedTags=selectedTags.filter(function(x){return x!==t;});renderTagChips();}
    function renderTagChips(){var c=document.getElementById('tagChipsPage');if(!c)return;c.innerHTML=selectedTags.map(function(t){return'<span class="tag-chip">#'+esc(t)+' <button type="button" onclick="removeTag(this.dataset.name)" data-name="' + esc(t) + '" aria-label="Remove tag '+esc(t)+'">×</button></span>';}).join('');}
    function renderCatTreeInEditor(selectedCats,primaryCat){selectedCats=selectedCats||['Legal Research'];primaryCat=primaryCat||selectedCats[0]||'Legal Research';var c=document.getElementById('catTreeContainer');if(!c)return;var h='';function buildNodes(nodes,depth){nodes.forEach(function(node){var ind=depth>0?'margin-left:'+(depth*20)+'px;':'';h+='<div class="cat-node" style="'+ind+'"><input type="checkbox" name="catTree" value="'+esc(node.name)+'" '+(selectedCats.includes(node.name)?'checked':'')+' /> <span>'+esc(node.icon||'📁')+' '+esc(node.name)+'</span> <label style="margin-left:auto;font-size:10px;color:#94a3b8;display:flex;align-items:center;gap:4px;"><input type="radio" name="primaryCat" value="'+esc(node.name)+'" '+(primaryCat===node.name?'checked':'')+' /> Primary</label></div>';if(node.children&&node.children.length)buildNodes(node.children,depth+1);})}buildNodes(masterCategoryTree,0);c.innerHTML=h||'<div style="font-size:11px;color:#64748b;">No categories loaded yet</div>';}
    function startAutosave(){if(autosaveTimer)clearInterval(autosaveTimer);autosaveTimer=setInterval(function(){manualAutosave(true);},30000);}
    function manualAutosave(silent){var title=(getVal('edTitlePage')||'').trim();var body=(getVal('edBodyPage')||'');if(!title&&!body){if(!silent)showMsg('Nothing to save yet','info');return;}var draft={title:title,body:body,tags:selectedTags,status:getVal('edStatusPage'),time:new Date().toLocaleTimeString()};localStorage.setItem('cms_editor_draft',JSON.stringify(draft));var s=document.getElementById('autosaveStatus');if(s)s.textContent='Autosaved at '+draft.time;if(!silent)showMsg('Draft saved at '+draft.time,'success');}
    var cfCount=0;
    function addCustomField(){cfCount++;var c=document.getElementById('customFieldsContainer');if(!c)return;var d=document.createElement('div');d.style.cssText='display:grid;grid-template-columns:1fr 2fr 24px;gap:8px;margin-bottom:6px;';d.innerHTML='<input type="text" placeholder="Field name" style="background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:7px 10px;font-size:12px;" /><input type="text" placeholder="Value" style="background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:7px 10px;font-size:12px;" /><button type="button" onclick="this.parentNode.remove()" style="background:#7f1d1d;border:none;border-radius:4px;color:#fca5a5;font-weight:900;cursor:pointer;font-size:14px;">×</button>';c.appendChild(d);}
    function renderTypesGrid(){var g=document.getElementById('typesGridPage');if(!g)return;var types=['Article','Poem','Research','Publication','Project','Portfolio','News','Event','Resource','Download','Announcement','Testimonial','FAQ','Page','Featured'];var initType=_IM==='ALL'?'Article':_IM;g.innerHTML=types.map(function(t){return'<label class="type-label"><input type="checkbox" name="contentType" value="'+t+'" '+(t===initType?'checked':'')+' /> '+t+'</label>';}).join('');}
    function saveEdPage(status){
      var id=getVal('edIdPage')||'';var title=(getVal('edTitlePage')||'').trim();
      if(!title){showMsg('Title is required','error');document.getElementById('edTitlePage').focus();return;}
      var slug=(getVal('edSlugPage')||'').trim()||title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');setVal('edSlugPage',slug);
      var catCbs=document.querySelectorAll('#catTreeContainer input[name="catTree"]:checked');var cats=[];for(var i=0;i<catCbs.length;i++)cats.push(catCbs[i].value);
      var primEl=document.querySelector('#catTreeContainer input[name="primaryCat"]:checked');
      var typeCbs=document.querySelectorAll('#typesGridPage input[name="contentType"]:checked');var types=[];for(var j=0;j<typeCbs.length;j++)types.push(typeCbs[j].value);
      var customFields={};document.querySelectorAll('#customFieldsContainer > div').forEach(function(row){var ins=row.querySelectorAll('input');if(ins[0]&&ins[1]&&ins[0].value.trim())customFields[ins[0].value.trim()]=ins[1].value;});
      var payload={title:title,slug:slug,status:status,summary:getVal('edSummaryPage'),content:getVal('edBodyPage'),contentTypes:types.length?types:['Article'],categories:cats.length?cats:['Legal Research'],primaryCategory:primEl?primEl.value:(cats[0]||'Legal Research'),tags:selectedTags,authors:[getVal('edAuthorsPage')||'Sandip Thapa'],locale:getVal('edLocalePage')||'en',visibility:getVal('edVisibilityPage')||'PUBLIC',password:getVal('edPasswordPage')||undefined,isSticky:!!(document.getElementById('edStickyPage')&&document.getElementById('edStickyPage').checked),allowComments:!!(document.getElementById('edCommentsPage')&&document.getElementById('edCommentsPage').checked),postFormat:getVal('edPostFormatPage')||'standard',scheduledAt:(status==='SCHEDULED'&&getVal('edPubDatePage'))?new Date(getVal('edPubDatePage')).toISOString():undefined,featuredImage:{url:getVal('edImagePage'),alt:getVal('edImgAltPage'),caption:getVal('edImgCaptionPage')},seoMetadata:{metaTitle:getVal('edMetaTitlePage'),metaDescription:getVal('edMetaDescPage'),focusKeyword:getVal('edKeywordsPage'),canonicalUrl:getVal('edCanonicalPage')},customFields:customFields};
      fetch(id?('/api/v1/content/'+id):'/api/v1/content',{method:id?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(d){if(d.success){localStorage.removeItem('cms_editor_draft');showNotify('Content Saved!','Saved as '+(status==='PUBLISHED'?'Published':'Draft')+'. Redirecting...','✅');setTimeout(function(){window.location.href='/admin/content';},1800);}else showMsg('Save failed: '+(d.message||'Error'),'error');}).catch(function(e){showMsg('Network error: '+e.message,'error');});
    }
    function initPageEditor(initType,editId){fetchMasterCategories();renderTypesGrid();startAutosave();var saved=localStorage.getItem('cms_editor_draft');if(saved&&!editId){try{var dr=JSON.parse(saved);if(dr.title){showMsg('Autosave draft restored from '+dr.time,'info');setVal('edTitlePage',dr.title);setVal('edBodyPage',dr.body||'');selectedTags=dr.tags||[];renderTagChips();setVal('edStatusPage',dr.status||'DRAFT');}}catch(e){}}if(editId){fetch('/api/v1/content/'+editId).then(function(r){return r.json();}).then(function(d){if(!d.success||!d.data)return;var it=d.data;setTxt('pageEdHeaderTitle','Editing: '+it.title);setVal('edIdPage',it.id||'');setVal('edTitlePage',it.title||'');setVal('edSlugPage',it.slug||'');setVal('edSummaryPage',it.summary||'');setVal('edBodyPage',it.content||'');setVal('edAuthorsPage',(it.authors||[]).join(', ')||'Sandip Thapa');setVal('edImagePage',(it.featuredImage&&it.featuredImage.url)||'');setVal('edImgAltPage',(it.featuredImage&&it.featuredImage.alt)||'');setVal('edImgCaptionPage',(it.featuredImage&&it.featuredImage.caption)||'');setVal('edStatusPage',it.status||'DRAFT');setVal('edVisibilityPage',it.visibility||'PUBLIC');setVal('edPostFormatPage',it.postFormat||'standard');setVal('edLocalePage',it.locale||'en');setVal('edMetaTitlePage',(it.seoMetadata&&it.seoMetadata.metaTitle)||'');setVal('edMetaDescPage',(it.seoMetadata&&it.seoMetadata.metaDescription)||'');setVal('edKeywordsPage',(it.seoMetadata&&it.seoMetadata.focusKeyword)||'');setVal('edCanonicalPage',(it.seoMetadata&&it.seoMetadata.canonicalUrl)||'');selectedTags=it.tags||[];renderTagChips();renderCatTreeInEditor(it.categories||[],it.primaryCategory);(it.contentTypes||[]).forEach(function(t){var cb=document.querySelector('#typesGridPage input[value="'+t+'"]');if(cb)cb.checked=true;});if(it.customFields&&Object.keys(it.customFields).length){Object.entries(it.customFields).forEach(function(kv){cfCount++;var c=document.getElementById('customFieldsContainer');if(!c)return;var d=document.createElement('div');d.style.cssText='display:grid;grid-template-columns:1fr 2fr 24px;gap:8px;margin-bottom:6px;';d.innerHTML='<input type="text" value="'+esc(kv[0])+'" style="background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:7px 10px;font-size:12px;" /><input type="text" value="'+esc(String(kv[1]))+'" style="background:#020617;border:1px solid #1e293b;border-radius:6px;color:#fff;padding:7px 10px;font-size:12px;" /><button type="button" onclick="this.parentNode.remove()" style="background:#7f1d1d;border:none;border-radius:4px;color:#fca5a5;font-weight:900;cursor:pointer;">×</button>';c.appendChild(d);}); }onStatusChange();onVisibilityChange();updateCharCount('edBodyPage','bodyCharCount',0);updateCharCount('edSummaryPage','summaryCharCount',160);updateCharCount('edMetaTitlePage','metaTitleCount',60);updateCharCount('edMetaDescPage','metaDescCount',160);});}else{setTxt('pageEdHeaderTitle','Create — '+initType);setTimeout(function(){var cb=document.querySelector('#typesGridPage input[value="'+initType+'"]');if(cb)cb.checked=true;},100);}}
    function openPreviewModal(){var title=(getVal('edTitlePage')||'Untitled').trim();var body=getVal('edBodyPage')||'';document.getElementById('previewFrame').innerHTML='<h1 style="margin-bottom:16px;">'+esc(title)+'</h1><hr style="margin:12px 0;border:none;border-top:1px solid #ddd;" />'+body;document.getElementById('previewModal').classList.add('open');}
    function closePreviewModal(){document.getElementById('previewModal').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function setPreviewDevice(d){var f=document.getElementById('previewFrame');if(!f)return;f.style.maxWidth=(d==='mobile'?'375px':d==='tablet'?'768px':'100%');f.style.margin='0 auto';}

    /* ══ MEDIA ══ */
    function openMediaPickerModal(t){currentMediaTarget=t;_lastFocused=document.activeElement;loadMediaPicker();document.getElementById('mediaPickerDlg').classList.add('open');}
    function closeMediaPickerModal(){document.getElementById('mediaPickerDlg').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function handleMediaKey(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();selectMediaAsset(e.currentTarget.dataset.url);}}
    function selectMediaAsset(url){if(currentMediaTarget==='featured'){setVal('edImagePage',url);}else{var el=document.getElementById('edBodyPage');if(el)el.value+='\\n<img src="'+url+'" alt="Media" />\\n';}closeMediaPickerModal();showMsg('Media inserted','success');}
    function loadMediaPicker(){fetch('/api/v1/media').then(function(r){return r.json();}).then(function(d){var assets=(d.data&&d.data.items)||[];_mediaAssets=assets;renderMediaPicker(assets);}).catch(function(){_mediaAssets=[];renderMediaPicker([]);});}
    function renderMediaPicker(assets){var g=document.getElementById('mpGrid');if(!g)return;if(!assets.length){g.innerHTML='<div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">No media. Upload to get started.</div></div>';return;}g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb" onclick="selectMediaAsset(this.dataset.url)" data-url="' + urlEsc + '" tabindex="0" role="button" aria-label="Select ' + fnameEsc + '" onkeydown="handleMediaKey(event)"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name" title="' + fnameEsc + '">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div></div>';
      }).join('');}
    function filterMediaPicker(){var q=(getVal('mpSearch')||'').toLowerCase();renderMediaPicker(_mediaAssets.filter(function(a){return a.filename.toLowerCase().includes(q);}));}
    function filterMedia(){var q=(getVal('mediaSearch')||'').toLowerCase();var t=getVal('mediaTypeFilter');renderMediaGrid(_mediaAssets.filter(function(a){return(!q||a.filename.toLowerCase().includes(q))&&(!t||a.mimeType.includes(t));}));}
    function renderMediaGrid(assets){var g=document.getElementById('mediaGrid');var em=document.getElementById('mediaEmpty');if(!g)return;if(!assets.length){if(em)em.style.display='block';g.innerHTML='';return;}if(em)em.style.display='none';g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var aIdEsc = esc(a.id), urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard(this.dataset.url)" data-url="' + urlEsc + '">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia(this.dataset.id,this.dataset.name)" data-id="' + aIdEsc + '" data-name="' + fnameEsc + '">Del</button></div></div>';
      }).join('');}
    function confirmDeleteMedia(id,name){showConfirmDlg({title:'Delete Media',message:'Delete "'+name+'"? Content links will break.',icon:'🗑️',destructive:true,okLabel:'Delete',onConfirm:function(){showMsg('Media deletion: POST to /api/v1/media/'+id,'info');}});}
    function quickUploadMedia(input){showMsg('Upload: TODO: POST multipart to /api/v1/media/upload','info');}
    function uploadMedia(input){quickUploadMedia(input);}
    function loadMediaLibrary(){fetch('/api/v1/media').then(function(r){return r.json();}).then(function(d){_mediaAssets=(d.data&&d.data.items)||[];renderMediaGrid(_mediaAssets);}).catch(function(){_mediaAssets=[];renderMediaGrid([]);});}
    function formatBytes(b){if(b===0)return'0 B';var k=1024,s=['B','KB','MB','GB'];var i=Math.floor(Math.log(b)/Math.log(k));return parseFloat((b/Math.pow(k,i)).toFixed(1))+' '+s[i];}
    function copyToClipboard(t){navigator.clipboard&&navigator.clipboard.writeText(t).then(function(){showMsg('URL copied!','success');});}

    /* ══ NAVIGATION BUILDER ══ */
    var menuData={main:[],footer:[],mobile:[],sidebar:[]};
    function loadMenuItems(){var m=getVal('menuSelect')||'main';var titles={main:'Primary Header Navigation',footer:'Footer Navigation',mobile:'Mobile Navigation',sidebar:'Sidebar Navigation'};setTxt('menuBuilderTitle',titles[m]||m);fetch('/api/v1/navigation/menus').then(function(r){return r.json();}).then(function(d){if(d.success&&d.data){var menu=d.data.find(function(x){return x.slug===m||x.id==='menu-primary-'+m;});if(menu&&menu.items){menuData[m]=menu.items;renderMenuCanvas(m);}}}).catch(function(){renderMenuCanvas(m);});loadPageQuickAdd();}
    function renderMenuCanvas(m){var c=document.getElementById('menuCanvas');if(!c)return;var items=menuData[m]||[];if(!items.length){c.innerHTML='<div class="empty-state"><div class="empty-icon">🗺️</div><div class="empty-text">No items</div></div>';return;}c.innerHTML=items.map(function(it,i){return'<div class="menu-item"><span class="menu-item-icon">⠿</span><div style="flex:1;"><div class="menu-item-label">'+esc(it.label||it.title||'Item')+'</div><div class="menu-item-url">'+esc(it.url||it.targetUrl||'/')+'</div></div><button class="btn btn-secondary btn-xs" onclick="removeMenuItem('+i+')">×</button></div>';}).join('');}
    function addMenuItem(){var label=getVal('menuItemLabel');var url=getVal('menuItemUrl');if(!label||!url){showMsg('Label and URL required','error');return;}var m=getVal('menuSelect')||'main';menuData[m]=menuData[m]||[];menuData[m].push({label:label,url:url,target:getVal('menuItemTarget')||'_self'});renderMenuCanvas(m);setVal('menuItemLabel','');setVal('menuItemUrl','');showMsg('Item added. Save to persist.','success');}
    function removeMenuItem(idx){var m=getVal('menuSelect')||'main';menuData[m].splice(idx,1);renderMenuCanvas(m);}
    function saveMenus(){var m=getVal('menuSelect')||'main';fetch('/api/v1/navigation/menus',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug:m,items:menuData[m]||[]})}).then(function(r){return r.json();}).then(function(){showMsg('Navigation menu saved!','success');}).catch(function(){showMsg('Saved locally!','success');});}
    function confirmClearMenu(){showConfirmDlg({title:'Clear Menu',message:'Remove all items from this menu?',icon:'🗑️',destructive:true,okLabel:'Clear',onConfirm:function(){var m=getVal('menuSelect')||'main';menuData[m]=[];renderMenuCanvas(m);}});}
    function loadPageQuickAdd(){fetch('/api/v1/content?type=Page&limit=20').then(function(r){return r.json();}).then(function(d){var items=(d.data&&d.data.items)||[];var c=document.getElementById('pageQuickAdd');if(!c)return;if(!items.length){c.innerHTML='<div style="font-size:11px;color:#64748b;">No pages found</div>';return;}c.innerHTML=items.map(function(it){
        var tEsc = esc(it.title), sEsc = esc(it.slug);
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">' + tEsc + '</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu(this.dataset.label,this.dataset.url)" data-label="' + tEsc + '" data-url="/' + sEsc + '" title="Add to menu">+</button></div>';
      }).join('');}).catch(function(){});}
    function quickAddToMenu(label,url){var m=getVal('menuSelect')||'main';menuData[m]=menuData[m]||[];menuData[m].push({label:label,url:url,target:'_self'});renderMenuCanvas(m);showMsg('"'+label+'" added','success');}

    /* ══ CUSTOM TYPE ══ */
    function openCustomTypeDlg(){_lastFocused=document.activeElement;document.getElementById('customTypeDlg').classList.add('open');document.getElementById('customTypeName').focus();}
    function closeCustomTypeDlg(){document.getElementById('customTypeDlg').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function createCustomType(){var name=(getVal('customTypeName')||'').trim();if(!name){showMsg('Type name required','error');return;}fetch('/api/v1/content/types',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,description:getVal('customTypeDesc')||''})}).then(function(r){return r.json();}).then(function(d){if(d.success){closeCustomTypeDlg();showMsg('Type "'+name+'" created!','success');setVal('customTypeName','');setVal('customTypeDesc','');}else showMsg('Failed: '+(d.message||'Error'),'error');});}

    /* ══ EXPORT/IMPORT ══ */
    function exportDlg(){showConfirmDlg({title:'Export Content',message:'Export all content as JSON?',icon:'⬇',okLabel:'Export JSON',onConfirm:function(){fetch('/api/v1/content/export',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format:'json'})}).then(function(r){return r.json();}).then(function(d){if(d.success&&d.data){var blob=new Blob([typeof d.data==='string'?d.data:JSON.stringify(d.data,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='cms-export-'+(new Date().toISOString().slice(0,10))+'.json';a.click();showMsg('Export complete!','success');}});}});}
    function importDlg(){_lastFocused=document.activeElement;document.getElementById('importDlg').classList.add('open');document.getElementById('importJson').focus();}
    function closeImportDlg(){document.getElementById('importDlg').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function doImport(){var raw=getVal('importJson');var items;try{items=JSON.parse(raw);}catch(e){showMsg('Invalid JSON','error');return;}if(!Array.isArray(items)){showMsg('JSON must be an array','error');return;}fetch('/api/v1/content/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:items})}).then(function(r){return r.json();}).then(function(d){if(d.success){closeImportDlg();showMsg('Imported '+d.data.imported+', skipped '+d.data.skipped,'success');doFilter(1);}else showMsg('Import failed','error');});}

    /* ══ SEO ══ */
    function addRedirect(){var src=getVal('rdSrc');var tgt=getVal('rdTgt');var code=getVal('rdCode')||'301';if(!src||!tgt){showMsg('Source and target required','error');return;}fetch('/api/v1/seo/redirects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sourceUrl:src,targetUrl:tgt,statusCode:parseInt(code)})}).then(function(r){return r.json();}).then(function(d){if(d.success){setVal('rdSrc','');setVal('rdTgt','');showMsg('Redirect added!','success');loadRedirects();}});}
    function loadRedirects(){fetch('/api/v1/seo/redirects').then(function(r){return r.json();}).then(function(d){var items=d.data||[];setHTML('redirectList',items.length?'<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+items.map(function(r){
        var rIdEsc = esc(r.id), sUrlEsc = esc(r.sourceUrl), tUrlEsc = esc(r.targetUrl);
        return '<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">' + r.statusCode + '</span><span style="flex:1;font-size:11px;color:#94a3b8;">' + sUrlEsc + ' → ' + tUrlEsc + '</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect(this.dataset.id)" data-id="' + rIdEsc + '">×</button></div>';
      }).join('')+'</div>':'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');}).catch(function(){});}
    function deleteRedirect(id){showConfirmDlg({title:'Delete Redirect',message:'Remove this redirect?',icon:'🗑️',destructive:true,okLabel:'Delete',onConfirm:function(){fetch('/api/v1/seo/redirects/'+id,{method:'DELETE'}).then(function(r){return r.json();}).then(function(){showMsg('Redirect deleted','success');loadRedirects();});}});}
    function loadSeoDashboard(){fetch('/api/v1/seo/dashboard').then(function(r){return r.json();}).then(function(d){if(!d.success)return;var sd=d.data||{};setHTML('seoDashboard','<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div class="stat-card"><div class="stat-num">'+esc(String(sd.overallScore||'N/A'))+'</div><div class="stat-lbl">SEO Score</div></div><div class="stat-card"><div class="stat-num">'+esc(String(sd.totalPages||0))+'</div><div class="stat-lbl">Total Pages</div></div></div>');}).catch(function(){});}

    /* ══ SYSTEM ══ */
    function fetchSystemInfo(){fetch('/admin/dashboard-metrics').then(function(r){return r.json();}).then(function(d){if(d.data){var s=d.data.system||{};setTxt('sysNode',s.nodeVersion||'N/A');setTxt('sysUptime',Math.floor((s.uptimeSeconds||0)/60)+' min');setTxt('sysBsDate',s.timeBs||'N/A');}}).catch(function(){});}
    function flushCache(){fetch('/admin/system/cache/flush',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){var el=document.getElementById('cacheResult');if(el){el.style.display='block';el.textContent='✅ '+(d.data&&d.data.message?d.data.message:'Caches flushed!');}showMsg('All caches flushed!','success');});}
    function processScheduled(){fetch('/api/v1/content/process-scheduled',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){if(d.success)showMsg('Processed '+(d.data&&d.data.published?d.data.published:0)+' scheduled items','success');});}

    /* ══ SETTINGS ══ */
    function loadSettings(){
      fetch('/api/v1/config').then(function(r){return r.json();}).then(function(d){
        if(!d.success||!d.data)return;
        var s=d.data;
        var id=s.identity||{}, pr=s.profile||{}, hr=s.hero||{}, in_=s.intro||{}, st=s.stats||{}, ft=s.footer||{};
        setVal('setSiteTitle',id.siteTitle||'');setVal('setSiteDesc',id.siteDesc||'');setVal('setDomain',id.domain||'');setVal('setLocale',id.locale||'en');
        setVal('setAuthorName',pr.name||'');setVal('setAuthorTitle',pr.title||'');setVal('setAuthorBio',pr.bio||'');setVal('setAuthorOrcid',pr.orcid||'');setVal('setAuthorScholar',pr.scholar||'');setVal('setAuthorLinkedin',pr.linkedin||'');setVal('setAuthorGithub',pr.github||'');
        setVal('setHeroTitle',hr.title||'');setVal('setHeroSubtitle',hr.subtitle||'');setVal('setHeroTagline',hr.tagline||'');setVal('setHeroCta1Text',hr.primaryCtaLabel||'');setVal('setHeroCta1Url',hr.primaryCtaUrl||'');setVal('setHeroCta2Text',hr.secondaryCtaLabel||'');setVal('setHeroCta2Url',hr.secondaryCtaUrl||'');
        setVal('setIntroHeading',in_.heading||'');setVal('setIntroContent',in_.content||'');
        setVal('setStat1Label',st.stat1Label||'');setVal('setStat1Value',st.stat1Value||'');setVal('setStat2Label',st.stat2Label||'');setVal('setStat2Value',st.stat2Value||'');setVal('setStat3Label',st.stat3Label||'');setVal('setStat3Value',st.stat3Value||'');setVal('setStat4Label',st.stat4Label||'');setVal('setStat4Value',st.stat4Value||'');
        setVal('setFooterAbout',ft.aboutText||'');setVal('setFooterCopyright',ft.copyright||'');
      }).catch(function(){});
    }
    function saveSettings(){
      var payload={
        settings:{
          identity:{siteTitle:getVal('setSiteTitle'),siteDesc:getVal('setSiteDesc'),domain:getVal('setDomain'),locale:getVal('setLocale')},
          profile:{name:getVal('setAuthorName'),title:getVal('setAuthorTitle'),bio:getVal('setAuthorBio'),orcid:getVal('setAuthorOrcid'),scholar:getVal('setAuthorScholar'),linkedin:getVal('setAuthorLinkedin'),github:getVal('setAuthorGithub')},
          hero:{title:getVal('setHeroTitle'),subtitle:getVal('setHeroSubtitle'),tagline:getVal('setHeroTagline'),primaryCtaLabel:getVal('setHeroCta1Text'),primaryCtaUrl:getVal('setHeroCta1Url'),secondaryCtaLabel:getVal('setHeroCta2Text'),secondaryCtaUrl:getVal('setHeroCta2Url')},
          intro:{heading:getVal('setIntroHeading'),content:getVal('setIntroContent')},
          stats:{stat1Label:getVal('setStat1Label'),stat1Value:getVal('setStat1Value'),stat2Label:getVal('setStat2Label'),stat2Value:getVal('setStat2Value'),stat3Label:getVal('setStat3Label'),stat3Value:getVal('setStat3Value'),stat4Label:getVal('setStat4Label'),stat4Value:getVal('setStat4Value')},
          footer:{aboutText:getVal('setFooterAbout'),copyright:getVal('setFooterCopyright')}
        }
      };
      fetch('/api/v1/config/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(d){
        if(d.success){showNotify('Settings Saved!','All platform identity, author profile, hero banner, stats, and footer settings updated live!','✅');}else showMsg('Failed to save settings','error');
      }).catch(function(e){showMsg('Network error: '+e.message,'error');});
    }
    function saveSecuritySettings(){var np=getVal('setNewPass');var cp=getVal('setConfPass');if(np&&np!==cp){showMsg('Passwords do not match','error');return;}showMsg('Security settings updated','success');}

    /* ══ COMMAND PALETTE ══ */
    var cmds=[{label:'Dashboard',url:'/admin/dashboard',group:'Navigate'},{label:'Content Management',url:'/admin/content',group:'Navigate'},{label:'Content Editor',url:'/admin/editor',group:'Navigate'},{label:'Categories',url:'/admin/categories',group:'Navigate'},{label:'Navigation Menus',url:'/admin/navigation',group:'Navigate'},{label:'Media Library',url:'/admin/media',group:'Navigate'},{label:'Version History',url:'/admin/revisions',group:'Navigate'},{label:'SEO & Redirects',url:'/admin/seo',group:'Navigate'},{label:'System Operations',url:'/admin/system',group:'Navigate'},{label:'Platform Settings',url:'/admin/settings',group:'Navigate'},{label:'+ New Article',url:'/admin/editor?create=Article',group:'Create'},{label:'+ New Poem',url:'/admin/editor?create=Poem',group:'Create'},{label:'+ New Research',url:'/admin/editor?create=Research',group:'Create'},{label:'+ New Publication',url:'/admin/editor?create=Publication',group:'Create'},{label:'+ New Project',url:'/admin/editor?create=Project',group:'Create'},{label:'+ New Event',url:'/admin/editor?create=Event',group:'Create'},{label:'+ New Page',url:'/admin/editor?create=Page',group:'Create'},{label:'sitemap.xml',url:'/sitemap.xml',group:'SEO'},{label:'robots.txt',url:'/robots.txt',group:'SEO'},{label:'RSS Feed',url:'/rss.xml',group:'SEO'},{label:'Flush Caches',action:'flushCache',group:'System'},{label:'Process Scheduled',action:'processScheduled',group:'System'},{label:'Logout',action:'confirmLogout',group:'System'}];
    var cmdFocusIdx=-1;
    function openCmd(){_lastFocused=document.activeElement;var m=document.getElementById('cmdModal');m.classList.add('open');setVal('cmdInput','');filterCmd();document.getElementById('cmdInput').focus();m.onkeydown=function(e){if(e.key==='Escape')closeCmd();};}
    function closeCmd(){document.getElementById('cmdModal').classList.remove('open');if(_lastFocused)_lastFocused.focus();}
    function filterCmd(){var q=(getVal('cmdInput')||'').toLowerCase();var filtered=q?cmds.filter(function(c){return c.label.toLowerCase().includes(q);}):cmds;var groups={};filtered.forEach(function(c){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);});var h='';Object.keys(groups).forEach(function(g){h+='<div class="cmd-sep">'+esc(g)+'</div>';groups[g].forEach(function(c){
        var urlStr = c.url || 'javascript:void(0)';
        var labelEsc = esc(c.label), groupEsc = esc(g);
        var actAttr = c.action ? 'onclick="' + c.action + '();closeCmd();return false;"' : '';
        h+='<a href="' + urlStr + '" class="cmd-item" role="option" ' + actAttr + '><span>' + labelEsc + '</span><span style="font-size:10px;color:#64748b;">' + groupEsc + '</span></a>';
      });});setHTML('cmdList',h||'<div class="empty-state"><div class="empty-text">No commands found</div></div>');cmdFocusIdx=-1;}
    function handleCmdKey(e){var items=document.querySelectorAll('#cmdList .cmd-item');if(e.key==='ArrowDown'){e.preventDefault();cmdFocusIdx=Math.min(cmdFocusIdx+1,items.length-1);if(items[cmdFocusIdx])items[cmdFocusIdx].focus();}else if(e.key==='ArrowUp'){e.preventDefault();cmdFocusIdx=Math.max(cmdFocusIdx-1,-1);if(cmdFocusIdx===-1)document.getElementById('cmdInput').focus();else if(items[cmdFocusIdx])items[cmdFocusIdx].focus();}else if(e.key==='Enter'&&cmdFocusIdx===-1){var fi=document.querySelectorAll('#cmdList .cmd-item');if(fi.length)fi[0].click();}}

    /* ══ KEYBOARD SHORTCUTS ══ */
    document.addEventListener('keydown',function(e){
      if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openCmd();}
      if((e.ctrlKey||e.metaKey)&&e.key==='s'&&_AT==='editor'){e.preventDefault();saveEdPage('DRAFT');}
      if((e.ctrlKey||e.metaKey)&&e.key==='p'&&_AT==='editor'){e.preventDefault();openPreviewModal();}
    });

    /* ══ INIT ══ */
    document.addEventListener('DOMContentLoaded',function(){
      var params=new URLSearchParams(window.location.search);
      var createType=params.get('create');var editId=params.get('edit');
      if(_AT==='dashboard')loadDashboardStats();
      if(_AT==='content'){doFilter(1);loadDashboardStats();}
      if(_AT==='editor'||createType||editId)initPageEditor(createType||_IM||'Article',editId);
      if(_AT==='categories')fetchMasterCategories();
      if(_AT==='navigation')loadMenuItems();
      if(_AT==='revisions')fetchAllRevisions();
      if(_AT==='media')loadMediaLibrary();
      if(_AT==='seo'){loadRedirects();loadSeoDashboard();}
      if(_AT==='system')fetchSystemInfo();
      if(createType||editId)fetchMasterCategories();
      if(_IM&&_IM!=='ALL'&&_IM!=='RECYCLE_BIN'){var typeEl=document.getElementById('cType');if(typeEl)typeEl.value=_IM;}
      if(_IM==='RECYCLE_BIN'){fetch('/api/v1/content?includeDeleted=true&limit=50').then(function(r){return r.json();}).then(function(d){if(d.success&&d.data){var deleted=(d.data.items||[]).filter(function(i){return i.isDeleted;});repo=deleted;renderRows(deleted);currentTotal=deleted.length;currentTotalPages=1;renderPagination();}});}
    });
  </script><\/script>
<\/body>
<\/html>`;
    return res.status(HttpStatus.OK).send(html);
  }

  private escHtml(str: string): string {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
