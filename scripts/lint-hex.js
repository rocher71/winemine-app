// 하드코딩 hex 사용 금지 (§4-9, success_criteria) 검증.
// 사용: node scripts/lint-hex.js
// 허용 파일: design-tokens.ts, tailwind.config.ts, lwin.ts (bottle color hex), app.config.ts (Android adaptiveIcon bg).
// 주석(line + block)은 제거 후 검사 — 주석 내 hex reference는 false positive.

const fs = require('fs');
const path = require('path');

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/;
const ALLOW = ['design-tokens.ts', 'tailwind.config.ts', 'lwin.ts', 'app.config.ts'];
const SKIP_DIRS = new Set([
  'node_modules',
  '.expo',
  'dist',
  '.git',
  'specs',
  'supabase',
  'docs',
  '_workspace',
  'scripts',
]);
const EXTS = new Set(['.ts', '.tsx']);

const bad = [];

function stripComments(src) {
  // 1) /* ... */ block comments
  // 2) // line comments (URL은 //http로 시작하지 않으면 stripping이 안전 — 본 코드는 dev hex만 사용)
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const fp = path.join(dir, entry);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp);
    } else if (EXTS.has(path.extname(fp))) {
      if (ALLOW.some((a) => fp.endsWith(a))) continue;
      const content = fs.readFileSync(fp, 'utf8');
      const stripped = stripComments(content);
      if (HEX_RE.test(stripped)) bad.push(fp);
    }
  }
}

walk('.');

if (bad.length) {
  console.error('hardcoded hex (outside allow list, excluding comments) in:');
  for (const f of bad) console.error('  ' + f);
  process.exit(1);
} else {
  console.log('no hardcoded hex outside design-tokens');
}
