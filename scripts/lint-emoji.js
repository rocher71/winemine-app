// emoji 사용 금지 (§4-1) 검증.
// 사용: node scripts/lint-emoji.js
// 검사 대상: src/, app/, supabase/migrations/, supabase/functions/, CLAUDE.md, docs/, shared/, scripts/, *.config.{ts,js}
// 제외: node_modules, .expo, dist, .git, specs (submodule), _workspace (ephemeral dev notes)

const fs = require('fs');
const path = require('path');

const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{FE0F}]/u;
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.sql', '.json']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.expo',
  'dist',
  '.git',
  'specs',
  '_workspace',
]);

const bad = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const fp = path.join(dir, entry);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) {
      walk(fp);
    } else if (EXTS.has(path.extname(fp))) {
      const content = fs.readFileSync(fp, 'utf8');
      if (EMOJI_RE.test(content)) bad.push(fp);
    }
  }
}

walk('.');

if (bad.length) {
  console.error('emoji found in:');
  for (const f of bad) console.error('  ' + f);
  process.exit(1);
} else {
  console.log('emoji-free');
}
