const fs = require('fs');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

const badOnkeydown = `onkeydown="if(event.key===\\\\'Enter\\\\'||event.key===\\\\' \\\\')selectMediaAsset(this.dataset.url)"`;
const goodOnkeydown = `onkeydown="handleMediaKey(event)"`;

// Check if badOnkeydown or variants exist
const idx = content.indexOf('selectMediaAsset(this.dataset.url)" tabindex="0"');
console.log('idx of selectMediaAsset in renderMediaPicker:', idx);

if (idx > -1) {
  const snippet = content.substring(idx, idx + 250);
  console.log('Snippet around media picker:', JSON.stringify(snippet));
}

// Replace in content:
content = content.replace(/onkeydown="if\(event\.key===[^"]+selectMediaAsset\(this\.dataset\.url\)"/g, 'onkeydown="handleMediaKey(event)"');

// Add handleMediaKey function right before selectMediaAsset function:
if (!content.includes('function handleMediaKey(')) {
  content = content.replace('function selectMediaAsset(url)', 'function handleMediaKey(e){if(e.key===\'Enter\'||e.key===\' \'){e.preventDefault();selectMediaAsset(e.currentTarget.dataset.url);}}\n    function selectMediaAsset(url)');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully fixed media key handler in admin.controller.ts!');
