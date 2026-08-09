const fs = require('fs');

const controllerPath = 'd:/thapasandip.com.np/apps/backend/src/modules/admin/admin.controller.ts';
const content = fs.readFileSync(controllerPath, 'utf8');

const lines = content.split('\n');
console.log('Total file lines:', lines.length);

lines.forEach((l, idx) => {
  // Check for '' inside string concatenations or onclick
  if (l.includes("''+") || l.includes("+''") || l.includes("''") || l.includes("\\'")) {
    if (l.includes("onclick=") || l.includes("return") || l.includes("html") || l.includes("innerHTML")) {
      console.log(`Line ${idx + 1}: ${l.trim()}`);
    }
  }
});
