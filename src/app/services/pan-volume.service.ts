import { Injectable } from '@angular/core';
import { PanFillPreset, Pan, PanVolumeCalculation } from '../models/pan-volume.model';

@Injectable({
  providedIn: 'root'
})
export class PanVolumeService {

  /**
   * Dough for a loaf pan is a *fill ratio*, not a density: the dough goes in at
   * roughly half the pan and rises to fill it. Baking guides state this as a
   * percentage of the pan's water capacity, which is the same number as its
   * volume in cm3 because 1 ml of water weighs 1 g.
   *
   * Published practice is 40-45% for a standard sandwich loaf and 50-55% for
   * enriched or deliberately fuller loaves.
   */
  private presets: PanFillPreset[] = [
    {
      name: 'Light & Airy',
      description: 'Open crumb sandwich loaf',
      percentOfCapacity: 40
    },
    {
      name: 'Standard',
      description: 'Most sandwich breads',
      percentOfCapacity: 45
    },
    {
      name: 'Enriched',
      description: 'Brioche, milk bread, fuller loaf',
      percentOfCapacity: 50
    },
    {
      name: 'Full',
      description: 'Dense whole grain, maximum fill',
      percentOfCapacity: 55
    }
  ];

  getPresets(): PanFillPreset[] {
    return this.presets;
  }

  /**
   * Calculate the volume of a rectangular pan
   * Formula: length × width × height
   */
  calculatePanVolume(length: number, width: number, height: number): number {
    return length * width * height;
  }

  /**
   * Calculate the dough weight for a single pan
   * Formula: volume × (percent / 100)
   */
  calculateDoughWeight(length: number, width: number, height: number, percentOfCapacity: number): number {
    const volume = this.calculatePanVolume(length, width, height);
    return Math.round(volume * (percentOfCapacity / 100) * 10) / 10;
  }

  /**
   * Calculate total dough needed for multiple pans
   */
  calculateTotalDough(pans: Pan[], percentOfCapacity: number): PanVolumeCalculation {
    let totalVolume = 0;
    let totalDoughWeight = 0;

    pans.forEach(pan => {
      totalVolume += this.calculatePanVolume(pan.length, pan.width, pan.height);
      totalDoughWeight += this.calculateDoughWeight(pan.length, pan.width, pan.height, percentOfCapacity);
    });

    return {
      percentOfCapacity,
      totalVolume: Math.round(totalVolume * 10) / 10,
      totalDoughWeight: Math.round(totalDoughWeight * 10) / 10
    };
  }

  /**
   * Work backwards from a dough weight you already know fits a pan. Three of
   * these from your own pans beats any published table.
   */
  calculatePercentFromWeight(length: number, width: number, height: number, doughWeight: number): number {
    const volume = this.calculatePanVolume(length, width, height);
    if (volume === 0) return 0;
    return Math.round((doughWeight / volume) * 100 * 10) / 10;
  }

  /**
   * The same ratio expressed as g/cm3, for cross-checking against sources that
   * state it that way.
   */
  gramsPerCubicCm(percentOfCapacity: number): number {
    return Math.round((percentOfCapacity / 100) * 1000) / 1000;
  }

  /**
   * Convert volume to liters for reference
   */
  volumeToLiters(volumeInCubicCm: number): number {
    return Math.round((volumeInCubicCm / 1000) * 100) / 100;
  }
}
