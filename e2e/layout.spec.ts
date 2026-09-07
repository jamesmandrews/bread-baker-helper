import { test, expect, type Page } from '@playwright/test';

/**
 * The layout brief: nothing below the fold. The shell is viewport-locked and
 * only the ingredient/pan list may scroll inside it, so the document itself
 * must never overflow — at any supported size, on any tab, with a realistic
 * recipe loaded.
 */

/**
 * Locking the viewport is a desktop promise. Phones scroll the page normally,
 * so they are checked for reachability rather than for zero overflow.
 */
const LOCKED_VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short laptop', width: 1280, height: 700 }
];

const PHONE = { name: 'phone', width: 390, height: 844 };

const documentOverflows = (page: Page) =>
  page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
  });

/**
 * Document overflow alone is not enough: the shell sets `overflow: hidden`, so
 * content that runs past the bottom is clipped and silently unreachable rather
 * than making the page scroll. Anything interactive has to stay inside the
 * viewport on its own.
 */
const isWithinViewport = async (page: Page, selector: string) =>
  page.evaluate(sel => {
    const r = document.querySelector(sel)!.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  }, selector);

test.describe('viewport-locked layout', () => {
  for (const vp of LOCKED_VIEWPORTS) {
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
      expect(await isWithinViewport(page, '.add-ingredient-btn')).toBe(true);
    });

    test(`keeps controls reachable on ${vp.name} past the fold`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Well past any real recipe: the list must scroll inside its panel and
      // leave the footer on screen, not push it out of a clipped shell.
      for (let i = 0; i < 16; i++) {
        await page.getByRole('button', { name: '+ Add ingredient' }).click();
      }
      await expect(page.locator('app-ingredient-row')).toHaveCount(20);

      expect(await documentOverflows(page)).toBe(false);
      expect(await isWithinViewport(page, '.add-ingredient-btn')).toBe(true);
      expect(await isWithinViewport(page, '.readout')).toBe(true);
    });
  }

  test(`${PHONE.name} scrolls the page rather than clipping`, async ({ page }) => {
    await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
    await page.goto('/');

    for (let i = 0; i < 16; i++) {
      await page.getByRole('button', { name: '+ Add ingredient' }).click();
    }
    await expect(page.locator('app-ingredient-row')).toHaveCount(20);

    // Overflow is fine here; being unable to reach the content is not.
    const add = page.locator('.add-ingredient-btn');
    await add.scrollIntoViewIfNeeded();
    await expect(add).toBeVisible();
    expect(await isWithinViewport(page, '.add-ingredient-btn')).toBe(true);
  });

  test('phone still fits a default recipe without scrolling', async ({ page }) => {
    await page.setViewportSize({ width: PHONE.width, height: PHONE.height });
    await page.goto('/');

    expect(await documentOverflows(page)).toBe(false);
  });
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
