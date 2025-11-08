import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class CalculationService {

  calculateWeightFromPercentage(percentage: number, totalFlourWeight: number): number {
    return Math.round((percentage / 100) * totalFlourWeight * 10) / 10;
  }

  calculatePercentageFromWeight(weight: number, totalFlourWeight: number): number {
    if (totalFlourWeight === 0) return 0;
    return Math.round((weight / totalFlourWeight) * 100 * 10) / 10;
  }

  calculateTotalWeight(ingredients: Ingredient[]): number {
    return Math.round(ingredients.reduce((sum, ing) => sum + ing.weight, 0) * 10) / 10;
  }

  calculateHydration(ingredients: Ingredient[]): number {
    // Sum ALL flour weights, not just the first one
    const totalFlourWeight = ingredients
      .filter(i => i.isFlour)
      .reduce((sum, flour) => sum + flour.weight, 0);

    const water = ingredients.find(i => i.name.toLowerCase() === 'water');

    if (totalFlourWeight === 0 || !water) return 0;

    return Math.round((water.weight / totalFlourWeight) * 100 * 10) / 10;
  }

  validateSaltPercentage(percentage: number): string | null {
    if (percentage > 3) {
      return 'Warning: Salt >3% may inhibit yeast activity';
    }
    if (percentage < 1.5) {
      return 'Tip: Most bread recipes use 1.8-2.2% salt';
    }
    return null;
  }

  validateHydration(hydration: number): string | null {
    if (hydration < 50) {
      return 'Very stiff dough - typical for bagels';
    }
    if (hydration > 85) {
      return 'Very wet dough - requires advanced handling';
    }
    return null;
  }

  /**
   * Calculate total percentage of all ingredients
   * Used to reverse-calculate flour weight from target total dough weight
   */
  calculateTotalPercentage(ingredients: Ingredient[]): number {
    return ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
  }

  /**
   * Calculate flour weight needed to achieve a target total dough weight
   * Formula: flourWeight = targetWeight / (totalPercentage / 100)
   */
  calculateFlourWeightFromTotal(targetTotalWeight: number, ingredients: Ingredient[]): number {
    const totalPercentage = this.calculateTotalPercentage(ingredients);
    if (totalPercentage === 0) return 0;

    const flourWeight = (targetTotalWeight * 100) / totalPercentage;
    return Math.round(flourWeight * 10) / 10;
  }
}
