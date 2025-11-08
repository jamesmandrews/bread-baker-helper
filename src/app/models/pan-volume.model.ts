export interface Pan {
  id: string;
  length: number;        // Length in cm
  width: number;         // Width in cm
  height: number;        // Height/depth in cm
  volume: number;        // Volume in cubic cm
  doughWeight: number;   // Calculated dough weight in grams
}

export interface PanVolumeCalculation {
  gramsPerCubicCm: number;  // Grams of dough per cubic cm
  totalVolume: number;       // Total volume of all pans in cubic cm
  totalDoughWeight: number;  // Total dough weight needed in grams
}

export interface DoughDensityPreset {
  name: string;
  description: string;
  gramsPerCubicCm: number;
}
