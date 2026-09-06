import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatorComponent } from './calculator.component';

/**
 * Smoke tests for zoneless change detection.
 *
 * Without zone.js nothing patches DOM events, so a re-render only happens if
 * the event handler writes to a signal. These cover the full round trip:
 * child DOM event -> output() -> parent signal update -> computed -> re-render
 * of a sibling child via input().
 */
describe('CalculatorComponent (zoneless reactivity)', () => {
  let fixture: ComponentFixture<CalculatorComponent>;

  const rows = () =>
    Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('app-ingredient-row')
    );

  const inputIn = (rowIndex: number, cls: string) =>
    rows()[rowIndex].querySelector<HTMLInputElement>(`.${cls}`)!;

  const type = async (el: HTMLInputElement, value: string) => {
    el.value = value;
    el.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculatorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CalculatorComponent);
    await fixture.whenStable();
  });

  it('renders the default recipe', () => {
    expect(rows().length).toBe(4);
    expect(inputIn(1, 'ingredient-name').value).toBe('Water');
    expect(inputIn(1, 'ingredient-weight').value).toBe('700');
  });

  it('recomputes percentage when a weight is edited', async () => {
    await type(inputIn(1, 'ingredient-weight'), '800');

    expect(inputIn(1, 'ingredient-percentage').value).toBe('80');
  });

  it('recomputes weight when a percentage is edited', async () => {
    await type(inputIn(1, 'ingredient-percentage'), '75');

    expect(inputIn(1, 'ingredient-weight').value).toBe('750');
  });

  it('re-renders the summary when the recipe changes', async () => {
    const summary = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(summary()).toContain('70');
    await type(inputIn(1, 'ingredient-percentage'), '85');

    expect(summary()).toContain('85');
  });

  describe('editing a flour weight', () => {
    it('rescales every other ingredient', async () => {
      await type(inputIn(0, 'ingredient-weight'), '2000');

      // Flour is the 100% base, so doubling it doubles everything else.
      expect(inputIn(1, 'ingredient-weight').value).toBe('1400'); // water 70%
      expect(inputIn(2, 'ingredient-weight').value).toBe('40'); // salt 2%
      expect(inputIn(3, 'ingredient-weight').value).toBe('20'); // yeast 1%
    });

    it('leaves the percentages alone', async () => {
      await type(inputIn(0, 'ingredient-weight'), '2000');

      expect(inputIn(0, 'ingredient-percentage').value).toBe('100');
      expect(inputIn(1, 'ingredient-percentage').value).toBe('70');
    });

    it('keeps multi-flour recipes in proportion', async () => {
      const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>('select')!;
      select.value = 'Whole Wheat Bread';
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();

      // Bread Flour and Whole Wheat Flour are 50% each of a 1000 g base.
      expect(inputIn(0, 'ingredient-weight').value).toBe('500');
      expect(inputIn(1, 'ingredient-weight').value).toBe('500');

      // Pushing one flour to 600 g implies a 1200 g base, not a 600 g one.
      await type(inputIn(0, 'ingredient-weight'), '600');

      expect(inputIn(1, 'ingredient-weight').value).toBe('600');
      expect(inputIn(2, 'ingredient-weight').value).toBe('864'); // water 72%
      expect(inputIn(0, 'ingredient-percentage').value).toBe('50');
    });
  });

  it('adds and removes ingredient rows', async () => {
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.add-ingredient-btn')!
      .click();
    await fixture.whenStable();
    expect(rows().length).toBe(5);

    rows()[4].querySelector<HTMLButtonElement>('.remove-btn')!.click();
    await fixture.whenStable();
    expect(rows().length).toBe(4);
  });
});
