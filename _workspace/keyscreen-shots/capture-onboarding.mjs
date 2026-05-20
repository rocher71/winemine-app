/**
 * /onboarding 4 step 보충 캡처
 *
 * 이유: 모바일 viewport(<768px)에서 AppMode useEffect가 demoMode를 heavy로 강제 →
 * /onboarding이 / 로 redirect됨. 768px 이상 viewport로 우회.
 *
 * 실행: capture.mjs와 동일한 dev server(:3001) 가동 상태에서
 *   node _workspace/keyscreen-shots/capture-onboarding.mjs
 */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname);
const BASE = process.env.KEYSCREEN_BASE_URL ?? 'http://localhost:3001';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 1280 },
    deviceScaleFactor: 2,
    colorScheme: 'dark',
    isMobile: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();

  // localStorage 정리 — onboardingComplete 플래그 제거
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem('winemine.onboardingComplete');
      window.localStorage.removeItem('winemine.demoMode');
    } catch {}
  });

  // Step 1: welcome
  await page.goto(`${BASE}/onboarding?demo=first-time`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // welcome 확인 — winemine 텍스트
  const welcomeFound = await page.locator('h1', { hasText: /winemine/i }).count();
  console.log(`welcome step h1 found: ${welcomeFound > 0}`);

  await page.screenshot({ path: `${OUT_DIR}/onboarding.png`, fullPage: true });
  console.log('✓ onboarding.png (step 1 — welcome)');

  // Step 2로 진행 — primary button click ("시작하기" / "Get started")
  try {
    const nextBtn = page.locator('button').first();
    await nextBtn.click({ timeout: 5000 });
    await page.waitForTimeout(800);

    await page.screenshot({ path: `${OUT_DIR}/onboarding_language.png`, fullPage: true });
    console.log('✓ onboarding_language.png (step 2)');

    // Pick first option (Korean) then click next
    const koCard = page.locator('button, [role="button"]').filter({ hasText: /한국어|Korean|ko/i }).first();
    if ((await koCard.count()) > 0) {
      await koCard.click({ timeout: 5000 });
      await page.waitForTimeout(400);
    }
    // Find "Next" primary button — usually last button on page
    const nextBtns = page.locator('button').filter({ hasText: /다음|Next|계속|Continue/i });
    if ((await nextBtns.count()) > 0) {
      await nextBtns.first().click({ timeout: 5000 });
    } else {
      // fallback: last button
      const allBtns = await page.locator('button').all();
      if (allBtns.length > 0) await allBtns[allBtns.length - 1].click({ timeout: 5000 });
    }
    await page.waitForTimeout(800);

    await page.screenshot({ path: `${OUT_DIR}/onboarding_experience.png`, fullPage: true });
    console.log('✓ onboarding_experience.png (step 3)');

    // Pick first option (beginner) then next
    const begCard = page.locator('button, [role="button"]').filter({ hasText: /입문자|beginner|Beginner/i }).first();
    if ((await begCard.count()) > 0) {
      await begCard.click({ timeout: 5000 });
      await page.waitForTimeout(400);
    }
    const nextBtns2 = page.locator('button').filter({ hasText: /다음|Next|계속|Continue/i });
    if ((await nextBtns2.count()) > 0) {
      await nextBtns2.first().click({ timeout: 5000 });
    } else {
      const allBtns = await page.locator('button').all();
      if (allBtns.length > 0) await allBtns[allBtns.length - 1].click({ timeout: 5000 });
    }
    await page.waitForTimeout(800);

    await page.screenshot({ path: `${OUT_DIR}/onboarding_done.png`, fullPage: true });
    console.log('✓ onboarding_done.png (step 4)');
  } catch (err) {
    console.log(`step 2-4 capture incomplete: ${err.message}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
