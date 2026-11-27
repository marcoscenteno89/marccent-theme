/*
 * The generic checks for every case of one component on the cases page (docs/TESTING.md, section 3a, source 1 and 2).
 * Each case runs at the three widths (the Playwright projects: phone, tablet, desktop) and in light and dark colour
 * schemes. A case fails on a console error, an uncaught page error, horizontal scroll, or a serious or critical axe
 * violation, and saves a screenshot to test-results/shots/.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const cases = JSON.parse(readFileSync(join(ROOT, 'markup/cases.json'), 'utf8'));
const SHOTS = join(ROOT, 'test-results/shots');
const SCHEMES = [ 'light', 'dark' ];

// "a link with an icon" → "a-link-with-an-icon"
export const slug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Each case of `key` (a key of markup/cases.json), at every width and in both colour schemes.
export function checkComponent(key) {
  const list = cases[key];
  if (!list) throw new Error(`markup/cases.json has no component "${key}"`);
  mkdirSync(SHOTS, { recursive: true });

  for (const scheme of SCHEMES) {
    test.describe(`${key}, ${scheme}`, () => {
      test.use({ colorScheme: scheme, deviceScaleFactor: 2 });

      list.forEach((item, index) => {
        test(`${item.case}`, async ({ page }, testInfo) => {
          const width = testInfo.project.name;
          const errors = [];
          page.on('console', (message) => {
            if (message.type() === 'error') errors.push(`console: ${message.text()}`);
          });
          page.on('pageerror', (error) => errors.push(`page error: ${error.message}`));
          // A headed browser asks for a favicon the cases server does not have; answer it with no content so that the
          // browser's own request is not a console error (the page itself is unchanged).
          await page.route('**/favicon.ico', (route) => route.fulfill({ status: 204 }));

          await page.goto(`/#${key}`);
          await page.evaluate(() => document.fonts.ready);
          const article = page.locator(`section[id="${key}"] > article`).nth(index);
          await expect(article).toBeVisible();

          // No horizontal scroll on the page (the width rule, docs/TESTING.md section 2).
          const widths = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            client: document.documentElement.clientWidth,
          }));
          expect(widths.scroll, `horizontal scroll: scrollWidth ${widths.scroll} > clientWidth ${widths.client}`)
            .toBeLessThanOrEqual(widths.client);

          // Accessibility: serious and critical violations fail (source 2). Scoped to this case.
          const scan = await new AxeBuilder({ page })
            .include(`section[id="${key}"] > article:nth-of-type(${index + 1})`)
            .analyze();
          const blocking = scan.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
          const rules = blocking.map((v) => `${v.id} (${v.impact})`);
          expect(rules, `axe: ${rules.join(', ')}`).toEqual([]);

          expect(errors, errors.join('\n')).toEqual([]);

          await article.screenshot({ path: join(SHOTS, `${key}-${slug(item.case)}-${width}-${scheme}.png`) });
        });
      });
    });
  }
}
