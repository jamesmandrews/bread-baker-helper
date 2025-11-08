import { Injectable } from '@angular/core';
import { RecipeTemplate } from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class RecipePresetService {

  private presets: RecipeTemplate[] = [
    {
      name: 'Basic White Bread',
      description: 'Simple everyday white bread',
      ingredients: [
        { name: 'Flour', percentage: 100, isFlour: true },
        { name: 'Water', percentage: 67 },
        { name: 'Salt', percentage: 2 },
        { name: 'Instant Yeast', percentage: 1 }
      ]
    },
    {
      name: 'Sourdough',
      description: 'Classic sourdough with levain',
      ingredients: [
        { name: 'Flour', percentage: 100, isFlour: true },
        { name: 'Water', percentage: 75 },
        { name: 'Salt', percentage: 2 },
        { name: 'Levain/Starter', percentage: 20 }
      ]
    },
    {
      name: 'French Baguette',
      description: 'Traditional French baguette',
      ingredients: [
        { name: 'Flour', percentage: 100, isFlour: true },
        { name: 'Water', percentage: 70 },
        { name: 'Salt', percentage: 2 },
        { name: 'Instant Yeast', percentage: 0.8 }
      ]
    },
    {
      name: 'Pizza Dough',
      description: 'Classic Neapolitan-style pizza',
      ingredients: [
        { name: 'Flour', percentage: 100, isFlour: true },
        { name: 'Water', percentage: 65 },
        { name: 'Salt', percentage: 2.5 },
        { name: 'Instant Yeast', percentage: 0.5 },
        { name: 'Olive Oil', percentage: 3 }
      ]
    },
    {
      name: 'Whole Wheat Bread',
      description: '50% whole wheat bread',
      ingredients: [
        { name: 'Bread Flour', percentage: 50, isFlour: true },
        { name: 'Whole Wheat Flour', percentage: 50, isFlour: true },
        { name: 'Water', percentage: 72 },
        { name: 'Salt', percentage: 2 },
        { name: 'Honey', percentage: 3 },
        { name: 'Instant Yeast', percentage: 1.2 }
      ]
    }
  ];

  getPresets(): RecipeTemplate[] {
    return this.presets;
  }

  getPresetByName(name: string): RecipeTemplate | undefined {
    return this.presets.find(p => p.name === name);
  }
}
