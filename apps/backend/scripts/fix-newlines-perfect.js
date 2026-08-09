const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// In admin.controller.ts, replace any literal newlines inside JS strings in wrapFormat:
const targetBad = `var fm={h1:'<h1>'+sel+'</h1>',h2:'<h2>'+sel+'</h2>',h3:'<h3>'+sel+'</h3>',h4:'<h4>'+sel+'</h4>',b:'<strong>'+sel+'</strong>',i:'<em>'+sel+'</em>',u:'<u>'+sel+'</u>',strike:'<s>'+sel+'</s>',sup:'<sup>'+sel+'</sup>',sub:'<sub>'+sel+'</sub>',quote:'<blockquote>\n  '+sel+'\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\n'+sel+'\n</code></pre>',ul:'<ul>\n  <li>'+sel+'</li>\n</ul>',ol:'<ol>\n  <li>'+sel+'</li>\n</ol>',tasklist:'<ul>\n  <li><input type="checkbox" /> '+sel+'</li>\n</ul>',table:'<table>\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\n</table>',hr:'\n<hr />\n',link:'<a href="URL">'+sel+'</a>'};`;

const replacementGood = `var fm={h1:'<h1>'+sel+'</h1>',h2:'<h2>'+sel+'</h2>',h3:'<h3>'+sel+'</h3>',h4:'<h4>'+sel+'</h4>',b:'<strong>'+sel+'</strong>',i:'<em>'+sel+'</em>',u:'<u>'+sel+'</u>',strike:'<s>'+sel+'</s>',sup:'<sup>'+sel+'</sup>',sub:'<sub>'+sel+'</sub>',quote:'<blockquote>\\\\n  '+sel+'\\\\n</blockquote>',code:'<code>'+sel+'</code>',codeblock:'<pre><code>\\\\n'+sel+'\\\\n</code></pre>',ul:'<ul>\\\\n  <li>'+sel+'</li>\\\\n</ul>',ol:'<ol>\\\\n  <li>'+sel+'</li>\\\\n</ol>',tasklist:'<ul>\\\\n  <li><input type="checkbox" /> '+sel+'</li>\\\\n</ul>',table:'<table>\\\\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\\\\n  <tbody><tr><td>'+sel+'</td><td>Value</td></tr></tbody>\\\\n</table>',hr:'\\\\n<hr />\\\\n',link:'<a href="URL">'+sel+'</a>'};`;

if (!content.includes(targetBad)) {
  console.error('Target bad string not found in file!');
  process.exit(1);
}

content = content.replace(targetBad, replacementGood);

// Also check selectMediaAsset:
const targetMediaBad = `if(el)el.value+='\n<img src="'+url+'" alt="Media" />\n';`;
const replacementMediaGood = `if(el)el.value+='\\\\n<img src="'+url+'" alt="Media" />\\\\n';`;
if (content.includes(targetMediaBad)) {
  content = content.replace(targetMediaBad, replacementMediaGood);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 Successfully fixed newlines in admin.controller.ts!');
