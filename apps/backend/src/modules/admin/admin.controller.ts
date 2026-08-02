import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('admin')
@Controller()
export class AdminController {
  @Get('admin/login')
  @ApiOperation({ summary: 'Backend-Served Admin Login HTML Page' })
  getBackendAdminLoginPage(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Backend Admin Login | Sandip Thapa CMS Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090d16; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 440px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
    .logo { width: 48px; height: 48px; background: #0284c7; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px; color: #fff; margin: 0 auto 16px; }
    h1 { text-align: center; font-size: 22px; font-weight: 800; color: #fff; }
    p.sub { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 4px; margin-bottom: 24px; }
    .group { margin-bottom: 16px; }
    label { display: block; font-size: 11px; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 14px; background: #020617; border: 1px solid #1e293b; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: #0284c7; }
    button { width: 100%; padding: 12px; background: #0284c7; border: none; border-radius: 8px; color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; transition: background 0.2s; margin-top: 8px; }
    button:hover { background: #0369a1; }
    .status { padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; margin-bottom: 16px; display: none; }
    .status.success { background: rgba(6, 78, 59, 0.8); border: 1px solid #065f46; color: #6ee7b7; }
    .status.error { background: rgba(136, 19, 55, 0.8); border: 1px solid #9f1239; color: #fecdd3; }
    .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">ST</div>
    <h1>Backend Admin Portal</h1>
    <p class="sub">100% NestJS Backend Control Engine (Port 4000)</p>
    
    <div id="status" class="status"></div>

    <form id="loginForm">
      <div class="group">
        <label>Email Address</label>
        <input type="email" id="email" value="lafasandip15@gmail.com" required />
      </div>
      <div class="group">
        <label>Password</label>
        <input type="password" id="pass" value="Sandip@123" required />
      </div>
      <button type="submit" id="submitBtn">Authenticate with Backend</button>
    </form>

    <div class="footer">
      Single Source of Truth Admin Console
    </div>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('status');
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.innerText = 'Authenticating...';

      const email = document.getElementById('email').value;
      const password = document.getElementById('pass').value;

      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.accessToken) {
          sessionStorage.setItem('cms_token', data.accessToken);
          status.className = 'status success';
          status.style.display = 'block';
          status.innerText = '✓ Authenticated! Loading Backend Dashboard...';
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 800);
        } else {
          throw new Error(data.message || 'Login failed');
        }
      } catch (err) {
        status.className = 'status error';
        status.style.display = 'block';
        status.innerText = '⚠️ ' + err.message;
        submitBtn.disabled = false;
        submitBtn.innerText = 'Authenticate with Backend';
      }
    });
  </script>
</body>
</html>`;
    return res.status(200).send(html);
  }

  @Get('admin/dashboard')
  @Get('admin')
  @ApiOperation({ summary: 'Backend-Served Admin Dashboard HTML Page' })
  getBackendAdminDashboardPage(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Backend Admin Console | Sandip Thapa CMS Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #020617; color: #f8fafc; min-height: 100vh; }
    header { background: #0f172a; border-bottom: 1px solid #1e293b; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo { width: 36px; height: 36px; background: #0284c7; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; color: #fff; }
    .title { font-weight: 800; font-size: 15px; }
    .sub { font-size: 11px; color: #94a3b8; }
    .user-pill { font-size: 12px; color: #38bdf8; background: rgba(2, 132, 199, 0.15); border: 1px solid rgba(2, 132, 199, 0.3); padding: 4px 12px; border-radius: 20px; font-weight: 700; }
    main { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .banner { background: linear-gradient(135deg, rgba(2,132,199,0.2), rgba(15,23,42,0.9)); border: 1px solid rgba(2,132,199,0.3); border-radius: 16px; padding: 28px; margin-bottom: 24px; }
    .banner h2 { font-size: 24px; font-weight: 900; color: #fff; margin-bottom: 6px; }
    .banner p { font-size: 13px; color: #94a3b8; max-width: 700px; line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
    .card label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px; }
    .card .val { font-size: 20px; font-weight: 900; color: #38bdf8; }
    .card .desc { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
    .link-btn { display: block; padding: 14px; background: #020617; border: 1px solid #1e293b; border-radius: 8px; color: #e2e8f0; text-decoration: none; font-weight: 700; font-size: 13px; transition: all 0.2s; }
    .link-btn:hover { border-color: #0284c7; color: #38bdf8; background: #0f172a; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo">ST</div>
      <div>
        <div class="title">Backend Admin Control Console</div>
        <div class="sub">100% NestJS Backend Engine (Port 4000)</div>
      </div>
    </div>
    <div class="user-pill">
      SUPER_ADMIN: lafasandip15@gmail.com
    </div>
  </header>

  <main>
    <div class="banner">
      <h2>Backend Admin Single Source of Truth</h2>
      <p>All administrative controls, user authentication, navigation menus, page region blocks, feature flags, and design token compilers exist exclusively in the NestJS Backend. Frontend is strictly a presentation layer.</p>
    </div>

    <div class="grid">
      <div class="card">
        <label>Backend Gateway</label>
        <div class="val" style="color: #4ade80;">● Active (Port 4000)</div>
        <div class="desc">Global prefix: /api/v1</div>
      </div>
      <div class="card">
        <label>OpenAPI Swagger Docs</label>
        <div class="val"><a href="/api/docs" target="_blank" style="color: #38bdf8; text-decoration: none;">/api/docs ↗</a></div>
        <div class="desc">Interactive REST endpoint testing</div>
      </div>
      <div class="card">
        <label>Presentation Layer (Frontend)</label>
        <div class="val"><a href="http://localhost:3000" target="_blank" style="color: #c084fc; text-decoration: none;">localhost:3000 ↗</a></div>
        <div class="desc">Next.js Renderer Application</div>
      </div>
      <div class="card">
        <label>System Health Engine</label>
        <div class="val"><a href="/api/v1/health" target="_blank" style="color: #34d399; text-decoration: none;">/api/v1/health ↗</a></div>
        <div class="desc">Operational Diagnostics API</div>
      </div>
    </div>

    <div class="card">
      <label>Backend Control REST APIs</label>
      <div class="links-grid">
        <a class="link-btn" href="/api/docs" target="_blank">📚 Swagger API Specification</a>
        <a class="link-btn" href="/api/v1/navigation/main" target="_blank">🌳 Main Navigation Tree JSON</a>
        <a class="link-btn" href="/api/v1/renderer/page?slug=/" target="_blank">📐 12-Section Homepage Schema</a>
        <a class="link-btn" href="/api/v1/search?query=research" target="_blank">🔍 Universal Search Engine API</a>
        <a class="link-btn" href="/api/v1/tokens/compiled-css" target="_blank">🎨 Design Tokens CSS Engine</a>
        <a class="link-btn" href="/api/v1/health" target="_blank">🩺 Diagnostics & System Health</a>
      </div>
    </div>
  </main>
</body>
</html>`;
    return res.status(200).send(html);
  }
}
