const fs = require('fs');
const path = require('path');

const files = [
  "D:/WEB/elv-crm/client/src/app/api/brands/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/categories/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/contracts/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/contracts/[id]/pdf/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/contracts/[id]/word/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/customers/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/customers/[id]/restore/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/leads/[id]/status/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/projects/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/projects/[id]/milestones/[milestoneId]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/quotations/[id]/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/quotations/[id]/excel/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/quotations/[id]/pdf/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/quotations/[id]/restore/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/quotations/[id]/status/route.ts",
  "D:/WEB/elv-crm/client/src/app/api/suppliers/[id]/route.ts"
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  // Replace function signature
  const sigRegex = /(export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\([^,]+,\s*\{\s*params\s*\}\s*:\s*\{)\s*params\s*:\s*\{([^}]+)\}\s*\}(\s*\)\s*\{)/g;
  content = content.replace(sigRegex, (match, p1, p2, p3, p4) => {
    changed = true;
    return p1 + ` params: Promise<{${p3}}> }` + p4;
  });

  // Inject const resolvedParams = await params;
  const injectRegex = /(export\s+async\s+function\s+(?:GET|POST|PUT|PATCH|DELETE)\([^)]+\)\s*\{\s*try\s*\{)/g;
  content = content.replace(injectRegex, (match) => {
    changed = true;
    return match + "\n    const resolvedParams = await params;";
  });
  
  // Replace params.id with resolvedParams.id, and params.milestoneId with resolvedParams.milestoneId
  if (changed) {
    content = content.replace(/params\.id/g, 'resolvedParams.id');
    content = content.replace(/params\.milestoneId/g, 'resolvedParams.milestoneId');
    fs.writeFileSync(f, content);
    console.log("Updated", f);
  }
}
