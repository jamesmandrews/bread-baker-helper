import { Injectable } from '@angular/core';
import { DoughballPreset, PizzaPan, DoughballCalculation } from '../models/doughball.model';

@Injectable({
  providedIn: 'root'
})
export class DoughballService {

  // Common presets for different pizza styles
  // Original oz/in² values converted to g/in² (oz × 28.3495)
  private presets: DoughballPreset[] = [
    {
      name: 'Thin Crust',
      description: 'NY-style thin crust pizza (0.09 oz/in²)',
      gramsPerSquareInch: 2.551  // 0.09 oz/in²
    },
    {
      name: 'Medium Crust',
      description: 'Standard hand-tossed pizza (0.12 oz/in²)',
      gramsPerSquareInch: 3.402  // 0.12 oz/in²
    },
    {
      name: 'Thick Crust',
      description: 'Deep dish or pan pizza (0.18 oz/in²)',
      gramsPerSquareInch: 5.103  // 0.18 oz/in²
    },
    {
      name: 'Detroit Style',
      description: 'Extra thick, square pan pizza (0.22 oz/in²)',
      gramsPerSquareInch: 6.237  // 0.22 oz/in²
    }
  ];

  getPresets(): DoughballPreset[] {
    return this.presets;
  }

  /**
   * Calculate the area of a circular pizza pan
   * Formula: π * r²
   */
  calculatePanArea(diameter: number): number {
    const radius = diameter / 2;
    return Math.PI * radius * radius;
  }

  /**
   * Calculate the dough weight for a single pan
   */
  calculateDoughWeight(diameter: number, gramsPerSquareInch: number): number {
    const area = this.calculatePanArea(diameter);
    return Math.round(area * gramsPerSquareInch * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Calculate total dough needed for multiple pans
   */
  calculateTotalDough(pans: PizzaPan[], gramsPerSquareInch: number): DoughballCalculation {
    let totalArea = 0;
    let totalDoughWeight = 0;

    pans.forEach(pan => {
      const area = this.calculatePanArea(pan.diameter);
      totalArea += area;
      totalDoughWeight += this.calculateDoughWeight(pan.diameter, gramsPerSquareInch);
    });

    return {
      gramsPerSquareInch,
      totalArea: Math.round(totalArea * 10) / 10,
      totalDoughWeight: Math.round(totalDoughWeight * 10) / 10
    };
  }

  /**
   * Calculate required dough weight based on pan diameter and grams per square inch
   */
  calculateRequiredDough(diameter: number, gramsPerSquareInch: number): number {
    return this.calculateDoughWeight(diameter, gramsPerSquareInch);
  }

  /**
   * Calculate grams per square inch from total weight and diameter
   * Useful for reverse calculations
   */
  calculateGramsPerSquareInch(diameter: number, totalWeight: number): number {
    const area = this.calculatePanArea(diameter);
    return Math.round((totalWeight / area) * 1000) / 1000; // Round to 3 decimal places
  }
}
