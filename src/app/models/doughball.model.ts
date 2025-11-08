export interface PizzaPan {
  id: string;
  diameter: number;        // Pan diameter in inches
  doughWeight: number;     // Calculated dough weight in grams
}

export interface DoughballCalculation {
  gramsPerSquareInch: number;  // Grams of dough per square inch
  totalArea: number;            // Total area of all pans in square inches
  totalDoughWeight: number;     // Total dough weight needed in grams
}

export interface DoughballPreset {
  name: string;
  description: string;
  gramsPerSquareInch: number;
}
