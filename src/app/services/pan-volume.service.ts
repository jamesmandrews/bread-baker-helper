import { Injectable } from '@angular/core';
import { DoughDensityPreset, Pan, PanVolumeCalculation } from '../models/pan-volume.model';

@Injectable({
  providedIn: 'root'
})
export class PanVolumeService {

  // Common dough density presets
  // Typical bread dough density ranges from 0.55-0.70 g/cm³
  private presets: DoughDensityPreset[] = [
    {
      name: 'Light & Airy',
      description: 'Soft sandwich bread, brioche',
      gramsPerCubicCm: 0.55
    },
    {
      name: 'Standard',
      description: 'Most bread recipes',
      gramsPerCubicCm: 0.60
    },
    {
      name: 'Dense',
      description: 'Whole wheat, rye bread',
      gramsPerCubicCm: 0.65
    },
    {
      name: 'Very Dense',
      description: 'Heavy whole grain loaves',
      gramsPerCubicCm: 0.70
    }
  ];

  getPresets(): DoughDensityPreset[] {
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
   * Formula: volume × density
   */
  calculateDoughWeight(length: number, width: number, height: number, gramsPerCubicCm: number): number {
    const volume = this.calculatePanVolume(length, width, height);
    return Math.round(volume * gramsPerCubicCm * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate total dough needed for multiple pans
   */
  calculateTotalDough(pans: Pan[], gramsPerCubicCm: number): PanVolumeCalculation {
    let totalVolume = 0;
    let totalDoughWeight = 0;

    pans.forEach(pan => {
      const volume = this.calculatePanVolume(pan.length, pan.width, pan.height);
      totalVolume += volume;
      totalDoughWeight += this.calculateDoughWeight(pan.length, pan.width, pan.height, gramsPerCubicCm);
    });

    return {
      gramsPerCubicCm,
      totalVolume: Math.round(totalVolume * 10) / 10,
      totalDoughWeight: Math.round(totalDoughWeight * 10) / 10
    };
  }

  /**
   * Calculate grams per cubic cm from total weight and dimensions
   * Useful for reverse calculations
   */
  calculateGramsPerCubicCm(length: number, width: number, height: number, totalWeight: number): number {
    const volume = this.calculatePanVolume(length, width, height);
    if (volume === 0) return 0;
    return Math.round((totalWeight / volume) * 1000) / 1000; // Round to 3 decimal places
  }

  /**
   * Convert volume to liters for reference
   */
  volumeToLiters(volumeInCubicCm: number): number {
    return Math.round((volumeInCubicCm / 1000) * 100) / 100;
  }
}
