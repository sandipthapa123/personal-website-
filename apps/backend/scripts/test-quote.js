const cId = 'cat-123';
// In browser JS inside script tag, map function returns HTML string:
const htmlRow = '<tr><td><button onclick="editCat(\'' + cId + '\')">Edit</button></td></tr>';
console.log('HTML Row in Browser:', htmlRow);

// Now test parsing htmlRow as JS script:
const vm = require('vm');
const browserScript = `
  var cId = 'cat-123';
  var html = '<tr><td><button onclick="editCat(\\\'' + cId + '\\\')">Edit</button></td></tr>';
  console.log('Evaluated inside browser script:', html);
`;

new vm.Script(browserScript);
console.log('Browser script parsed cleanly!');
