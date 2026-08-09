const fs = require('fs');
const vm = require('vm');

const filePath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
const scriptTagStart = content.indexOf('<script>\n    \'use strict\';');
const scriptTagEnd = content.indexOf('<\\/script>\n<\\/body>\n<\\/html>`;', scriptTagStart);
let scriptCode = content.substring(scriptTagStart + 8, scriptTagEnd);

const testEvaluated = scriptCode
  .replace(/<\\\/script>/g, '</script>')
  .replace(/\\\\'/g, "'")
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"');

const lines = testEvaluated.split('\n');

for (let i = 1; i <= lines.length; i++) {
  try {
    new vm.Script(lines.slice(0, i).join('\n'));
  } catch (e) {
    if (!e.message.includes('Unexpected end of input')) {
      console.log(`Error at Line ${i}: ${e.message}`);
      console.log(`Line content: ${lines[i-1]}`);
      break;
    }
  }
}
