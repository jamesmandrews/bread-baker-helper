import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ingredient } from '../../models/ingredient.model';

@Component({
    selector: 'app-ingredient-row',
    imports: [CommonModule, FormsModule],
    templateUrl: './ingredient-row.component.html',
    styleUrl: './ingredient-row.component.scss'
})
export class IngredientRowComponent {
  @Input() ingredient!: Ingredient;
  @Input() isFlourRow: boolean = false;
  @Input() isPercentageEditable: boolean = true; // Allow locking percentage in certain modes
  @Output() percentageChange = new EventEmitter<{ id: string, percentage: number }>();
  @Output() weightChange = new EventEmitter<{ id: string, weight: number }>();
  @Output() nameChange = new EventEmitter<{ id: string, name: string }>();
  @Output() remove = new EventEmitter<string>();

  onPercentageChange(value: string): void {
    const percentage = parseFloat(value) || 0;
    this.percentageChange.emit({ id: this.ingredient.id, percentage });
  }

  onWeightChange(value: string): void {
    const weight = parseFloat(value) || 0;
    this.weightChange.emit({ id: this.ingredient.id, weight });
  }

  onNameChange(value: string): void {
    this.nameChange.emit({ id: this.ingredient.id, name: value });
  }

  onRemove(): void {
    this.remove.emit(this.ingredient.id);
  }
}
