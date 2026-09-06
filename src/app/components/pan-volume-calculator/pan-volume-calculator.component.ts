import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanVolumeService } from '../../services/pan-volume.service';
import { Pan, DoughDensityPreset } from '../../models/pan-volume.model';

@Component({
    selector: 'app-pan-volume-calculator',
    imports: [FormsModule],
    templateUrl: './pan-volume-calculator.component.html',
    styleUrl: './pan-volume-calculator.component.scss'
})
export class PanVolumeCalculatorComponent {
  // Signals for reactive state
  pans = signal<Pan[]>([
    { id: '1', length: 30, width: 10, height: 10, volume: 0, doughWeight: 0 }
  ]);

  gramsPerCubicCm = signal<number>(0.60); // Default to standard density
  selectedPreset = signal<string>('Standard');

  presets: DoughDensityPreset[];

  // Computed values
  totalDoughWeight = computed(() => {
    const calculation = this.panVolumeService.calculateTotalDough(
      this.pans(),
      this.gramsPerCubicCm()
    );
    return calculation.totalDoughWeight;
  });

  totalVolume = computed(() => {
    const calculation = this.panVolumeService.calculateTotalDough(
      this.pans(),
      this.gramsPerCubicCm()
    );
    return calculation.totalVolume;
  });

  totalVolumeLiters = computed(() => {
    return this.panVolumeService.volumeToLiters(this.totalVolume());
  });

  constructor(private panVolumeService: PanVolumeService) {
    this.presets = this.panVolumeService.getPresets();
    this.updateAllPanWeights();
  }

  // Add a new pan
  addPan(): void {
    const newId = Date.now().toString(); // Use timestamp to ensure unique IDs
    const newPan: Pan = {
      id: newId,
      length: 30,
      width: 10,
      height: 10,
      volume: this.panVolumeService.calculatePanVolume(30, 10, 10),
      doughWeight: this.panVolumeService.calculateDoughWeight(30, 10, 10, this.gramsPerCubicCm())
    };
    this.pans.set([...this.pans(), newPan]);
  }

  // Remove a pan
  removePan(id: string): void {
    if (this.pans().length > 1) {
      this.pans.set(this.pans().filter(pan => pan.id !== id));
    }
  }

  // Update pan dimensions and recalculate weight
  updatePanDimensions(id: string, length: number, width: number, height: number): void {
    const updatedPans = this.pans().map(pan => {
      if (pan.id === id) {
        return {
          ...pan,
          length,
          width,
          height,
          volume: this.panVolumeService.calculatePanVolume(length, width, height),
          doughWeight: this.panVolumeService.calculateDoughWeight(length, width, height, this.gramsPerCubicCm())
        };
      }
      return pan;
    });
    this.pans.set(updatedPans);
  }

  // Update grams per cubic cm (when manually changed)
  updateGramsPerCubicCm(value: number): void {
    this.gramsPerCubicCm.set(value);
    this.selectedPreset.set('Custom');
    this.updateAllPanWeights();
  }

  // Select a preset and update calculations
  selectPreset(preset: DoughDensityPreset): void {
    this.selectedPreset.set(preset.name);
    this.gramsPerCubicCm.set(preset.gramsPerCubicCm);
    this.updateAllPanWeights();
  }

  // Update all pan weights and volumes when grams per cubic cm changes
  private updateAllPanWeights(): void {
    const updatedPans = this.pans().map(pan => ({
      ...pan,
      volume: this.panVolumeService.calculatePanVolume(pan.length, pan.width, pan.height),
      doughWeight: this.panVolumeService.calculateDoughWeight(pan.length, pan.width, pan.height, this.gramsPerCubicCm())
    }));
    this.pans.set(updatedPans);
  }

  // Helper to track pans by id in templates
  trackByPanId(index: number, pan: Pan): string {
    return pan.id;
  }
}
