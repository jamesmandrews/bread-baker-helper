import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';

@Component({
    selector: 'app-ingredient-row',
    imports: [FormsModule],
    templateUrl: './ingredient-row.component.html',
    styleUrl: './ingredient-row.component.scss'
})
export class IngredientRowComponent {
  readonly ingredient = input.required<Ingredient>();
  readonly isFlourRow = input(false);
  // Allow locking percentage in certain modes
  readonly isPercentageEditable = input(true);

  readonly percentageChange = output<{ id: string, percentage: number }>();
  readonly weightChange = output<{ id: string, weight: number }>();
  readonly nameChange = output<{ id: string, name: string }>();
  readonly remove = output<string>();

  onPercentageChange(value: string): void {
    const percentage = parseFloat(value) || 0;
    this.percentageChange.emit({ id: this.ingredient().id, percentage });
  }

  onWeightChange(value: string): void {
    const weight = parseFloat(value) || 0;
    this.weightChange.emit({ id: this.ingredient().id, weight });
  }

  onNameChange(value: string): void {
    this.nameChange.emit({ id: this.ingredient().id, name: value });
  }

  onRemove(): void {
    this.remove.emit(this.ingredient().id);
  }
}
