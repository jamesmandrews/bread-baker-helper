import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IngredientRowComponent } from '../ingredient-row/ingredient-row.component';
import { Ingredient, RecipeTemplate } from '../../models/ingredient.model';
import { CalculationService } from '../../services/calculation.service';
import { RecipePresetService } from '../../services/recipe-preset.service';

@Component({
    selector: 'app-calculator',
    imports: [FormsModule, IngredientRowComponent],
    templateUrl: './calculator.component.html',
    styleUrl: './calculator.component.scss'
})
export class CalculatorComponent {
  private readonly calcService = inject(CalculationService);
  private readonly presetService = inject(RecipePresetService);

  totalFlourWeight = signal(1000);
  useDoughBallMode = signal(false); // Toggle between flour weight mode and dough ball mode
  targetDoughBallWeight = signal<number>(1730); // Target total dough weight

  ingredients = signal<Ingredient[]>([
    { id: '1', name: 'Flour', percentage: 100, weight: 1000, isFlour: true },
    { id: '2', name: 'Water', percentage: 70, weight: 700 },
    { id: '3', name: 'Salt', percentage: 2, weight: 20 },
    { id: '4', name: 'Instant Yeast', percentage: 1, weight: 10 }
  ]);

  presets: RecipeTemplate[] = [];

  totalWeight = computed(() => this.calcService.calculateTotalWeight(this.ingredients()));
  hydration = computed(() => this.calcService.calculateHydration(this.ingredients()));
  totalPercentage = computed(() => this.calcService.calculateTotalPercentage(this.ingredients()));

  saltWarning = computed(() => {
    const salt = this.ingredients().find(i => i.name.toLowerCase().includes('salt'));
    return salt ? this.calcService.validateSaltPercentage(salt.percentage) : null;
  });

  hydrationWarning = computed(() => {
    return this.calcService.validateHydration(this.hydration());
  });

  constructor() {
    this.presets = this.presetService.getPresets();
  }

  onTotalFlourWeightChange(value: string): void {
    const newWeight = parseFloat(value) || 0;
    this.totalFlourWeight.set(newWeight);
    this.recalculateAllWeights();
  }

  onPercentageChange(event: { id: string, percentage: number }): void {
    this.ingredients.update(ings =>
      ings.map(ing => {
        if (ing.id === event.id) {
          const weight = this.calcService.calculateWeightFromPercentage(
            event.percentage,
            this.totalFlourWeight()
          );
          return { ...ing, percentage: event.percentage, weight };
        }
        return ing;
      })
    );

    // If in dough ball mode and hydration changed, recalculate everything
    if (this.useDoughBallMode()) {
      this.recalculateFromDoughBallWeight();
    }
  }

  onWeightChange(event: { id: string, weight: number }): void {
    const target = this.ingredients().find(ing => ing.id === event.id);
    if (!target) return;

    // Flour is the 100% base, so editing a flour weight rescales the whole
    // recipe rather than just changing one row. Solve for the flour base that
    // puts this row at the requested weight while keeping its percentage, so
    // recipes with several flours stay in proportion.
    if (target.isFlour && target.percentage > 0) {
      this.totalFlourWeight.set(
        this.calcService.calculateFlourWeightFromPart(event.weight, target.percentage)
      );
      this.recalculateAllWeights();
      return;
    }

    this.ingredients.update(ings =>
      ings.map(ing => {
        if (ing.id !== event.id) return ing;
        const percentage = this.calcService.calculatePercentageFromWeight(
          event.weight,
          this.totalFlourWeight()
        );
        return { ...ing, weight: event.weight, percentage };
      })
    );
  }

  onNameChange(event: { id: string, name: string }): void {
    this.ingredients.update(ings =>
      ings.map(ing => ing.id === event.id ? { ...ing, name: event.name } : ing)
    );
  }

  onRemoveIngredient(id: string): void {
    this.ingredients.update(ings => ings.filter(ing => ing.id !== id));
  }

  addIngredient(): void {
    const newId = Date.now().toString();
    const newIngredient: Ingredient = {
      id: newId,
      name: 'New Ingredient',
      percentage: 0,
      weight: 0
    };
    this.ingredients.update(ings => [...ings, newIngredient]);
  }

  loadPreset(presetName: string): void {
    if (!presetName) return;

    const preset = this.presetService.getPresetByName(presetName);
    if (!preset) return;

    const flourWeight = this.totalFlourWeight();
    const newIngredients: Ingredient[] = preset.ingredients.map((ing, index) => ({
      id: Date.now().toString() + index,
      name: ing.name,
      percentage: ing.percentage,
      weight: this.calcService.calculateWeightFromPercentage(ing.percentage, flourWeight),
      isFlour: ing.isFlour
    }));

    this.ingredients.set(newIngredients);
  }

  private recalculateAllWeights(): void {
    this.ingredients.update(ings =>
      ings.map(ing => ({
        ...ing,
        weight: this.calcService.calculateWeightFromPercentage(
          ing.percentage,
          this.totalFlourWeight()
        )
      }))
    );
  }

  // Set specific mode (don't toggle if already in that mode)
  setDoughBallMode(enable: boolean): void {
    // Only switch if we're changing modes
    if (this.useDoughBallMode() === enable) return;

    this.useDoughBallMode.set(enable);

    if (enable) {
      // Switching TO dough ball mode: set target to current total weight
      this.targetDoughBallWeight.set(this.totalWeight());
    } else {
      // Switching FROM dough ball mode: keep current flour weight
      // No action needed, flour weight is already set
    }
  }

  // Handle changes to target dough ball weight
  onTargetDoughBallWeightChange(value: string): void {
    const targetWeight = parseFloat(value) || 0;
    this.targetDoughBallWeight.set(targetWeight);
    this.recalculateFromDoughBallWeight();
  }

  // Recalculate flour weight and all ingredients from target dough ball weight
  private recalculateFromDoughBallWeight(): void {
    const flourWeight = this.calcService.calculateFlourWeightFromTotal(
      this.targetDoughBallWeight(),
      this.ingredients()
    );
    this.totalFlourWeight.set(flourWeight);
    this.recalculateAllWeights();
  }

  // Check if an ingredient's percentage should be editable
  isPercentageEditable(ingredient: Ingredient): boolean {
    if (!this.useDoughBallMode()) {
      return true; // In normal mode, all percentages are editable
    }
    // In dough ball mode, only water (hydration) is editable
    return ingredient.name.toLowerCase() === 'water';
  }
}
