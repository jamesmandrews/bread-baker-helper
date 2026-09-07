export interface Pan {
  id: string;
  length: number;        // Length in cm
  width: number;         // Width in cm
  height: number;        // Height/depth in cm
  volume: number;        // Volume in cubic cm
  doughWeight: number;   // Calculated dough weight in grams
}

export interface PanVolumeCalculation {
  percentOfCapacity: number; // Share of the pan's volume filled with raw dough
  totalVolume: number;       // Total volume of all pans in cubic cm
  totalDoughWeight: number;  // Total dough weight needed in grams
}

export interface PanFillPreset {
  name: string;
  description: string;
  percentOfCapacity: number;
}
