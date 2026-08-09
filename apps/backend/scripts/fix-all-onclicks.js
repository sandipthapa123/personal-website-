const fs = require('fs');
const vm = require('vm');

const controllerPath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
let content = fs.readFileSync(controllerPath, 'utf8').replace(/\r\n/g, '\n');

// Find script boundaries
const scriptStartStr = '<script>\n    \'use strict\';';
const scriptEndStr = '<\\/script>\n<\\/body>';

let scriptStart = content.indexOf(scriptStartStr);
let scriptEnd = content.indexOf(scriptEndStr, scriptStart);

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

let scriptCode = content.substring(scriptStart + 8, scriptEnd);

// Replace any occurrence of single quote escaping in scriptCode:
// Fix editCat, confirmDeleteCat, actionItem, openVersionModal, openScheduleDlg, restoreRevision, selectMediaAsset, copyToClipboard, confirmDeleteMedia, quickAddToMenu, deleteRedirect

// Fix all single quote string concatenations in onclick handlers:
scriptCode = scriptCode
  .replace(/onclick="editCat\((.*?)\)"/g, function(match, args) {
    return 'onclick="editCat(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="confirmDeleteCat\((.*?)\)"/g, function(match, args) {
    return 'onclick="confirmDeleteCat(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="actionItem\((.*?)\)"/g, function(match, args) {
    return 'onclick="actionItem(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="openVersionModal\((.*?)\)"/g, function(match, args) {
    return 'onclick="openVersionModal(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="openScheduleDlg\((.*?)\)"/g, function(match, args) {
    return 'onclick="openScheduleDlg(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="restoreRevision\((.*?)\)"/g, function(match, args) {
    return 'onclick="restoreRevision(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="selectMediaAsset\((.*?)\)"/g, function(match, args) {
    return 'onclick="selectMediaAsset(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="copyToClipboard\((.*?)\)"/g, function(match, args) {
    return 'onclick="copyToClipboard(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="confirmDeleteMedia\((.*?)\)"/g, function(match, args) {
    return 'onclick="confirmDeleteMedia(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="quickAddToMenu\((.*?)\)"/g, function(match, args) {
    return 'onclick="quickAddToMenu(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  })
  .replace(/onclick="deleteRedirect\((.*?)\)"/g, function(match, args) {
    return 'onclick="deleteRedirect(' + args.replace(/\\'/g, "'").replace(/\\/g, '') + ')"';
  });

// Let's now fix all remaining `''+` or `+''` or broken quote concatenations inside scriptCode
// In scriptCode, if we have: `onclick="editCat(\\'` or `onclick="editCat('`
// To be 100% safe in HTML `onclick="func('val')"`, let's make sure the single quotes around values in onclick are properly escaped:
// When scriptCode is inside a TS template string in admin.controller.ts:
// `onclick="editCat(\\\\'` -> becomes `onclick="editCat('"` when evaluated in browser JS!

// Let's test evaluating scriptCode right now:
const testEvaluated = scriptCode
  .replace(/<\\\/script>/g, '</script>')
  .replace(/\\'/g, "'")
  .replace(/\\"/g, '"');

try {
  new vm.Script(testEvaluated);
  console.log('VM SUCCESS! No syntax errors in scriptCode!');
} catch (err) {
  console.error('VM Error:', err.message);
  // Find error line
  const lines = testEvaluated.split('\n');
  for (let i = 1; i <= lines.length; i++) {
    try {
      new vm.Script(lines.slice(0, i).join('\n'));
    } catch (e) {
      if (!e.message.includes('Unexpected end of input')) {
        console.log(`Syntax Error at Line ${i}: ${e.message}`);
        console.log(`Line ${i}: ${lines[i-1]}`);
        break;
      }
    }
  }
}
