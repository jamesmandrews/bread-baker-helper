export interface Ingredient {
  id: string;
  name: string;
  percentage: number;
  weight: number;
  isFlour?: boolean;
}

export interface Recipe {
  name: string;
  totalFlourWeight: number;
  ingredients: Ingredient[];
}

export interface RecipeTemplate {
  name: string;
  description: string;
  ingredients: Omit<Ingredient, 'id' | 'weight'>[];
}
