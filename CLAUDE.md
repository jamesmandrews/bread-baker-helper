# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bread Helper** is an Angular 18 application that provides bread baking assistance tools. The current implementation features a Baker's Percentage Calculator that helps bakers convert between ingredient percentages and weights, scale recipes, and understand proper bread-making ratios.

## Technology Stack

- **Angular 18.2.12** - Latest Angular with standalone components
- **TypeScript** - Type-safe development
- **SCSS** - Styling with Sass
- **Signals** - Modern Angular reactivity system (instead of RxJS Observables where appropriate)

## Development Commands

### Start Development Server
```bash
cd bread-helper
ng serve
```
Visit `http://localhost:4200`

### Build for Production
```bash
cd bread-helper
ng build
```
Production files output to `dist/bread-helper/`

### Run Tests
```bash
cd bread-helper
ng test
```

### Run Linter
```bash
cd bread-helper
ng lint
```

### Generate Components/Services
```bash
# Generate a new component
ng generate component components/my-component --standalone

# Generate a new service
ng generate service services/my-service
```

## Architecture

### Project Structure

```
bread-helper/
├── src/
│   ├── app/
│   │   ├── components/          # UI Components
│   │   │   ├── calculator/      # Main calculator container (smart component)
│   │   │   └── ingredient-row/  # Individual ingredient input (dumb component)
│   │   ├── models/              # TypeScript interfaces and types
│   │   │   └── ingredient.model.ts
│   │   ├── services/            # Business logic services
│   │   │   ├── calculation.service.ts
│   │   │   └── recipe-preset.service.ts
│   │   ├── app.component.*      # Root component
│   │   ├── app.config.ts        # App configuration
│   │   └── app.routes.ts        # Routing configuration
│   ├── styles.scss              # Global styles
│   └── index.html
```

### Key Architectural Patterns

#### 1. Standalone Components (Angular 18)
- All components use the standalone API (`standalone: true`)
- No NgModules required
- Direct imports in component metadata

#### 2. Signals-Based Reactivity
The calculator uses Angular Signals for reactive state management:
- `signal()` - Writable state
- `computed()` - Derived state (automatically updates when dependencies change)
- Example: `totalWeight = computed(() => this.calcService.calculateTotalWeight(this.ingredients()))`

#### 3. Smart vs Dumb Components
- **Smart Components** (`calculator.component.ts`): Manage state, business logic, service injection
- **Dumb Components** (`ingredient-row.component.ts`): Pure presentation, receive data via `@Input()`, emit events via `@Output()`

#### 4. Service Layer
Services are injectable and provide reusable business logic:
- `CalculationService`: Mathematical calculations (percentages, weights, validation)
- `RecipePresetService`: Recipe templates and presets

### Baker's Percentage Logic

Baker's percentages are fundamental to bread baking:
- **Flour is always 100%** (the base)
- All other ingredients are expressed as percentages of total flour weight
- Example: 70% hydration = 700g water per 1000g flour

The calculator supports bidirectional updates:
1. Change percentage → weight recalculates
2. Change weight → percentage recalculates
3. Change total flour → all weights recalculate

### Component Communication Pattern

```
CalculatorComponent (Smart)
    ├── Manages: totalFlourWeight (signal)
    ├── Manages: ingredients (signal)
    ├── Computes: totalWeight, hydration, warnings
    └── Contains: IngredientRowComponent (Dumb) × N
            ├── Receives: ingredient data via @Input
            └── Emits: changes via @Output
                ├── percentageChange
                ├── weightChange
                ├── nameChange
                └── remove
```

## Data Models

### Core Interfaces (`models/ingredient.model.ts`)

```typescript
interface Ingredient {
  id: string;              // Unique identifier
  name: string;            // Ingredient name
  percentage: number;      // Baker's percentage
  weight: number;          // Actual weight in grams
  isFlour?: boolean;       // Flag for flour (always 100%)
}

interface RecipeTemplate {
  name: string;            // Template name
  description: string;     // Template description
  ingredients: Omit<Ingredient, 'id' | 'weight'>[];
}
```

## Recipe Presets

The app includes 5 built-in recipe templates:
1. Basic White Bread (67% hydration)
2. Sourdough (75% hydration, with levain)
3. French Baguette (70% hydration)
4. Pizza Dough (65% hydration, with olive oil)
5. Whole Wheat Bread (72% hydration, mixed flours)

## Styling Conventions

- **Primary Color**: `#8b4513` (saddle brown - bread-themed)
- **Accent Colors**: Warnings (yellow), Info (blue)
- **Responsive**: Works on mobile and desktop
- **Grid Layout**: Ingredient rows use CSS Grid for alignment

## Future Enhancements (Planned Features)

The following features were planned but not yet implemented:
- Sourdough starter maintenance tracker
- Baking schedule/timer builder
- Temperature-adjusted timing calculations
- Dough temperature calculator
- Unit conversion (metric ↔ imperial)
- Save custom recipes to localStorage
- Print/export recipe cards
- Additional calculator tools (scaling, hydration-only, etc.)

## Development Notes

- Uses Angular 18's control flow syntax (`@for`, `@if`) instead of `*ngFor`, `*ngIf`
- Prefer signals over RxJS for simple state management
- All services use `providedIn: 'root'` for tree-shakeable providers
- Components follow single responsibility principle
- Mathematical calculations are rounded to 1 decimal place for precision
