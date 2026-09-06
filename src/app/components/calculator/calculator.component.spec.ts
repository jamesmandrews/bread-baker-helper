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
