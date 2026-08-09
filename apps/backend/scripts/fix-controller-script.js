const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all broken unescaped single quotes inside JS script template strings
// Look for pattern: onclick="xxx(''+esc(...)
// In the source file, it looks like onclick="func(''+esc(...) or onclick="func(\''+esc(...)

// Let's replace the broken string patterns in the script section of admin.controller.ts:

// 1. editCat & confirmDeleteCat
content = content.replace(
  `onclick="editCat(''+esc(c.id)+'')"` ,
  `onclick="editCat(\\\'\'+esc(c.id)+\'\\\')"`
);
content = content.replace(
  `onclick="confirmDeleteCat(''+esc(c.id)+'',''+esc(c.name)+'')"` ,
  `onclick="confirmDeleteCat(\\\'\'+esc(c.id)+\'\\\',\\\'\'+esc(c.name)+\'\\\')"`
);

// 2. actionItem
content = content.replace(
  `onclick="actionItem('restore',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'restore\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('permanent-delete',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'permanent-delete\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('unpublish',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'unpublish\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('publish',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'publish\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('duplicate',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'duplicate\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('archive',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'archive\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="actionItem('delete',''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="actionItem(\\\'delete\\\',\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);

// 3. openVersionModal & openScheduleDlg
content = content.replace(
  `onclick="openVersionModal(''+esc(it.id)+'',''+esc(it.title)+'')"` ,
  `onclick="openVersionModal(\\\'\'+esc(it.id)+\'\\\',\\\'\'+esc(it.title)+\'\\\')"`
);
content = content.replace(
  `onclick="openScheduleDlg(''+esc(it.id)+'')"` ,
  `onclick="openScheduleDlg(\\\'\'+esc(it.id)+\'\\\')"`
);

// 4. restoreRevision
content = content.replace(
  `onclick="restoreRevision(''+esc(id)+'',''+esc(rev.id)+'')"` ,
  `onclick="restoreRevision(\\\'\'+esc(id)+\'\\\',\\\'\'+esc(rev.id)+\'\\\')"`
);
content = content.replace(
  `onclick="restoreRevision(''+esc(contentId)+'',''+esc(revId)+'')"` ,
  `onclick="restoreRevision(\\\'\'+esc(contentId)+\'\\\',\\\'\'+esc(revId)+\'\\\')"`
);

// 5. selectMediaAsset & copyToClipboard & confirmDeleteMedia
content = content.replace(
  `selectMediaAsset(''+esc(a.url)+'')` ,
  `selectMediaAsset(\\\'\'+esc(a.url)+\'\\\')`
);
content = content.replace(
  `copyToClipboard(''+esc(a.url)+'')` ,
  `copyToClipboard(\\\'\'+esc(a.url)+\'\\\')`
);
content = content.replace(
  `confirmDeleteMedia(''+esc(a.id)+'',''+esc(a.filename)+'')"` ,
  `confirmDeleteMedia(\\\'\'+esc(a.id)+\'\\\',\\\'\'+esc(a.filename)+\'\\\')"`
);

// 6. quickAddToMenu & deleteRedirect
content = content.replace(
  `quickAddToMenu(''+esc(it.title)+'','/'+esc(it.slug)+'')` ,
  `quickAddToMenu(\\\'\'+esc(it.title)+\'\\\',\\\'/\'+esc(it.slug)+\'\\\')`
);
content = content.replace(
  `deleteRedirect(''+esc(r.id)+'')` ,
  `deleteRedirect(\\\'\'+esc(r.id)+\'\\\')`
);

// Write updated file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated admin.controller.ts');
