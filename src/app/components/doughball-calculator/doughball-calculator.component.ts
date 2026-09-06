import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DoughballService } from '../../services/doughball.service';
import { PizzaPan, DoughballPreset } from '../../models/doughball.model';

@Component({
    selector: 'app-doughball-calculator',
    imports: [FormsModule],
    templateUrl: './doughball-calculator.component.html',
    styleUrl: './doughball-calculator.component.scss'
})
export class DoughballCalculatorComponent {
  // Signals for reactive state
  pans = signal<PizzaPan[]>([
    { id: '1', diameter: 12, doughWeight: 0 }
  ]);

  gramsPerSquareInch = signal<number>(3.402); // Default to medium crust
  selectedPreset = signal<string>('Medium Crust');

  presets: DoughballPreset[];

  // Computed values
  totalDoughWeight = computed(() => {
    const calculation = this.doughballService.calculateTotalDough(
      this.pans(),
      this.gramsPerSquareInch()
    );
    return calculation.totalDoughWeight;
  });

  totalArea = computed(() => {
    const calculation = this.doughballService.calculateTotalDough(
      this.pans(),
      this.gramsPerSquareInch()
    );
    return calculation.totalArea;
  });

  constructor(private doughballService: DoughballService) {
    this.presets = this.doughballService.getPresets();
    this.updateAllPanWeights();
  }

  // Add a new pizza pan
  addPan(): void {
    const newId = Date.now().toString(); // Use timestamp to ensure unique IDs
    const newPan: PizzaPan = {
      id: newId,
      diameter: 12,
      doughWeight: this.doughballService.calculateDoughWeight(12, this.gramsPerSquareInch())
    };
    this.pans.set([...this.pans(), newPan]);
  }

  // Remove a pizza pan
  removePan(id: string): void {
    if (this.pans().length > 1) {
      this.pans.set(this.pans().filter(pan => pan.id !== id));
    }
  }

  // Update pan diameter and recalculate weight
  updatePanDiameter(id: string, diameter: number): void {
    const updatedPans = this.pans().map(pan => {
      if (pan.id === id) {
        return {
          ...pan,
          diameter,
          doughWeight: this.doughballService.calculateDoughWeight(diameter, this.gramsPerSquareInch())
        };
      }
      return pan;
    });
    this.pans.set(updatedPans);
  }

  // Update grams per square inch (when manually changed)
  updateGramsPerSquareInch(value: number): void {
    this.gramsPerSquareInch.set(value);
    this.selectedPreset.set('Custom');
    this.updateAllPanWeights();
  }

  // Select a preset and update calculations
  selectPreset(preset: DoughballPreset): void {
    this.selectedPreset.set(preset.name);
    this.gramsPerSquareInch.set(preset.gramsPerSquareInch);
    this.updateAllPanWeights();
  }

  // Update all pan weights when grams per square inch changes
  private updateAllPanWeights(): void {
    const updatedPans = this.pans().map(pan => ({
      ...pan,
      doughWeight: this.doughballService.calculateDoughWeight(pan.diameter, this.gramsPerSquareInch())
    }));
    this.pans.set(updatedPans);
  }

  // Get individual pan area
  getPanArea(diameter: number): number {
    return Math.round(this.doughballService.calculatePanArea(diameter) * 10) / 10;
  }

  // Helper to track pans by id in templates
  trackByPanId(index: number, pan: PizzaPan): string {
    return pan.id;
  }
}
