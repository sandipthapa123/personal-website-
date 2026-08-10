const fs = require('fs');
let s = fs.readFileSync('d:/thapasandip.com.np/apps/backend/prisma/schema.prisma', 'utf8');

// I will just re-read the original and apply all cleanups properly
let original = fs.readFileSync('C:/Users/deshp/.gemini/antigravity/brain/763968bf-b0ea-4a3c-a935-74122f70ea52/scratch/new-schema.prisma', 'utf8');
original = original.replace(/ @db\.Uuid/g, '');
original = original.replace(/ @db\.Text/g, '');
original = original.replace(/provider = "postgresql"/, 'provider = "sqlite"');
original = original.replace(/url\s+= env\("DATABASE_URL"\)/, 'url      = "file:./dev.db"');
original = original.replace(/Json\?/g, 'String?');
original = original.replace(/Json/g, 'String');
original = original.replace(/enum \w+ \{[^}]+\}/g, '');
original = original.replace(/UserStatus/g, 'String');
original = original.replace(/ContentStatus/g, 'String');
original = original.replace(/TicketStatus/g, 'String');
original = original.replace(/SubscriberStatus/g, 'String');

// Now fix the enums values to have quotes
original = original.replace(/@default\(ACTIVE\)/g, '@default("ACTIVE")');
original = original.replace(/@default\(DRAFT\)/g, '@default("DRAFT")');
original = original.replace(/@default\(NEW\)/g, '@default("NEW")');
original = original.replace(/@default\(SUBSCRIBED\)/g, '@default("SUBSCRIBED")');

fs.writeFileSync('d:/thapasandip.com.np/apps/backend/prisma/schema.prisma', original);
console.log("Re-wrote schema successfully");
