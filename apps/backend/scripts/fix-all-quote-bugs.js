const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// In raw TS file inside the template string:
// We want to replace any occurrence of `\''` with `\\'` so that when evaluated by TS runtime, it produces `\'` instead of `''`!
// Or replace `onclick="func(''+` with `onclick="func(\`+\'` or clean template literal.

// Let's do a global regex replace in the script section of admin.controller.ts:

// Replace any occurrence of `\''` with `\\'` inside the script block!
const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

let scriptStart = content.indexOf(scriptStartStr);
let scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

let scriptPart = content.substring(scriptStart, scriptEnd);

// Replace all `\''` in scriptPart with `\\'`
scriptPart = scriptPart.replace(/\\''/g, "\\\\'");

// Reassemble content
content = content.substring(0, scriptStart) + scriptPart + content.substring(scriptEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Applied \\\'\' -> \\\\\' replace to admin.controller.ts');
