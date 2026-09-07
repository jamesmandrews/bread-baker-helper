import { test, expect, type Page } from '@playwright/test';

/**
 * The layout brief: nothing below the fold. The shell is viewport-locked and
 * only the ingredient/pan list may scroll inside it, so the document itself
 * must never overflow — at any supported size, on any tab, with a realistic
 * recipe loaded.
 */

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short laptop', width: 1280, height: 700 },
  { name: 'phone', width: 390, height: 844 }
];

const documentOverflows = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  });

test.describe('viewport-locked layout', () => {
  for (const vp of VIEWPORTS) {
    test(`fits on ${vp.name} across every tab`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      for (const tab of [
        "Baker's Percentage Calculator",
        'Pizza Doughball Calculator',
        'Pan Volume Calculator'
      ]) {
        await page.getByRole('button', { name: tab }).click();
        await expect(page.getByRole('button', { name: tab })).toHaveAttribute('aria-current', 'page');
        expect(await documentOverflows(page), `${tab} overflowed on ${vp.name}`).toBe(false);
      }
    });

    test(`fits on ${vp.name} with a full recipe`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Eight ingredients is the top of the realistic range for bread.
      for (let i = 0; i < 4; i++) {
        await page.getByRole('button', { name: '+ Add ingredient' }).click();
      }
      await expect(page.locator('app-ingredient-row')).toHaveCount(8);

      expect(await documentOverflows(page)).toBe(false);
    });
  }
});

test.describe('help sheet', () => {
  test('opens from the bar and describes the active tab', async ({ page }) => {
    await page.goto('/');

    const sheet = page.locator('dialog.help');
    await expect(sheet).toBeHidden();

    await page.getByRole('button', { name: 'How this calculator works' }).click();
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText('Flour is always 100%');

    // Native <dialog> closes on Escape without any handler of ours.
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('follows the active tab', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Pan Volume Calculator' }).click();
    await page.getByRole('button', { name: 'How this calculator works' }).click();

    const sheet = page.locator('dialog.help');
    await expect(sheet.getByRole('heading')).toHaveText('Pan Volume Calculator');

    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(sheet).toBeHidden();
  });
});
