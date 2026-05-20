/**
 * winemine-keyscreen 화면 스크린샷 캡처 (P2)
 *
 * 사용:
 *   1. 키스크린 dev: `cd ../winemine-keyscreen && PORT=3001 npm run dev`
 *   2. 스크립트:    `node _workspace/keyscreen-shots/capture.mjs`
 *
 * 결과: _workspace/keyscreen-shots/{route}.png
 *
 * 산출물 목적:
 *   - design-reviewer 멀티모달 비교 reference (design-review-gate SKILL)
 *   - design-spec-author가 사양 작성 시 시각 확인 보조
 *
 * 첫 번째 패스는 다크 모드(기본)만 캡처. 라이트 모드는 P2.5에서 추가 (data-theme=light 토글).
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname);
const BASE = process.env.KEYSCREEN_BASE_URL ?? 'http://localhost:3001';

mkdirSync(OUT_DIR, { recursive: true });

// v0.1.0 12 화면 매핑 — 키스크린 라우트 ↔ 출력 파일명
// (참고) 키스크린의 mock id: wines=bdx-margaux, cellar=cellar_001, notes=note_001
const ROUTES = [
  { path: '/onboarding',                   file: 'onboarding.png' },
  { path: '/',                             file: 'home.png' },
  { path: '/capture',                      file: 'capture.png' },
  { path: '/wine/bdx-margaux',             file: 'wine_lwin.png' },
  { path: '/cellar',                       file: 'cellar.png' },
  { path: '/cellar/cellar_001',            file: 'cellar_lwin.png' },
  { path: '/notes/new',                    file: 'notes_new.png' },
  { path: '/notes/new/write',              file: 'notes_new_write.png' },
  { path: '/notes/note_001',               file: 'notes_noteId.png' },
  { path: '/settings',                     file: 'settings.png' },
  { path: '/settings/appearance',          file: 'settings_appearance.png' },
  { path: '/settings/experience',          file: 'settings_experience.png' },
  { path: '/settings/language',            file: 'settings_language.png' },
  { path: '/settings/notifications',       file: 'settings_notifications.png' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    deviceScaleFactor: 2,
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  // 처음 한 번 베이스 방문 — Next 컴파일 워밍
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  const results = [];
  for (const { path, file } of ROUTES) {
    const url = `${BASE}${path}`;
    const out = `${OUT_DIR}/${file}`;
    process.stdout.write(`→ ${path}  `);
    try {
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      // Next dev 첫 컴파일은 무겁다 — 추가 networkidle 대기
      await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(700);

      const status = response?.status() ?? 0;
      if (status >= 400) {
        console.log(`[skip status=${status}]`);
        results.push({ path, file, status, ok: false });
        continue;
      }
      await page.screenshot({ path: out, fullPage: true });
      console.log(`✓ ${file}`);
      results.push({ path, file, status, ok: true });
    } catch (err) {
      console.log(`✗ ${err.message}`);
      results.push({ path, file, status: 0, ok: false, error: err.message });
    }
  }

  await browser.close();

  console.log('\nSummary:');
  console.log(`  ok:   ${results.filter((r) => r.ok).length}`);
  console.log(`  fail: ${results.filter((r) => !r.ok).length}`);
  for (const r of results.filter((r) => !r.ok)) {
    console.log(`    - ${r.path} → ${r.error ?? `HTTP ${r.status}`}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
