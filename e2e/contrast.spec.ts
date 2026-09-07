import { test, expect, type Page } from '@playwright/test';

/**
 * WCAG AA contrast for text.
 *
 * Every surface in this theme sits in a narrow band from --ink (#0E0F12) to
 * --line-soft (#1F232A, the row hover state). Rather than resolve each
 * element's actual backdrop — which breaks on the readout's gradient, since a
 * `background` shorthand clears background-color and walking up would find a
 * darker ancestor and flatter the result — every sample is judged against the
 * lightest of those surfaces. That is the worst case for light text on dark,
 * so passing here means passing everywhere.
 */

const LIGHTEST_SURFACE = '#1f232a';

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0; // >=24px, or >=18.66px when bold

/** Text that is small, faint, or both — where this regressed before. */
const SAMPLES = [
  { selector: '.readout-item.primary .value', label: 'headline figure' },
  { selector: '.readout-item.primary .value i', label: 'headline unit' },
  { selector: '.readout-item:not(.primary) .value', label: 'secondary figure' },
  { selector: '.readout-item:not(.primary) .value i', label: 'secondary unit' },
  { selector: '.readout-item .label', label: 'readout label' },
  { selector: '.panel-head .label', label: 'column heading' },
  { selector: '.field > .label', label: 'field label' },
  { selector: '.suffixed .suffix', label: 'input unit suffix' },
  { selector: '.hint', label: 'hint text' },
  { selector: '.tab', label: 'inactive tab' },
  { selector: '.tab.active', label: 'active tab' },
  { selector: '.btn-add', label: 'add button' }
];

const srgbToLinear = (c: number) =>
  c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const luminance = ([r, g, b]: number[]) =>
  0.2126 * srgbToLinear(r / 255) +
  0.7152 * srgbToLinear(g / 255) +
  0.0722 * srgbToLinear(b / 255);

const parse = (css: string): number[] => {
  const hex = css.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = css.match(/rgba?\(([^)]+)\)/);
  if (!rgb) throw new Error(`cannot parse colour: ${css}`);
  return rgb[1].split(',').slice(0, 3).map(v => parseFloat(v.trim()));
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(parse(a)), luminance(parse(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const measure = (page: Page, selector: string) =>
  page.evaluate(sel => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      color: s.color,
      fontSize: parseFloat(s.fontSize),
      fontWeight: parseInt(s.fontWeight, 10) || 400
    };
  }, selector);

const TABS = [
  "Baker's Percentage Calculator",
  'Pizza Doughball Calculator',
  'Pan Volume Calculator'
];

for (const tab of TABS) {
  test(`text meets AA contrast on ${tab}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByRole('button', { name: tab }).click();

    const failures: string[] = [];

    for (const sample of SAMPLES) {
      const m = await measure(page, sample.selector);
      if (!m) continue; // not present on this tab

      const isLarge = m.fontSize >= 24 || (m.fontSize >= 18.66 && m.fontWeight >= 700);
      const required = isLarge ? AA_LARGE : AA_NORMAL;
      const ratio = contrast(m.color, LIGHTEST_SURFACE);

      if (ratio < required) {
        failures.push(
          `${sample.label} (${sample.selector}): ${ratio.toFixed(2)}:1 ` +
          `at ${m.fontSize}px/${m.fontWeight}, needs ${required}:1 — ${m.color}`
        );
      }
    }

    expect(failures, `\n${failures.join('\n')}\n`).toEqual([]);
  });
}

test('unit suffixes are large enough to read', async ({ page }) => {
  await page.goto('/');

  // 10px was both too faint and too small; these carry the units on every value.
  for (const selector of ['.suffixed .suffix', '.cell .unit']) {
    const m = await measure(page, selector);
    if (!m) continue;
    expect(m.fontSize, `${selector} is ${m.fontSize}px`).toBeGreaterThanOrEqual(11);
  }
});
