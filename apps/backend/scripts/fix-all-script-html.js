const fs = require('fs');
const vm = require('vm');

const controllerPath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(controllerPath, 'utf8');

// Find main script boundaries
const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

const scriptStart = content.indexOf(scriptStartStr);
const scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

// Let's replace the script section in content with clean, verified JS functions:
// 1. renderCatTable
const renderCatTableOld = `function renderCatTable(){
      var tb=document.getElementById('catTableBody');if(!tb)return;
      var q=(getVal('catSearch')||'').toLowerCase();
      var items=masterCategories.filter(function(c){return c.name.toLowerCase().includes(q)||c.slug.toLowerCase().includes(q);});
      if(!items.length){tb.innerHTML='<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No categories found</div></div></td></tr>';return;}
      tb.innerHTML=items.map(function(c){var parent=masterCategories.find(function(p){return p.id===c.parentId;});
        return'<tr><td><strong>'+esc(c.icon||'📁')+' '+esc(c.name)+'</strong><div style="font-size:10px;color:#64748b;">/'+esc(c.slug)+'</div></td><td>'+(parent?esc(parent.name):'<span style="color:#64748b;">Root</span>')+'</td><td><span class="badge badge-sky">'+(c.count||0)+' items</span></td><td><span class="badge badge-green">'+esc(c.status||'ACTIVE')+'</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(\\''+esc(c.id)+'\\')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(\\''+esc(c.id)+'\\',\\''+esc(c.name)+'\\')">Delete</button></td></tr>';
      }).join('');
    }`;

const renderCatTableNew = `function renderCatTable(){
      var tb=document.getElementById('catTableBody');if(!tb)return;
      var q=(getVal('catSearch')||'').toLowerCase();
      var items=masterCategories.filter(function(c){return c.name.toLowerCase().includes(q)||c.slug.toLowerCase().includes(q);});
      if(!items.length){tb.innerHTML=\`<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No categories found</div></div></td></tr>\`;return;}
      tb.innerHTML=items.map(function(c){var parent=masterCategories.find(function(p){return p.id===c.parentId;});
        var pName=parent?esc(parent.name):'<span style="color:#64748b;">Root</span>';
        return \`<tr><td><strong>\${esc(c.icon||'📁')} \${esc(c.name)}</strong><div style="font-size:10px;color:#64748b;">/\${esc(c.slug)}</div></td><td>\${pName}</td><td><span class="badge badge-sky">\${c.count||0} items</span></td><td><span class="badge badge-green">\${esc(c.status||'ACTIVE')}</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat('\${esc(c.id)}')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat('\${esc(c.id)}','\${esc(c.name)}')">Delete</button></td></tr>\`;
      }).join('');
    }`;

content = content.replace(renderCatTableOld, renderCatTableNew);

// 2. renderRows (Content Table)
const renderRowsOld = `function renderRows(items){
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

const renderRowsNew = `function renderRows(items){
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

content = content.replace(renderRowsOld, renderRowsNew);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied initial fixes to admin.controller.ts');
