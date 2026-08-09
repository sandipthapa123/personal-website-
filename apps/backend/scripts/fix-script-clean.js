const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Find script boundaries
const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

let scriptStart = content.indexOf(scriptStartStr);
let scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

// Replace all broken HTML string concatenations in the script with clean ES6 template literals inside JS:

// 1. Category table row rendering
const oldCatRow = `return'<tr><td><strong>'+esc(c.icon||'📁')+' '+esc(c.name)+'</strong><div style="font-size:10px;color:#64748b;">/'+esc(c.slug)+'</div></td><td>'+(parent?esc(parent.name):'<span style="color:#64748b;">Root</span>')+'</td><td><span class="badge badge-sky">'+(c.count||0)+' items</span></td><td><span class="badge badge-green">'+esc(c.status||'ACTIVE')+'</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(\\'\'+esc(c.id)+\'\\')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(\\'\'+esc(c.id)+\'\\',\\\'\'+esc(c.name)+\'\\')">Delete</button></td></tr>';`;

const newCatRow = `return \`<tr><td><strong>\${esc(c.icon||'📁')} \${esc(c.name)}</strong><div style="font-size:10px;color:#64748b;">/\${esc(c.slug)}</div></td><td>\${parent?esc(parent.name):'<span style="color:#64748b;">Root</span>'}</td><td><span class="badge badge-sky">\${c.count||0} items</span></td><td><span class="badge badge-green">\${esc(c.status||'ACTIVE')}</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat('\${esc(c.id)}')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat('\${esc(c.id)}','\${esc(c.name)}')">Delete</button></td></tr>\`;`;

content = content.replace(oldCatRow, newCatRow);

// 2. Dashboard activity item rendering
const oldActItem = `setHTML('recentActivity',items.map(function(it){return'<div class="activity-item"><div class="activity-icon" style="background:rgba(2,132,199,.15);">📝</div><div class="activity-details"><div class="activity-title"><a href="/admin/editor?edit='+esc(it.id)+'" style="color:#e2e8f0;text-decoration:none;">'+esc(it.title)+'</a></div><div class="activity-time"><span class="badge '+(sm[it.status]||'badge-gray')+'">'+esc(it.status)+'</span> · '+(it.contentTypes||[]).join(', ')+' · '+new Date(it.updatedAt).toLocaleDateString()+'</div></div></div>';}).join(''));`;

const newActItem = `setHTML('recentActivity',items.map(function(it){return \`<div class="activity-item"><div class="activity-icon" style="background:rgba(2,132,199,.15);">📝</div><div class="activity-details"><div class="activity-title"><a href="/admin/editor?edit=\${esc(it.id)}" style="color:#e2e8f0;text-decoration:none;">\${esc(it.title)}</a></div><div class="activity-time"><span class="badge \${sm[it.status]||'badge-gray'}">\${esc(it.status)}</span> · \${(it.contentTypes||[]).join(', ')} · \${new Date(it.updatedAt).toLocaleDateString()}</div></div></div>\`;}).join(''));`;

content = content.replace(oldActItem, newActItem);

// 3. Dashboard type breakdown
const oldTypeBreak = `setHTML('typeBreakdown',Object.entries(s.byType).map(function(e){return'<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">'+e[1]+'</div><div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-top:2px;">'+esc(e[0])+'</div></div>';}).join(''));`;

const newTypeBreak = `setHTML('typeBreakdown',Object.entries(s.byType).map(function(e){return \`<div style="background:#020617;border:1px solid #1e293b;border-radius:8px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:900;color:#38bdf8;">\${e[1]}</div><div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;margin-top:2px;">\${esc(e[0])}</div></div>\`;}).join(''));`;

content = content.replace(oldTypeBreak, newTypeBreak);

// 4. Content Table row rendering (renderRows)
const oldRenderRows = `function renderRows(items){
      var tb=document.getElementById('cTableBody');if(!tb)return;
      if(!items||!items.length){tb.innerHTML='<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No content found</div><div class="empty-sub">Adjust filters or create new content above.</div></div></td></tr>';return;}
      var sm={PUBLISHED:'badge-green',DRAFT:'badge-gray',REVIEW:'badge-amber',SCHEDULED:'badge-purple',ARCHIVED:'badge-orange',PRIVATE:'badge-red'};
      tb.innerHTML=items.map(function(it){
        var bdg=(it.contentTypes||[]).map(function(t){return'<span class="badge badge-sky" style="margin:1px;">'+esc(t)+'</span>';}).join('');
        var sBadge='<span class="badge '+(sm[it.status]||'badge-gray')+'">'+esc(it.status)+'</span>';
        var updated=it.updatedAt?new Date(it.updatedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
        var isDel=it.isDeleted;
        var actions=isDel?[
          '<a href="/admin/editor?edit='+esc(it.id)+'" class="btn btn-secondary btn-xs">View</a>',
          '<button class="btn btn-success btn-xs" onclick="actionItem(\\'restore\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">↩ Restore</button>',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\'permanent-delete\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">✕ Purge</button>'
        ]:[
          '<a href="/admin/editor?edit='+esc(it.id)+'" class="btn btn-secondary btn-xs">✏ Edit</a>',
          it.status==='PUBLISHED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\'unpublish\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">○ Unpub</button>':'<button class="btn btn-success btn-xs" onclick="actionItem(\\'publish\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">✓ Pub</button>',
          '<button class="btn btn-teal btn-xs" onclick="actionItem(\\'duplicate\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">⧉ Clone</button>',
          '<button class="btn btn-purple btn-xs" onclick="openVersionModal(\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">🕐 History</button>',
          it.status!=='SCHEDULED'?'<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg(\\''+esc(it.id)+'\\')">📅 Sched</button>':'',
          it.status!=='ARCHIVED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\'archive\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">📦 Archive</button>':'',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\'delete\\',\\''+esc(it.id)+'\\',\\''+esc(it.title)+'\\')">🗑 Trash</button>'
        ];
        return'<tr><td><input type="checkbox" class="rcb" value="'+esc(it.id)+'" onchange="updateSelection(this)" /></td>'+
          '<td style="max-width:260px;"><div style="font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+esc(it.title)+'">'+esc(it.title)+'</div><div style="font-size:10px;color:#64748b;">/'+esc(it.slug)+'</div></td>'+
          '<td>'+bdg+'</td><td>'+sBadge+'</td>'+
          '<td><span class="badge badge-blue">'+esc(it.locale||'en')+'</span></td>'+
          '<td style="font-size:11px;color:#64748b;white-space:nowrap;">'+updated+'</td>'+
          '<td><div style="display:flex;gap:3px;flex-wrap:wrap;">'+actions.join('')+'</div></td></tr>';
      }).join('');
    }`;

const newRenderRows = `function renderRows(items){
      var tb=document.getElementById('cTableBody');if(!tb)return;
      if(!items||!items.length){tb.innerHTML=\`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No content found</div><div class="empty-sub">Adjust filters or create new content above.</div></div></td></tr>\`;return;}
      var sm={PUBLISHED:'badge-green',DRAFT:'badge-gray',REVIEW:'badge-amber',SCHEDULED:'badge-purple',ARCHIVED:'badge-orange',PRIVATE:'badge-red'};
      tb.innerHTML=items.map(function(it){
        var bdg=(it.contentTypes||[]).map(function(t){return \`<span class="badge badge-sky" style="margin:1px;">\${esc(t)}</span>\`;}).join('');
        var sBadge=\`<span class="badge \${sm[it.status]||'badge-gray'}">\${esc(it.status)}</span>\`;
        var updated=it.updatedAt?new Date(it.updatedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}):'—';
        var isDel=it.isDeleted;
        var actions=isDel?[
          \`<a href="/admin/editor?edit=\${esc(it.id)}" class="btn btn-secondary btn-xs">View</a>\`,
          \`<button class="btn btn-success btn-xs" onclick="actionItem('restore','\${esc(it.id)}','\${esc(it.title)}')">↩ Restore</button>\`,
          \`<button class="btn btn-danger btn-xs" onclick="actionItem('permanent-delete','\${esc(it.id)}','\${esc(it.title)}')">✕ Purge</button>\`
        ]:[
          \`<a href="/admin/editor?edit=\${esc(it.id)}" class="btn btn-secondary btn-xs">✏ Edit</a>\`,
          it.status==='PUBLISHED'?\`<button class="btn btn-warning btn-xs" onclick="actionItem('unpublish','\${esc(it.id)}','\${esc(it.title)}')">○ Unpub</button>\`:\`<button class="btn btn-success btn-xs" onclick="actionItem('publish','\${esc(it.id)}','\${esc(it.title)}')">✓ Pub</button>\`,
          \`<button class="btn btn-teal btn-xs" onclick="actionItem('duplicate','\${esc(it.id)}','\${esc(it.title)}')">⧉ Clone</button>\`,
          \`<button class="btn btn-purple btn-xs" onclick="openVersionModal('\${esc(it.id)}','\${esc(it.title)}')">🕐 History</button>\`,
          it.status!=='SCHEDULED'?\`<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg('\${esc(it.id)}')">📅 Sched</button>\`:'',
          it.status!=='ARCHIVED'?\`<button class="btn btn-warning btn-xs" onclick="actionItem('archive','\${esc(it.id)}','\${esc(it.title)}')">📦 Archive</button>\`:'',
          \`<button class="btn btn-danger btn-xs" onclick="actionItem('delete','\${esc(it.id)}','\${esc(it.title)}')">🗑 Trash</button>\`
        ];
        return \`<tr><td><input type="checkbox" class="rcb" value="\${esc(it.id)}" onchange="updateSelection(this)" /></td>\`+
          \`<td style="max-width:260px;"><div style="font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${esc(it.title)}">\${esc(it.title)}</div><div style="font-size:10px;color:#64748b;">/\${esc(it.slug)}</div></td>\`+
          \`<td>\${bdg}</td><td>\${sBadge}</td>\`+
          \`<td><span class="badge badge-blue">\${esc(it.locale||'en')}</span></td>\`+
          \`<td style="font-size:11px;color:#64748b;white-space:nowrap;">\${updated}</td>\`+
          \`<td><div style="display:flex;gap:3px;flex-wrap:wrap;">\${actions.join('')}</div></td></tr>\`;
      }).join('');
    }`;

content = content.replace(oldRenderRows, newRenderRows);

// 5. Revision items rendering
const oldRevItems = `setHTML('versionModalBody','<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+d.data.map(function(rev,i){return'<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;"><span class="rev-badge">v'+(rev.version||d.data.length-i)+'</span><span style="font-size:12px;font-weight:700;color:#e2e8f0;">'+esc(rev.title)+'</span>'+(i===0?'<span class="badge badge-green" style="font-size:9px;">Current</span>':'')+'</div><div class="rev-meta">'+new Date(rev.updatedAt).toLocaleString()+'</div></div>'+(i>0?'<button class="btn btn-teal btn-xs" onclick="restoreRevision(\\''+esc(id)+'\\',\\''+esc(rev.id)+'\\')">↩ Restore</button>':'')+'</div>';}).join('')+'</div>');`;

const newRevItems = `setHTML('versionModalBody', \`<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">\` + d.data.map(function(rev,i){
          return \`<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;"><span class="rev-badge">v\${rev.version||(d.data.length-i)}</span><span style="font-size:12px;font-weight:700;color:#e2e8f0;">\${esc(rev.title)}</span>\${i===0?'<span class="badge badge-green" style="font-size:9px;">Current</span>':''}</div><div class="rev-meta">\${new Date(rev.updatedAt).toLocaleString()}</div></div>\${i>0?\`<button class="btn btn-teal btn-xs" onclick="restoreRevision('\${esc(id)}','\${esc(rev.id)}')">↩ Restore</button>\`:''}</div>\`;
        }).join('') + \`</div>\`);`;

content = content.replace(oldRevItems, newRevItems);

// 6. Media thumbnails
const oldMediaPicker = `g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return'<div class="media-thumb" onclick="selectMediaAsset(\\''+esc(a.url)+\\'')" tabindex="0" role="button" aria-label="Select '+esc(a.filename)+'" onkeydown="if(event.key===\\'Enter\\'||event.key===\\' \\')selectMediaAsset(\\''+esc(a.url)+\\'')"><div class="media-thumb-img">'+(isImg?'<img src="'+esc(a.url)+'" alt="'+esc(a.altText||a.filename)+'" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />':'<span style="font-size:32px;">'+(a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂')+'</span>')+'</div><div class="media-thumb-info"><div class="media-thumb-name" title="'+esc(a.filename)+'">'+esc(a.filename)+'</div><div class="media-thumb-size">'+formatBytes(a.sizeBytes||0)+'</div></div></div>';}).join('');`;

const newMediaPicker = `g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return \`<div class="media-thumb" onclick="selectMediaAsset('\${esc(a.url)}')" tabindex="0" role="button" aria-label="Select \${esc(a.filename)}" onkeydown="if(event.key==='Enter'||event.key===' ')selectMediaAsset('\${esc(a.url)}')"><div class="media-thumb-img">\${isImg?\`<img src="\${esc(a.url)}" alt="\${esc(a.altText||a.filename)}" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />\`:\`<span style="font-size:32px;">\${a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂'}</span>\`}</div><div class="media-thumb-info"><div class="media-thumb-name" title="\${esc(a.filename)}">\${esc(a.filename)}</div><div class="media-thumb-size">\${formatBytes(a.sizeBytes||0)}</div></div></div>\`;}).join('');`;

content = content.replace(oldMediaPicker, newMediaPicker);

// 7. Media grid
const oldMediaGrid = `g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return'<div class="media-thumb"><div class="media-thumb-img">'+(isImg?'<img src="'+esc(a.url)+'" alt="'+esc(a.altText||a.filename)+'" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />':'<span style="font-size:32px;">'+(a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂')+'</span>')+'</div><div class="media-thumb-info"><div class="media-thumb-name">'+esc(a.filename)+'</div><div class="media-thumb-size">'+formatBytes(a.sizeBytes||0)+'</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard(\\''+esc(a.url)+\\'')">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia(\\''+esc(a.id)+\\'',\\''+esc(a.filename)+\\'')">Del</button></div></div>';}).join('');`;

const newMediaGrid = `g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');return \`<div class="media-thumb"><div class="media-thumb-img">\${isImg?\`<img src="\${esc(a.url)}" alt="\${esc(a.altText||a.filename)}" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />\`:\`<span style="font-size:32px;">\${a.mimeType&&a.mimeType.includes('pdf')?'📄':'🗂'}</span>\`}</div><div class="media-thumb-info"><div class="media-thumb-name">\${esc(a.filename)}</div><div class="media-thumb-size">\${formatBytes(a.sizeBytes||0)}</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard('\${esc(a.url)}')">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia('\${esc(a.id)}','\${esc(a.filename)}')">Del</button></div></div>\`;}).join('');`;

content = content.replace(oldMediaGrid, newMediaGrid);

// 8. Quick add page navigation
const oldQuickNav = `c.innerHTML=items.map(function(it){return'<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">'+esc(it.title)+'</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu(\\''+esc(it.title)+\\'',\\'/'+esc(it.slug)+\\'')" title="Add to menu">+</button></div>';}).join('');`;

const newQuickNav = `c.innerHTML=items.map(function(it){return \`<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">\${esc(it.title)}</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu('\${esc(it.title)}','/\${esc(it.slug)}')" title="Add to menu">+</button></div>\`;}).join('');`;

content = content.replace(oldQuickNav, newQuickNav);

// 9. Redirect list
const oldRedirectList = `setHTML('redirectList',items.length?'<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">'+items.map(function(r){return'<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">'+r.statusCode+'</span><span style="flex:1;font-size:11px;color:#94a3b8;">'+esc(r.sourceUrl)+' → '+esc(r.targetUrl)+'</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect(\\''+esc(r.id)+\\'')">×</button></div>';}).join('')+'</div>':'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');`;

const newRedirectList = `setHTML('redirectList',items.length?\`<div style="border:1px solid #1e293b;border-radius:8px;overflow:hidden;">\`+items.map(function(r){return \`<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">\${r.statusCode}</span><span style="flex:1;font-size:11px;color:#94a3b8;">\${esc(r.sourceUrl)} → \${esc(r.targetUrl)}</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect('\${esc(r.id)}')">×</button></div>\`;}).join('')+\`</div>\`:'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');`;

content = content.replace(oldRedirectList, newRedirectList);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored admin.controller.ts script!');
