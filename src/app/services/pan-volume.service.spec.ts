import { TestBed } from '@angular/core/testing';

import { PanVolumeService } from './pan-volume.service';
import { Pan } from '../models/pan-volume.model';

/**
 * These numbers come from baking practice, not from the code, so they are
 * pinned here: a silent edit to a preset changes what comes out of a real oven.
 * Published guidance is 40-45% of pan capacity for a standard sandwich loaf and
 * 50-55% for enriched or fuller loaves.
 */
describe('PanVolumeService', () => {
  let service: PanVolumeService;

  const pan = (id: string, length: number, width: number, height: number): Pan => ({
    id, length, width, height, volume: 0, doughWeight: 0
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanVolumeService);
  });

  it('computes volume from dimensions', () => {
    expect(service.calculatePanVolume(30, 10, 10)).toBe(3000);
  });

  it('takes dough weight as a share of capacity', () => {
    // 3000 cm3 at the standard 45% fill
    expect(service.calculateDoughWeight(30, 10, 10, 45)).toBe(1350);
    expect(service.calculateDoughWeight(20, 10, 10, 45)).toBe(900);
  });

  it('sums volume and dough across pans', () => {
    const result = service.calculateTotalDough([pan('1', 30, 10, 10), pan('2', 20, 10, 10)], 45);

    expect(result.totalVolume).toBe(5000);
    expect(result.totalDoughWeight).toBe(2250);
    expect(result.percentOfCapacity).toBe(45);
  });

  it('works backwards from a dough weight that already fits', () => {
    // The intended workflow: measure your own pan rather than trust a table.
    expect(service.calculatePercentFromWeight(30, 10, 10, 1350)).toBe(45);
  });

  it('guards against a zero-volume pan', () => {
    expect(service.calculatePercentFromWeight(0, 10, 10, 1350)).toBe(0);
  });

  it('reports the same ratio as g/cm3', () => {
    expect(service.gramsPerCubicCm(45)).toBe(0.45);
    expect(service.gramsPerCubicCm(55)).toBe(0.55);
  });

  it('converts volume to litres', () => {
    expect(service.volumeToLiters(3000)).toBe(3);
  });

  describe('presets', () => {
    it('stay inside published practice', () => {
      for (const preset of service.getPresets()) {
        expect(preset.percentOfCapacity).toBeGreaterThanOrEqual(40);
        expect(preset.percentOfCapacity).toBeLessThanOrEqual(55);
      }
    });

    it('run from lightest to fullest', () => {
      const values = service.getPresets().map(p => p.percentOfCapacity);

      expect(values).toEqual([40, 45, 50, 55]);
    });
  });
});
