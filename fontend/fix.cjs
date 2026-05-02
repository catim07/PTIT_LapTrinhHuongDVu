const fs = require('fs');
let content = fs.readFileSync('src/admin/pages/AdminCustomers.tsx', 'utf8');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/admin/pages/AdminCustomers.tsx', content);
console.log('Fixed backticks!');
