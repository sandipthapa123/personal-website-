const fs = require('fs');
const vm = require('vm');

const controllerPath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(controllerPath, 'utf8');

const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

const scriptStart = content.indexOf(scriptStartStr);
const scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Could not find script boundaries!');
  process.exit(1);
}

let rawScriptInTS = content.substring(scriptStart + 8, scriptEnd);

function evaluateScript(tsScript) {
  return tsScript
    .replace(/<\\\/script>/g, '</script>')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

let currentJS = evaluateScript(rawScriptInTS);
let errorCount = 0;

while (true) {
  try {
    new vm.Script(currentJS);
    console.log(`\nSUCCESS: No JS syntax errors remaining! (Fixed ${errorCount} errors)`);
    break;
  } catch (err) {
    errorCount++;
    if (errorCount > 100) {
      console.error('Too many iterations!');
      break;
    }
    
    // Find where error is
    const lines = currentJS.split('\n');
    let errorLineNum = -1;
    let errorMsg = '';
    
    for (let i = 1; i <= lines.length; i++) {
      try {
        new vm.Script(lines.slice(0, i).join('\n'));
      } catch (e) {
        if (!e.message.includes('Unexpected end of input')) {
          errorLineNum = i;
          errorMsg = e.message;
          break;
        }
      }
    }
    
    if (errorLineNum === -1) {
      console.error('Could not isolate error line:', err.message);
      break;
    }
    
    console.log(`Error #${errorCount} at Line ${errorLineNum}: ${errorMsg}`);
    console.log(`Line content: ${lines[errorLineNum - 1]}`);
  }
}
