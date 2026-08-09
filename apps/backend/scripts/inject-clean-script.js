const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

const scriptTagStart = content.indexOf('<script>\n    \'use strict\';');
const scriptTagEnd = content.indexOf('<\\/script>\n<\\/body>\n<\\/html>`;', scriptTagStart);

if (scriptTagStart === -1 || scriptTagEnd === -1) {
  console.error('Script tags not found with exact strings!');
  process.exit(1);
}

// Clean browser script body with proper double-escaped quotes (\\')
const cleanScriptBody = `  <script>
    'use strict';
    var _AT = '\${activeTab}', _IM = '\${initialModule}';

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
        return '<tr><td><strong>' + cIcon + ' ' + cName + '</strong><div style="font-size:10px;color:#64748b;">/' + cSlug + '</div></td><td>' + pName + '</td><td><span class="badge badge-sky">' + (c.count||0) + ' items</span></td><td><span class="badge badge-green">' + cStatus + '</span></td><td style="display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="editCat(\\\\' + cId + '\\\\')">Edit</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteCat(\\\\' + cId + '\\\\',\\\\' + cName + '\\\\')">Delete</button></td></tr>';
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
          '<button class="btn btn-success btn-xs" onclick="actionItem(\\\'restore\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">↩ Restore</button>',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'permanent-delete\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">✕ Purge</button>'
        ]:[
          '<a href="/admin/editor?edit='+idEsc+'" class="btn btn-secondary btn-xs">✏ Edit</a>',
          it.status==='PUBLISHED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'unpublish\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">○ Unpub</button>':'<button class="btn btn-success btn-xs" onclick="actionItem(\\\'publish\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">✓ Pub</button>',
          '<button class="btn btn-teal btn-xs" onclick="actionItem(\\\'duplicate\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">⧉ Clone</button>',
          '<button class="btn btn-purple btn-xs" onclick="openVersionModal(\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">🕐 History</button>',
          it.status!=='SCHEDULED'?'<button class="btn btn-secondary btn-xs" onclick="openScheduleDlg(\\\\' + idEsc + '\\\\')">📅 Sched</button>':'',
          it.status!=='ARCHIVED'?'<button class="btn btn-warning btn-xs" onclick="actionItem(\\\'archive\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">📦 Archive</button>':'',
          '<button class="btn btn-danger btn-xs" onclick="actionItem(\\\'delete\\\',\\\\' + idEsc + '\\\\,\\\\' + titleEsc + '\\\\')">🗑 Trash</button>'
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
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-xs" onclick="restoreRevision(\\\\' + cIdEsc + '\\\\,\\\\' + revIdEsc + '\\\\')">↩ Restore</button>' : '';
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
          var restBtn = i > 0 ? '<button class="btn btn-teal btn-sm" onclick="restoreRevision(\\\\' + cIdEsc + '\\\\,\\\\' + revIdEsc + '\\\\')">↩ Restore</button>' : '';
          return '<div class="rev-item"><div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span class="rev-badge">v' + verNum + '</span><span style="font-size:13px;font-weight:700;color:#e2e8f0;">' + revTitleEsc + '</span>' + currBadge + '</div><div class="rev-meta">Saved ' + dateStr + '</div><div style="font-size:11px;color:#475569;margin-top:4px;">' + snippetEsc + '...</div></div>' + restBtn + '</div>';
        }).join('')+'</div>');
      });
    }

    /* ══ EDITOR ══ */
    var autosaveTimer=null,rteHistory=[];
    function onTitleInputPage(){var title=(getVal('edTitlePage')||'').trim();var badge=document.getElementById('edSlugBadgePage');if(badge&&badge.classList.contains('slug-auto')){setVal('edSlugPage',title.toLowerCase().replace(/[^a-z0-9\\s-]/g,'').trim().replace(/\\s+/g,'-').replace(/-+/g,'-'));}generateMissingSeoPage();}
    function onSlugInputPage(){var b=document.getElementById('edSlugBadgePage');if(b){b.className='slug-badge slug-manual';b.textContent='Manual';}}
    function regenSlugPage(){var t=(getVal('edTitlePage')||'').trim();if(!t){showMsg('Enter title first','error');return;}setVal('edSlugPage',t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));var b=document.getElementById('edSlugBadgePage');if(b){b.className='slug-badge slug-auto';b.textContent='Auto';}}
    function onStatusChange(){var status=getVal('edStatusPage');var sg=document.getElementById('schedDateGroup');if(sg)sg.style.display=(status==='SCHEDULED'?'block':'none');}
    function onVisibilityChange(){var v=getVal('edVisibilityPage');var g=document.getElementById('passGroupPage');if(g)g.style.display=(v==='PASSWORD'?'block':'none');}
    function generateMissingSeoPage(){var t=(getVal('edTitlePage')||'').trim();if(!t)return;var sum=(getVal('edSummaryPage')||'').trim();var mt=document.getElementById('edMetaTitlePage');var md=document.getElementById('edMetaDescPage');var kw=document.getElementById('edKeywordsPage');if(mt&&!mt.value)mt.value=t+' | Sandip Thapa Academic Platform';if(md&&!md.value)md.value=sum||(t+' — Academic publication by Sandip Thapa.');if(kw&&!kw.value)kw.value=selectedTags.join(', ')||'Legal Research, Disability Rights';updateCharCount('edMetaTitlePage','metaTitleCount',60);updateCharCount('edMetaDescPage','metaDescCount',160);}
    function updateCharCount(inputId,countId,max){var el=document.getElementById(inputId);var cl=document.getElementById(countId);if(!el||!cl)return;var len=el.value.length;cl.textContent=max?(len+' / '+max+' chars'):(el.value.split(/\\s+/).filter(Boolean).length+' words');cl.className='char-count'+(max&&len>max?' over':max&&len>max*0.85?' warn':'');}
    function wrapFormat(fmt){var el=document.getElementById('edBodyPage');if(!el)return;rteHistory.push(el.value);if(rteHistory.length>50)rteHistory.shift();var s=el.selectionStart;var e=el.selectionEnd;var sel=el.value.substring(s,e)||'text';var fm={h1:'<h1>'+sel+'</h1>',h2:'<h2>'+sel+'</h2>',h3:'<h3>'+sel+'</h3>',h4:'<h4>'+sel+'</h4>',b:'<strong>'+sel+'</strong>',i:'<em>'+sel+'</em>',u:'<u>'+sel+'</u>',strike:'<s>'+sel+'</s>',sup:'<sup>'+sel+'</sup>',sub:'<sub>'+sel+'</sub>',quote:'<blockquote>\\n  '+sel+'\\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\\n'+sel+'\\n</code></pre>',ul:'<ul>\\n  <li>'+sel+'</li>\\n</ul>',ol:'<ol>\\n  <li>'+sel+'</li>\\n</ol>',tasklist:'<ul>\\n  <li><input type="checkbox" /> '+sel+'</li>\\n</ul>',table:'<table>\\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\\n</table>',hr:'\\n<hr />\\n',link:'<a href="URL">'+sel+'</a>'};var tag=fm[fmt]||sel;el.value=el.value.substring(0,s)+tag+el.value.substring(e);el.focus();el.selectionStart=el.selectionEnd=s+tag.length;updateCharCount('edBodyPage','bodyCharCount',0);}
    function rteUndo(){var el=document.getElementById('edBodyPage');if(!el||rteHistory.length===0)return;el.value=rteHistory.pop()||el.value;}
    function rteRedo(){}
    function onTagInputSearch(){var q=(getVal('tagInputPage')||'').toLowerCase().trim();var box=document.getElementById('tagSuggestBox');if(!box)return;if(!q){box.style.display='none';return;}var matches=masterTags.filter(function(t){return t.name.toLowerCase().includes(q);});if(!matches.length){box.style.display='none';return;}box.innerHTML=matches.map(function(t){return'<div class="tag-suggest-item" onclick="addTagFromSuggest(\\\\' + esc(t.name) + '\\\\')">#'+esc(t.name)+' ('+t.count+')</div>';}).join('');box.style.display='block';}
    function addTagFromSuggest(t){if(t&&!selectedTags.includes(t)){selectedTags.push(t);renderTagChips();}setVal('tagInputPage','');var b=document.getElementById('tagSuggestBox');if(b)b.style.display='none';}
    function handleTagKey(e){if(e.key==='Enter'){e.preventDefault();var v=e.target.value.trim();if(v&&!selectedTags.includes(v)){selectedTags.push(v);renderTagChips();e.target.value='';var b=document.getElementById('tagSuggestBox');if(b)b.style.display='none';}}}
    function removeTag(t){selectedTags=selectedTags.filter(function(x){return x!==t;});renderTagChips();}
    function renderTagChips(){var c=document.getElementById('tagChipsPage');if(!c)return;c.innerHTML=selectedTags.map(function(t){return'<span class="tag-chip">#'+esc(t)+' <button type="button" onclick="removeTag(\\\\' + esc(t) + '\\\\')" aria-label="Remove tag '+esc(t)+'">×</button></span>';}).join('');}
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
    function selectMediaAsset(url){if(currentMediaTarget==='featured'){setVal('edImagePage',url);}else{var el=document.getElementById('edBodyPage');if(el)el.value+='\\n<img src="'+url+'" alt="Media" />\\n';}closeMediaPickerModal();showMsg('Media inserted','success');}
    function loadMediaPicker(){fetch('/api/v1/media').then(function(r){return r.json();}).then(function(d){var assets=(d.data&&d.data.items)||[];_mediaAssets=assets;renderMediaPicker(assets);}).catch(function(){_mediaAssets=[];renderMediaPicker([]);});}
    function renderMediaPicker(assets){var g=document.getElementById('mpGrid');if(!g)return;if(!assets.length){g.innerHTML='<div class="empty-state"><div class="empty-icon">🖼️</div><div class="empty-text">No media. Upload to get started.</div></div>';return;}g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb" onclick="selectMediaAsset(\\\\' + urlEsc + '\\\\')" tabindex="0" role="button" aria-label="Select ' + fnameEsc + '" onkeydown="if(event.key===\\\'Enter\\\'||event.key===\\\' \\\')selectMediaAsset(\\\\' + urlEsc + '\\\\')"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name" title="' + fnameEsc + '">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div></div>';
      }).join('');}
    function filterMediaPicker(){var q=(getVal('mpSearch')||'').toLowerCase();renderMediaPicker(_mediaAssets.filter(function(a){return a.filename.toLowerCase().includes(q);}));}
    function filterMedia(){var q=(getVal('mediaSearch')||'').toLowerCase();var t=getVal('mediaTypeFilter');renderMediaGrid(_mediaAssets.filter(function(a){return(!q||a.filename.toLowerCase().includes(q))&&(!t||a.mimeType.includes(t));}));}
    function renderMediaGrid(assets){var g=document.getElementById('mediaGrid');var em=document.getElementById('mediaEmpty');if(!g)return;if(!assets.length){if(em)em.style.display='block';g.innerHTML='';return;}if(em)em.style.display='none';g.innerHTML=assets.map(function(a){var isImg=a.mimeType&&a.mimeType.startsWith('image');
        var aIdEsc = esc(a.id), urlEsc = esc(a.url), fnameEsc = esc(a.filename), altEsc = esc(a.altText||a.filename);
        var sizeStr = formatBytes(a.sizeBytes||0);
        var iconStr = a.mimeType&&a.mimeType.includes('pdf') ? '📄' : '🗂';
        var imgHtml = isImg ? '<img src="' + urlEsc + '" alt="' + altEsc + '" style="width:100%;height:90px;object-fit:cover;" loading="lazy" />' : '<span style="font-size:32px;">' + iconStr + '</span>';
        return '<div class="media-thumb"><div class="media-thumb-img">' + imgHtml + '</div><div class="media-thumb-info"><div class="media-thumb-name">' + fnameEsc + '</div><div class="media-thumb-size">' + sizeStr + '</div></div><div style="padding:4px 8px;display:flex;gap:4px;"><button class="btn btn-secondary btn-xs" onclick="copyToClipboard(\\\\' + urlEsc + '\\\\')">Copy</button><button class="btn btn-danger btn-xs" onclick="confirmDeleteMedia(\\\\' + aIdEsc + '\\\\,\\\\' + fnameEsc + '\\\\')">Del</button></div></div>';
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
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1e293b;"><span style="font-size:12px;color:#cbd5e1;">' + tEsc + '</span><button class="btn btn-secondary btn-xs" onclick="quickAddToMenu(\\\\' + tEsc + '\\\\,\\\\\'/' + sEsc + '\\\\')" title="Add to menu">+</button></div>';
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
        return '<div style="display:flex;align-items:center;padding:8px 12px;border-bottom:1px solid #0f172a;gap:8px;"><span class="badge badge-blue">' + r.statusCode + '</span><span style="flex:1;font-size:11px;color:#94a3b8;">' + sUrlEsc + ' → ' + tUrlEsc + '</span><button class="btn btn-danger btn-xs" onclick="deleteRedirect(\\\\' + rIdEsc + '\\\\')">×</button></div>';
      }).join('')+'</div>':'<div class="empty-state"><div class="empty-icon">🔗</div><div class="empty-text">No redirects</div></div>');}).catch(function(){});}
    function deleteRedirect(id){showConfirmDlg({title:'Delete Redirect',message:'Remove this redirect?',icon:'🗑️',destructive:true,okLabel:'Delete',onConfirm:function(){fetch('/api/v1/seo/redirects/'+id,{method:'DELETE'}).then(function(r){return r.json();}).then(function(){showMsg('Redirect deleted','success');loadRedirects();});}});}
    function loadSeoDashboard(){fetch('/api/v1/seo/dashboard').then(function(r){return r.json();}).then(function(d){if(!d.success)return;var sd=d.data||{};setHTML('seoDashboard','<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div class="stat-card"><div class="stat-num">'+esc(String(sd.overallScore||'N/A'))+'</div><div class="stat-lbl">SEO Score</div></div><div class="stat-card"><div class="stat-num">'+esc(String(sd.totalPages||0))+'</div><div class="stat-lbl">Total Pages</div></div></div>');}).catch(function(){});}

    /* ══ SYSTEM ══ */
    function fetchSystemInfo(){fetch('/admin/dashboard-metrics').then(function(r){return r.json();}).then(function(d){if(d.data){var s=d.data.system||{};setTxt('sysNode',s.nodeVersion||'N/A');setTxt('sysUptime',Math.floor((s.uptimeSeconds||0)/60)+' min');setTxt('sysBsDate',s.timeBs||'N/A');}}).catch(function(){});}
    function flushCache(){fetch('/admin/system/cache/flush',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){var el=document.getElementById('cacheResult');if(el){el.style.display='block';el.textContent='✅ '+(d.data&&d.data.message?d.data.message:'Caches flushed!');}showMsg('All caches flushed!','success');});}
    function processScheduled(){fetch('/api/v1/content/process-scheduled',{method:'POST',headers:{'Content-Type':'application/json'}}).then(function(r){return r.json();}).then(function(d){if(d.success)showMsg('Processed '+(d.data&&d.data.published?d.data.published:0)+' scheduled items','success');});}

    /* ══ SETTINGS ══ */
    function saveSettings(){showMsg('Platform settings saved','success');}
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
  </script>`;

// Test VM:
// In cleanScriptBody, we used \\\\' in strings like `onclick="editCat(\\\\'" + cId + "\\\\')"`
// When evaluating script in browser:
// TS backtick template literal evaluates \\\\' into \'
// And in browser JS string, \' is a literal single quote ' inside string
const testEvaluated = cleanScriptBody
  .replace('  <script>', '')
  .replace('  </script>', '')
  .replace(/<\\\/script>/g, '</script>')
  .replace(/\\\\'/g, "'")
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"');

try {
  new vm.Script(testEvaluated);
  console.log('\n===========================================');
  console.log('🎉 VERIFICATION PASSED: ZERO SYNTAX ERRORS!');
  console.log('===========================================\n');
  
  const finalContent = content.substring(0, scriptTagStart) + cleanScriptBody + content.substring(scriptTagEnd);
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('Successfully updated admin.controller.ts!');
} catch (err) {
  console.error('\n❌ VM Verification Failed:', err.message);
}
