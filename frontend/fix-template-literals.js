const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'MaintenanceCalendar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Count template literals before
const escapedBackticks = (content.match(/\\\`/g) || []).length;
const escapedDollars = (content.match(/\\\$/g) || []).length;

console.log(`Found ${escapedBackticks} escaped backticks and ${escapedDollars} escaped dollar signs`);

// Fix escaped template literals
content = content.replace(/\\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed template literals in MaintenanceCalendar.tsx');
