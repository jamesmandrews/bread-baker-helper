import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PanVolumeService } from '../../services/pan-volume.service';
import { Pan, PanFillPreset } from '../../models/pan-volume.model';

@Component({
    selector: 'app-pan-volume-calculator',
    imports: [FormsModule],
    templateUrl: './pan-volume-calculator.component.html',
    styleUrl: './pan-volume-calculator.component.scss'
})
export class PanVolumeCalculatorComponent {
  private readonly panVolumeService = inject(PanVolumeService);

  // Signals for reactive state
  pans = signal<Pan[]>([
    { id: '1', length: 30, width: 10, height: 10, volume: 0, doughWeight: 0 }
  ]);

  /** Share of the pan's capacity filled with raw dough. */
  percentOfCapacity = signal<number>(45); // Default to a standard sandwich loaf
  selectedPreset = signal<string>('Standard');

  presets: PanFillPreset[];

  /** The same ratio in the units some baking sources state it in. */
  gramsPerCubicCm = computed(() => this.panVolumeService.gramsPerCubicCm(this.percentOfCapacity()));

  // Computed values
  totalDoughWeight = computed(() => {
    const calculation = this.panVolumeService.calculateTotalDough(
      this.pans(),
      this.percentOfCapacity()
    );
    return calculation.totalDoughWeight;
  });

  totalVolume = computed(() => {
    const calculation = this.panVolumeService.calculateTotalDough(
      this.pans(),
      this.percentOfCapacity()
    );
    return calculation.totalVolume;
  });

  totalVolumeLiters = computed(() => {
    return this.panVolumeService.volumeToLiters(this.totalVolume());
  });

  constructor() {
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
      doughWeight: this.panVolumeService.calculateDoughWeight(30, 10, 10, this.percentOfCapacity())
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
          doughWeight: this.panVolumeService.calculateDoughWeight(length, width, height, this.percentOfCapacity())
        };
      }
      return pan;
    });
    this.pans.set(updatedPans);
  }

  // Update the fill percentage (when manually changed)
  updatePercentOfCapacity(value: number): void {
    this.percentOfCapacity.set(value);
    this.selectedPreset.set('Custom');
    this.updateAllPanWeights();
  }

  // Select a preset and update calculations
  selectPreset(preset: PanFillPreset): void {
    this.selectedPreset.set(preset.name);
    this.percentOfCapacity.set(preset.percentOfCapacity);
    this.updateAllPanWeights();
  }

  // Update all pan weights and volumes when the fill percentage changes
  private updateAllPanWeights(): void {
    const updatedPans = this.pans().map(pan => ({
      ...pan,
      volume: this.panVolumeService.calculatePanVolume(pan.length, pan.width, pan.height),
      doughWeight: this.panVolumeService.calculateDoughWeight(pan.length, pan.width, pan.height, this.percentOfCapacity())
    }));
    this.pans.set(updatedPans);
  }
}
