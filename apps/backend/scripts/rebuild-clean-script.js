const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

let scriptStart = content.indexOf(scriptStartStr);
let scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Script boundaries not found!');
  process.exit(1);
}

let scriptCode = content.substring(scriptStart + 8, scriptEnd);

// Let's replace the 10 HTML-rendering functions with clean versions:

// 1. loadDashboardStats (activity item)
scriptCode = scriptCode.replace(
  /setHTML\('recentActivity'[\s\S]*?\)\.catch\(function\(\)\{\}\);/,
  `setHTML('recentActivity',items.map(function(it){
          var titleEsc = esc(it.title), idEsc = esc(it.id), statusEsc = esc(it.status);
          var badgeClass = sm[it.status] || 'badge-gray';
          var typesStr = (it.contentTypes || []).join(', ');
          var dateStr = new Date(it.updatedAt).toLocaleDateString();
          return '<div class="activity-item"><div class="activity-icon" style="background:rgba(2,132,199,.15);">📝</div><div class="activity-details"><div class="activity-title"><a href="/admin/editor?edit=' + idEsc + '" style="color:#e2e8f0;text-decoration:none;">' + titleEsc + '</a></div><div class="activity-time"><span class="badge ' + badgeClass + '">' + statusEsc + '</span> · ' + typesStr + ' · ' + dateStr + '</div></div></div>';
        }).join(''));
      }).catch(function(){});`
);

// 2. renderCatTable
scriptCode = scriptCode.replace(
  /function renderCatTable\(\)[\s\S]*?function onCatNameInput/,
  `function renderCatTable(){
      var tb=document.getElementById('catTableBody');if(!tb)return;
      var q=(getVal('catSearch')||'').toLowerCase();
      var items=masterCategories.filter(function(c){return c.name.toLowerCase().includes(q)||c.slug.toLowerCase().includes(q);});
      if(!items.length){tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No categories found</div></div></td></tr>';return;}
      tb.innerHTML=items.map(function(c){
        var parent=masterCategories.find(function(p){return p.id===c.parentId;});
        var cId = esc(c.id), cName = esc(c.name), cSlug = esc(c.slug), cIcon = esc(c.icon||'📁'), cStatus = esc(c.status||'ACTIVE');
        var pName = parent ? esc(parent.name) : '<span style="color:#64748b;">Root</span>';
        return '<tr><td><strong>' + cIcon + ' ' + cName + '</strong><div style="font-size:10px;color:#64748b;">/' + cSlug + '</div></td><td>' + pName + '</td><td><span class="badge badge-sky">' + (c.count||0) + ' items</span></td><td><span class="badge badge-green">' + cStatus + '</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(\\\'' + cId + '\\\')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(\\\'' + cId + '\\\',\\\'' + cName + '\\\')">Delete</button></td></tr>';
      }).join('');
    }
    function onCatNameInput`
);

// 3. renderRows
scriptCode = scriptCode.replace(
  /function renderRows\(items\)[\s\S]*?function renderPagination/,
  `function renderRows(items){
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
          '<button class="btn btn-success btn-xs" onclick="actionItem(\\\'restore\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">↩ Restore</button>',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'permanent-delete\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">✕ Purge</button>'
        ]:[
          '<a href="/admin/editor?edit='+idEsc+'" class="btn btn-secondary btn-xs">✏ Edit</a>',
          it.status==='PUBLISHED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'unpublish\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">○ Unpub</button>':'<button class="btn btn-success btn-xs" onclick="actionItem(\\\'publish\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">✓ Pub</button>',
          '<button class="btn btn-teal btn-xs" onclick="actionItem(\\\'duplicate\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">⧉ Clone</button>',
          '<button class="btn btn-purple btn-xs" onclick="openVersionModal(\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">🕐 History</button>',
          it.status!=='SCHEDULED'?'<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg(\\\''+idEsc+'\\\')">📅 Sched</button>':'',
          it.status!=='ARCHIVED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'archive\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">📦 Archive</button>':'',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'delete\\\',\\\''+idEsc+'\\\',\\\''+titleEsc+'\\\')">🗑 Trash</button>'
        ];
        return '<tr><td><input type="checkbox" class="rcb" value="'+idEsc+'" onchange="updateSelection(this)" /></td>'+
          '<td style="max-width:260px;"><div style="font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+titleEsc+'">'+titleEsc+'</div><div style="font-size:10px;color:#64748b;">/'+slugEsc+'</div></td>'+
          '<td>'+bdg+'</td><td>'+sBadge+'</td>'+
          '<td><span class="badge badge-blue">'+localeEsc+'</span></td>'+
          '<td style="font-size:11px;color:#64748b;white-space:nowrap;">'+updated+'</td>'+
          '<td><div style="display:flex;gap:3px;flex-wrap:wrap;">'+actions.join('')+'</div></td></tr>';
      }).join('');
    }
    function renderPagination`
);

// 4. openVersionModal
scriptCode = scriptCode.replace(
  /function openVersionModal\(id,title\)[\s\S]*?function closeVersionModal/,
  `function openVersionModal(id,title){
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
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-xs" onclick="restoreRevision(\\\'' + cIdEsc + '\\\',\\\'' + revIdEsc + '\\\')">↩ Restore</button>' : '';
          return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;"><span class="rev-badge">v' + verNum + '</span><span style="font-size:12px;font-weight:700;color:#e2e8f0;">' + revTitleEsc + '</span>' + currBadge + '</div><div class="rev-meta">' + dateStr + '</div></div>' + restBtn + '</div>';
        }).join('')+'</div>');
      }).catch(function(){setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-text">Could not load revisions</div></div>');});
    }
    function closeVersionModal`
);

// 5. loadRevisions
scriptCode = scriptCode.replace(
  /function loadRevisions\(id\)[\s\S]*?function onTitleInputPage/,
  `function loadRevisions(id){
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
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-sm" onclick="restoreRevision(\\\'' + cIdEsc + '\\\',\\\'' + revIdEsc + '\\\')">↩ Restore</button>' : '';
          return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span class="rev-badge">v' + verNum + '</span><span style="font-size:13px;font-weight:700;color:#e2e8f0;">' + revTitleEsc + '</span>' + currBadge + '</div><div class="rev-meta">Saved ' + dateStr + '</div><div style="font-size:11px;color:#475569;margin-top:4px;">' + snippetEsc + '...</div></div>' + restBtn + '</div>';
        }).join('')+'</div>');
      });
    }
    function onTitleInputPage`
);

// 6. renderMediaPicker & renderMediaGrid
scriptCode = scriptCode.replace(
  /function renderMediaPicker\(assets\)[\s\S]*?function filterMediaPicker/,
  `function renderMediaPicker(assets){var g=document.getElementById('mpGrid');if(!g)return;if(!assets.length){g.innerHTML='<div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">No media. Upload to get started.</div></div>';return;}g.innerHTML=assets.map(function(a){
        var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb" onclick="selectMediaAsset(\\\'' + urlEsc + '\\\')" tabindex="0" role="button" aria-label="Select ' + fnameEsc + '" onkeydown="if(event.key===\\\'Enter\\\'||event.key===\\\' \\\')selectMediaAsset(\\\'' + urlEsc + '\\\')"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name" title="' + fnameEsc + '">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div></div>';
      }).join('');}
    function filterMediaPicker`
);

scriptCode = scriptCode.replace(
  /function renderMediaGrid\(assets\)[\s\S]*?function confirmDeleteMedia/,
  `function renderMediaGrid(assets){var g=document.getElementById('mediaGrid');var em=document.getElementById('mediaEmpty');if(!g)return;if(!assets.length){if(em)em.style.display='block';g.innerHTML='';return;}if(em)em.style.display='none';g.innerHTML=assets.map(function(a){
        var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var aIdEsc = esc(a.id), urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard(\\\'' + urlEsc + '\\\')">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia(\\\'' + aIdEsc + '\\\',\\\'' + fnameEsc + '\\\')">Del</button></div></div>';
      }).join('');}
    function confirmDeleteMedia`
);

// 7. loadPageQuickAdd
scriptCode = scriptCode.replace(
  /function loadPageQuickAdd\(\)[\s\S]*?function quickAddToMenu/,
  `function loadPageQuickAdd(){fetch('/api/v1/content?type=Page&limit=20').then(function(r){return r.json();}).then(function(d){var items=(d.data&&d.data.items)||[];var c=document.getElementById('pageQuickAdd');if(!c)return;if(!items.length){c.innerHTML='<div style="font-size:11px;color:#64748b;">No pages found</div>';return;}c.innerHTML=items.map(function(it){
        var tEsc = esc(it.title), sEsc = esc(it.slug);
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">' + tEsc + '</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu(\\\'' + tEsc + '\\\',\\\'/' + sEsc + '\\\')" title="Add to menu">+</button></div>';
      }).join('');}).catch(function(){});}
    function quickAddToMenu`
);

// 8. loadRedirects
scriptCode = scriptCode.replace(
  /function loadRedirects\(\)[\s\S]*?function deleteRedirect/,
  `function loadRedirects(){fetch('/api/v1/seo/redirects').then(function(r){return r.json();}).then(function(d){var items=d.data||[];setHTML('redirectList',items.length?'<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+items.map(function(r){
        var rIdEsc = esc(r.id), sUrlEsc = esc(r.sourceUrl), tUrlEsc = esc(r.targetUrl);
        return '<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">' + r.statusCode + '</span><span style="flex:1;font-size:11px;color:#94a3b8;">' + sUrlEsc + ' → ' + tUrlEsc + '</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect(\\\'' + rIdEsc + '\\\')">×</button></div>';
      }).join('')+'</div>':'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');}).catch(function(){});}
    function deleteRedirect`
);

// 9. filterCmd
scriptCode = scriptCode.replace(
  /function filterCmd\(\)[\s\S]*?function handleCmdKey/,
  `function filterCmd(){var q=(getVal('cmdInput')||'').toLowerCase();var filtered=q?cmds.filter(function(c){return c.label.toLowerCase().includes(q);}):cmds;var groups={};filtered.forEach(function(c){if(!groups[c.group])groups[c.group]=[];groups[c.group].push(c);});var h='';Object.keys(groups).forEach(function(g){h+='<div class="cmd-sep">'+esc(g)+'</div>';groups[g].forEach(function(c){
        var urlStr = c.url || 'javascript:void(0)';
        var labelEsc = esc(c.label), groupEsc = esc(g);
        var actAttr = c.action ? 'onclick="' + c.action + '();closeCmd();return false;"' : '';
        h+='<a href="' + urlStr + '" class="cmd-item" role="option" ' + actAttr + '><span>' + labelEsc + '</span><span style="font-size:10px;color:#64748b;">' + groupEsc + '</span></a>';
      });});setHTML('cmdList',h||'<div class="empty-state"><div class="empty-text">No commands found</div></div>');cmdFocusIdx=-1;}
    function handleCmdKey`
);

// Verify with vm.Script
const evaluatedJS = scriptCode
  .replace(/<\\\/script>/g, '</script>')
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"');

try {
  new vm.Script(evaluatedJS);
  console.log('\n===========================================');
  console.log('🎉 VERIFICATION PASSED: ZERO JS SYNTAX ERRORS!');
  console.log('===========================================\n');
  
  const finalContent = content.substring(0, scriptStart + 8) + scriptCode + content.substring(scriptEnd);
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('Successfully updated admin.controller.ts!');
} catch (err) {
  console.error('\n❌ VM Verification Failed:', err.message);
  const lines = evaluatedJS.split('\n');
  for (let i = 1; i <= lines.length; i++) {
    try {
      new vm.Script(lines.slice(0, i).join('\n'));
    } catch (e) {
      if (!e.message.includes('Unexpected end of input')) {
        console.log(`Error at Line ${i}: ${e.message}`);
        console.log(`Code at Line ${i}: ${lines[i-1]}`);
        break;
      }
    }
  }
}
