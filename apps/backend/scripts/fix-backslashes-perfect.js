const fs = require('fs');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8');

const targetSnippet = `quote:'<blockquote>\\n  '+sel+'\\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\\n'+sel+'\\n</code></pre>',ul:'<ul>\\n  <li>'+sel+'</li>\\n</ul>',ol:'<ol>\\n  <li>'+sel+'</li>\\n</ol>',tasklist:'<ul>\\n  <li><input type="checkbox" /> '+sel+'</li>\\n</ul>',table:'<table>\\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\\n</table>',hr:'\\n<hr />\\n'`;

const replacementSnippet = `quote:'<blockquote>\\\\n  '+sel+'\\\\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\\\\n'+sel+'\\\\n</code></pre>',ul:'<ul>\\\\n  <li>'+sel+'</li>\\\\n</ul>',ol:'<ol>\\\\n  <li>'+sel+'</li>\\\\n</ol>',tasklist:'<ul>\\\\n  <li><input type="checkbox" /> '+sel+'</li>\\\\n</ul>',table:'<table>\\\\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\\\\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\\\\n</table>',hr:'\\\\n<hr />\\\\n'`;

if (!content.includes(targetSnippet)) {
  console.error('Target snippet not found in admin.controller.ts!');
  process.exit(1);
}

content = content.replace(targetSnippet, replacementSnippet);

// Also check selectMediaAsset:
const mediaTarget = `if(el)el.value+='\\n<img src="'+url+'" alt="Media" />\\n';`;
const mediaReplacement = `if(el)el.value+='\\\\n<img src="'+url+'" alt="Media" />\\\\n';`;
if (content.includes(mediaTarget)) {
  content = content.replace(mediaTarget, mediaReplacement);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully upgraded backslashes in admin.controller.ts!');
