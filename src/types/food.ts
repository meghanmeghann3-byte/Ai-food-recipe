export interface FoodRecognitionResult {
  isRecognizedFood: boolean;
  foodName: string;
  category: string;
  foodState: 'raw_ingredient' | 'prepared_dish' | 'leftover' | 'packaged_food' | string;
  description: string;
  visibleIngredients: string[];
  approximateQuantity: string;
  freshnessObservation: string;
  confidenceScore: number;
  uncertaintyNotes?: string;
  alternativeIdentifications?: string[];
  storageTip: string;
  suggestedDishes?: string[];
  capturedImage: string;
  scannedAt: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  isRescued?: boolean;
  isOptional?: boolean;
}

export interface RecipeSubstitution {
  original: string;
  substitute: string;
  note?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced' | string;
  rescuedIngredients: string[];
  pantryStaplesNeeded?: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  substitutions?: RecipeSubstitution[];
  foodSavingTip: string;
  estimatedFoodSavedGrams?: number;
  tags?: string[];
  isSaved?: boolean;
  cookedCount?: number;
  lastCookedAt?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  addedDate: string;
  expiryDate: string | null;
  storageLocation: 'Fridge' | 'Freezer' | 'Pantry Counter' | 'Cupboard';
  notes?: string;
  isUsed: boolean;
  usedDate?: string;
}

export interface WasteActivity {
  id: string;
  action: 'recipe_cooked' | 'pantry_used' | 'food_scanned';
  title: string;
  description: string;
  gramsSaved: number;
  date: string;
}

export interface WasteStats {
  totalGramsSaved: number;
  mealsCooked: number;
  itemsRescued: number;
  activities: WasteActivity[];
}
