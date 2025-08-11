export type UUID = string;

export type IngredientLine = {
  id: UUID;
  originalText: string;
  name: string;
  qty?: string;
  unit?: string;
  note?: string;
};

export type Recipe = {
  id: UUID;
  title: string;
  description?: string;
  tags: string[];
  ingredients: IngredientLine[];
  steps: string[];
  servings: number;
  image?: string;
  updatedAt: string;
  source?: { type: 'manual'|'url'; url?: string };
  sourceFingerprint?: string;
};

export interface ImportService {
  importFromUrl(url: string): Promise<Recipe | null>;
}

export interface UnitConversionService {
  toCanonical(line: IngredientLine): IngredientLine;
}

export interface NutritionService {
  estimate(recipe: Recipe): Promise<null>;
}

export interface OcrService {
  recognize(fileOrUri: string): Promise<string[]>;
}

export interface SmartEngine {
  suggest(_: unknown): Promise<null>;
}

export interface StorageRepository {
  getAllRecipes(): Promise<Recipe[]>;
  upsertRecipe(recipe: Recipe): Promise<void>;
  deleteRecipe(id: UUID): Promise<void>;
}


