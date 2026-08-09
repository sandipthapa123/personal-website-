const fs = require('fs');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure TenantConfigService is imported and injected into constructor
if (!content.includes('import { TenantConfigService }')) {
  content = content.replace(
    "import { UniversalContentService } from '../content/universal-content.service';",
    "import { UniversalContentService } from '../content/universal-content.service';\nimport { TenantConfigService } from '../config/tenant-config.service';"
  );
}

if (!content.includes('private configService: TenantConfigService')) {
  content = content.replace(
    'private contentService: UniversalContentService,',
    'private contentService: UniversalContentService,\n    private configService: TenantConfigService,'
  );
}

// 2. Add POST route @Post('admin/settings/save') if not present
if (!content.includes("@Post('admin/settings/save')")) {
  const routeCode = `\n  @Post('admin/settings/save')\n  @ApiOperation({ summary: 'Save platform settings from admin UI' })\n  async savePlatformSettings(@Body() body: any, @Res() res: Response) {\n    const tid = 'default-tenant-id';\n    await this.configService.saveBulkSettings(tid, body.settings || body);\n    return res.status(HttpStatus.OK).json({ success: true, message: 'Settings saved successfully!' });\n  }\n`;
  content = content.replace(
    "  @Post('admin/system/cache/flush')",
    `${routeCode}\n  @Post('admin/system/cache/flush')`
  );
}

// 3. Replace HTML tab-settings
const oldSettingsHtmlTarget = `<div id="tab-settings" class="tab-section \${activeTab === 'settings' ? 'active' : ''}" role="tabpanel">`;
const endSettingsHtmlTarget = `</div>\n    </div>\n  </main>`;

const newSettingsHtml = `<div id="tab-settings" class="tab-section \${activeTab === 'settings' ? 'active' : ''}" role="tabpanel">
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
    </div>`;

const startIdx = content.indexOf(oldSettingsHtmlTarget);
if (startIdx !== -1) {
  const endIdx = content.indexOf('<!-- WCAG 2.2 AAA CONFIRM DIALOG -->', startIdx);
  if (endIdx !== -1) {
    content = content.substring(0, startIdx) + newSettingsHtml + '\n  </main>\n\n  ' + content.substring(endIdx);
  }
}

// 4. Update JS saveSettings & loadSettings functions
const oldSettingsJs = `/* ══ SETTINGS ══ */\n    function saveSettings(){showMsg('Platform settings saved','success');}`;
const newSettingsJs = `/* ══ SETTINGS ══ */
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
    }`;

if (content.includes(oldSettingsJs)) {
  content = content.replace(oldSettingsJs, newSettingsJs);
}

// Add loadSettings call to init function if present
if (!content.includes('loadSettings()')) {
  content = content.replace('if(_activeTab===\'revisions\')fetchAllRevisions();', 'if(_activeTab===\'revisions\')fetchAllRevisions();if(_activeTab===\'settings\')loadSettings();');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully upgraded AdminController settings UI and backend handler!');
