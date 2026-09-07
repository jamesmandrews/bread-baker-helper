import { test, expect, type Page } from '@playwright/test';

/**
 * Real-browser verification of zoneless change detection.
 *
 * With zone.js removed nothing patches DOM events, so every one of these
 * assertions only passes if the handler writes to a signal and Angular
 * schedules a render off the back of it. A regression here shows up as a
 * stale value on screen rather than as a thrown error, which is exactly
 * what unit-level "should create" tests cannot catch.
 */

const consoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
};

test.describe('Bread Helper — zoneless reactivity', () => {
  test("baker's percentage recalculates both directions", async ({ page }) => {
    const errors = consoleErrors(page);
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Bread Helper' })).toBeVisible();

    const waterRow = page.locator('app-ingredient-row').nth(1);
    await expect(waterRow.locator('.ingredient-name')).toHaveValue('Water');

    // weight -> percentage
    await waterRow.locator('.ingredient-weight').fill('800');
    await expect(waterRow.locator('.ingredient-percentage')).toHaveValue('80');

    // percentage -> weight
    await waterRow.locator('.ingredient-percentage').fill('75');
    await expect(waterRow.locator('.ingredient-weight')).toHaveValue('750');

    // derived summary keeps up
    await expect(page.locator('.summary-section')).toContainText('75%');

    expect(errors).toEqual([]);
  });

  test('flour weight rescales the whole recipe', async ({ page }) => {
    await page.goto('/');

    const flourRow = page.locator('app-ingredient-row').nth(0);
    const waterRow = page.locator('app-ingredient-row').nth(1);

    await flourRow.locator('.ingredient-weight').fill('2000');

    // Water sits at 70%, so doubling the flour should double its weight.
    await expect(waterRow.locator('.ingredient-weight')).toHaveValue('1400');
  });

  test('adding and removing ingredients re-renders the list', async ({ page }) => {
    await page.goto('/');

    const rows = page.locator('app-ingredient-row');
    await expect(rows).toHaveCount(4);

    await page.getByRole('button', { name: '+ Add Ingredient' }).click();
    await expect(rows).toHaveCount(5);

    await rows.nth(4).locator('.remove-btn').click();
    await expect(rows).toHaveCount(4);
  });

  test('tab switching swaps the active calculator', async ({ page }) => {
    const errors = consoleErrors(page);
    await page.goto('/');

    await expect(page.locator('app-calculator')).toBeVisible();

    await page.getByRole('button', { name: 'Pizza Doughball Calculator' }).click();
    await expect(page.locator('app-doughball-calculator')).toBeVisible();
    await expect(page.locator('app-calculator')).toHaveCount(0);

    await page.getByRole('button', { name: 'Pan Volume Calculator' }).click();
    await expect(page.locator('app-pan-volume-calculator')).toBeVisible();
    await expect(page.locator('app-doughball-calculator')).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test('doughball calculator recalculates on diameter change', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Pizza Doughball Calculator' }).click();

    const panRow = page.locator('.pan-row').first();
    const dough = panRow.locator('.pan-stats .stat').nth(1);

    // 12" at the Medium Crust default (3.402 g/in^2) -> pi*36*3.402 = 384.8 g
    await expect(dough).toContainText('384.8');

    await panRow.locator('input[type="number"]').fill('16');
    // 16" -> pi*64*3.402 = 684.0 g
    await expect(dough).toContainText('684');
  });

  test('pan volume calculator recalculates on dimension change', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Pan Volume Calculator' }).click();

    const panRow = page.locator('.pan-row').first();
    const inputs = panRow.locator('input[type="number"]');

    // 30x10x10 = 3000 cm^3 at the Standard default (45% fill) -> 1350 g
    await expect(panRow).toContainText('1350');

    await inputs.nth(0).fill('20');
    // 20x10x10 = 2000 cm^3 -> 900 g
    await expect(panRow).toContainText('900');
  });
});
