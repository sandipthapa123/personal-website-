const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Extract script section
const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

let scriptStart = content.indexOf(scriptStartStr);
let scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

let scriptCode = content.substring(scriptStart + 8, scriptEnd);

// Let's analyze how scriptCode is evaluated:
// In scriptCode, any inline HTML event listener like `onclick="func(...)"` or string concat inside `map(...)`:
// Replace all single quote escaping issues in string concatenations like `\'+esc(...)` or `+''` or `\'')"`

// Common broken patterns inside string concatenations:
// 1. `\'+esc(` -> `\'\'+esc(`
// 2. `+\'\')` -> `+\'\\\')`
// 3. `+\'\',` -> `+\'\\\',`
// 4. `+''` -> `+\'\\\'`

// Better yet, let's write clean ES6 template literal replacements for all functions in the script tag!

// Let's define clean implementations for every function in the script tag that renders HTML:

// 1. renderCatTable
scriptCode = scriptCode.replace(
  /function renderCatTable\(\)[\s\S]*?function onCatNameInput/,
  `function renderCatTable(){
      var tb=document.getElementById('catTableBody');if(!tb)return;
      var q=(getVal('catSearch')||'').toLowerCase();
      var items=masterCategories.filter(function(c){return c.name.toLowerCase().includes(q)||c.slug.toLowerCase().includes(q);});
      if(!items.length){tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No categories found</div></div></td></tr>';return;}
      tb.innerHTML=items.map(function(c){var parent=masterCategories.find(function(p){return p.id===c.parentId;});
        var pName=parent?esc(parent.name):'<span style="color:#64748b;">Root</span>';
        return '<tr><td><strong>'+esc(c.icon||'📁')+' '+esc(c.name)+'</strong><div style="font-size:10px;color:#64748b;">/'+esc(c.slug)+'</div></td><td>'+pName+'</td><td><span class="badge badge-sky">'+(c.count||0)+' items</span></td><td><span class="badge badge-green">'+esc(c.status||'ACTIVE')+'</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(\\\''+esc(c.id)+'\\\')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(\\\''+esc(c.id)+'\\\',\\\''+esc(c.name)+'\\\')">Delete</button></td></tr>';
      }).join('');
    }
    function onCatNameInput`
);

// 2. renderRows
scriptCode = scriptCode.replace(
  /function renderRows\(items\)[\s\S]*?function renderPagination/,
  `function renderRows(items){
      var tb=document.getElementById('cTableBody');if(!tb)return;
      if(!items||!items.length){tb.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No content found</div><div class="empty-sub">Adjust filters or create new content above.</div></div></td></tr>';return;}
      var sm={PUBLISHED:'badge-green',DRAFT:'badge-gray',REVIEW:'badge-amber',SCHEDULED:'badge-purple',ARCHIVED:'badge-orange',PRIVATE:'badge-red'};
      tb.innerHTML=items.map(function(it){
        var bdg=(it.contentTypes||[]).map(function(t){return '<span class="badge badge-sky" style="margin:1px;">'+esc(t)+'</span>';}).join('');
        var sBadge='<span class="badge '+(sm[it.status]||'badge-gray')+'">'+esc(it.status)+'</span>';
        var updated=it.updatedAt?new Date(it.updatedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
        var isDel=it.isDeleted;
        var actions=isDel?[
          '<a href="/admin/editor?edit='+esc(it.id)+'" class="btn btn-secondary btn-xs">View</a>',
          '<button class="btn btn-success btn-xs" onclick="actionItem(\\\'restore\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">↩ Restore</button>',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'permanent-delete\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">✕ Purge</button>'
        ]:[
          '<a href="/admin/editor?edit='+esc(it.id)+'" class="btn btn-secondary btn-xs">✏ Edit</a>',
          it.status==='PUBLISHED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'unpublish\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">○ Unpub</button>':'<button class="btn btn-success btn-xs" onclick="actionItem(\\\'publish\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">✓ Pub</button>',
          '<button class="btn btn-teal btn-xs" onclick="actionItem(\\\'duplicate\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">⧉ Clone</button>',
          '<button class="btn btn-purple btn-xs" onclick="openVersionModal(\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">🕐 History</button>',
          it.status!=='SCHEDULED'?'<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg(\\\''+esc(it.id)+'\\\')">📅 Sched</button>':'',
          it.status!=='ARCHIVED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'archive\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">📦 Archive</button>':'',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'delete\\\',\\\''+esc(it.id)+'\\\',\\\''+esc(it.title)+'\\\')">🗑 Trash</button>'
        ];
        return '<tr><td><input type="checkbox" class="rcb" value="'+esc(it.id)+'" onchange="updateSelection(this)" /></td>'+
          '<td style="max-width:260px;"><div style="font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+esc(it.title)+'">'+esc(it.title)+'</div><div style="font-size:10px;color:#64748b;">/'+esc(it.slug)+'</div></td>'+
          '<td>'+bdg+'</td><td>'+sBadge+'</td>'+
          '<td><span class="badge badge-blue">'+esc(it.locale||'en')+'</span></td>'+
          '<td style="font-size:11px;color:#64748b;white-space:nowrap;">'+updated+'</td>'+
          '<td><div style="display:flex;gap:3px;flex-wrap:wrap;">'+actions.join('')+'</div></td></tr>';
      }).join('');
    }
    function renderPagination`
);

// 3. openVersionModal & loadRevisions
scriptCode = scriptCode.replace(
  /function openVersionModal\(id,title\)[\s\S]*?function closeVersionModal/,
  `function openVersionModal(id,title){
      _versionContentId=id;_lastFocused=document.activeElement;
      document.getElementById('versionModalTitle').textContent='🕐 Version History — '+title;
      setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div>');
      document.getElementById('versionModal').classList.add('open');
      fetch('/api/v1/content/'+id+'/revisions').then(function(r){return r.json();}).then(function(d){
        if(!d.success||!d.data||!d.data.length){setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No revisions yet</div></div>');return;}
        setHTML('versionModalBody','<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+d.data.map(function(rev,i){return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;"><span class="rev-badge">v'+(rev.version||d.data.length-i)+'</span><span style="font-size:12px;font-weight:700;color:#e2e8f0;">'+esc(rev.title)+'</span>'+(i===0?'<span class="badge badge-green" style="font-size:9px;">Current</span>':'')+'</div><div class="rev-meta">'+new Date(rev.updatedAt).toLocaleString()+'</div></div>'+(i>0?'<button class="btn btn-teal btn-xs" onclick="restoreRevision(\\\''+esc(id)+'\\\',\\\''+esc(rev.id)+'\\\')">↩ Restore</button>':'')+'</div>';}).join('')+'</div>');
      }).catch(function(){setHTML('versionModalBody','<div class="empty-state"><div class="empty-icon">❌</div><div class="empty-text">Could not load revisions</div></div>');});
    }
    function closeVersionModal`
);

scriptCode = scriptCode.replace(
  /function loadRevisions\(id\)[\s\S]*?function onTitleInputPage/,
  `function loadRevisions(id){
      if(!id){setHTML('revList','<div class="empty-state"><div class="empty-icon">🕐</div><div class="empty-text">Select a content item</div></div>');return;}
      setHTML('revList','<div class="empty-state"><div class="empty-icon">⏳</div><div class="empty-text">Loading...</div></div>');
      fetch('/api/v1/content/'+id+'/revisions').then(function(r){return r.json();}).then(function(d){
        if(!d.success||!d.data||!d.data.length){setHTML('revList','<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No revisions yet</div></div>');setTxt('revCount','0 revisions');return;}
        setTxt('revCount',d.data.length+' revision'+(d.data.length!==1?'s':''));
        setHTML('revList','<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+d.data.map(function(rev,i){return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span class="rev-badge">v'+(rev.version||(d.data.length-i))+'</span><span style="font-size:13px;font-weight:700;color:#e2e8f0;">'+esc(rev.title)+'</span>'+(i===0?'<span class="badge badge-green" style="font-size:9px;">Current</span>':'')+'</div><div class="rev-meta">Saved '+new Date(rev.updatedAt).toLocaleString('en-GB')+'</div><div style="font-size:11px;color:#475569;margin-top:4px;">'+esc((rev.content||'').slice(0,120))+'...</div></div>'+(i>0?'<button class="btn btn-teal btn-sm" onclick="restoreRevision(\\\''+esc(id)+'\\\',\\\''+esc(rev.id)+'\\\')">↩ Restore</button>':'')+'</div>';}).join('')+'</div>');
      });
    }
    function onTitleInputPage`
);

// 4. renderMediaPicker & renderMediaGrid
scriptCode = scriptCode.replace(
  /function renderMediaPicker\(assets\)[\s\S]*?function filterMediaPicker/,
  `function renderMediaPicker(assets){var g=document.getElementById('mpGrid');if(!g)return;if(!assets.length){g.innerHTML='<div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">No media. Upload to get started.</div></div>';return;}g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return '<div class="media-thumb" onclick="selectMediaAsset(\\\''+esc(a.url)+'\\\')" tabindex="0" role="button" aria-label="Select '+esc(a.filename)+'" onkeydown="if(event.key===\\\'Enter\\\'||event.key===\\\' \\\')selectMediaAsset(\\\''+esc(a.url)+'\\\')"><div class="media-thumb-img">'+(isImg?'<img src="'+esc(a.url)+'" alt="'+esc(a.altText||a.filename)+'" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />':'<span style="font-size:32px;">'+(a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂')+'</span>')+'</div><div class="media-thumb-info"><div class="media-thumb-name" title="'+esc(a.filename)+'">'+esc(a.filename)+'</div><div class="media-thumb-size">'+formatBytes(a.sizeBytes||0)+'</div></div></div>';}).join('');}
    function filterMediaPicker`
);

scriptCode = scriptCode.replace(
  /function renderMediaGrid\(assets\)[\s\S]*?function confirmDeleteMedia/,
  `function renderMediaGrid(assets){var g=document.getElementById('mediaGrid');var em=document.getElementById('mediaEmpty');if(!g)return;if(!assets.length){if(em)em.style.display='block';g.innerHTML='';return;}if(em)em.style.display='none';g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return '<div class="media-thumb"><div class="media-thumb-img">'+(isImg?'<img src="'+esc(a.url)+'" alt="'+esc(a.altText||a.filename)+'" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />':'<span style="font-size:32px;">'+(a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂')+'</span>')+'</div><div class="media-thumb-info"><div class="media-thumb-name">'+esc(a.filename)+'</div><div class="media-thumb-size">'+formatBytes(a.sizeBytes||0)+'</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard(\\\''+esc(a.url)+'\\\')">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia(\\\''+esc(a.id)+'\\\',\\\''+esc(a.filename)+'\\\')">Del</button></div></div>';}).join('');}
    function confirmDeleteMedia`
);

// 5. loadPageQuickAdd & loadRedirects
scriptCode = scriptCode.replace(
  /function loadPageQuickAdd\(\)[\s\S]*?function quickAddToMenu/,
  `function loadPageQuickAdd(){fetch('/api/v1/content?type=Page&limit=20').then(function(r){return r.json();}).then(function(d){var items=(d.data&&d.data.items)||[];var c=document.getElementById('pageQuickAdd');if(!c)return;if(!items.length){c.innerHTML='<div style="font-size:11px;color:#64748b;">No pages found</div>';return;}c.innerHTML=items.map(function(it){return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">'+esc(it.title)+'</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu(\\\''+esc(it.title)+'\\\',\\\'/'+esc(it.slug)+'\\\')" title="Add to menu">+</button></div>';}).join('');}).catch(function(){});}
    function quickAddToMenu`
);

scriptCode = scriptCode.replace(
  /function loadRedirects\(\)[\s\S]*?function deleteRedirect/,
  `function loadRedirects(){fetch('/api/v1/seo/redirects').then(function(r){return r.json();}).then(function(d){var items=d.data||[];setHTML('redirectList',items.length?'<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+items.map(function(r){return '<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">'+r.statusCode+'</span><span style="flex:1;font-size:11px;color:#94a3b8;">'+esc(r.sourceUrl)+' → '+esc(r.targetUrl)+'</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect(\\\''+esc(r.id)+'\\\')">×</button></div>';}).join('')+'</div>':'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');}).catch(function(){});}
    function deleteRedirect`
);

// Reassemble and test JS syntax with vm.Script!
const fullNewContent = content.substring(0, scriptStart + 8) + scriptCode + content.substring(scriptEnd);

// Test script JS
const evaluatedJS = scriptCode
  .replace(/<\\\/script>/g, '</script>')
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"');

try {
  new vm.Script(evaluatedJS);
  console.log('TEST PASSED! Script JS is 100% syntactically valid!');
  fs.writeFileSync(filePath, fullNewContent, 'utf8');
  console.log('Saved admin.controller.ts!');
} catch (err) {
  console.error('VM Test Failed:', err.message);
}
