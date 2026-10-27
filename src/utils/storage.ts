import { PantryItem, Recipe, WasteStats, WasteActivity } from '../types/food';

const STORAGE_KEYS = {
  PANTRY: 'leftoverlens_pantry_v1',
  SAVED_RECIPES: 'leftoverlens_saved_recipes_v1',
  WASTE_STATS: 'leftoverlens_waste_stats_v1',
  LAST_SCAN: 'leftoverlens_last_scan_v1',
};

const INITIAL_PANTRY: PantryItem[] = [
  {
    id: 'p-1',
    name: 'Cooked Basmati Rice',
    category: 'Grains & Carbs',
    quantity: '2',
    unit: 'cups',
    addedDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    storageLocation: 'Fridge',
    notes: 'Leftover from yesterday’s dinner. Ideal for lemon rice or fried rice.',
    isUsed: false,
  },
  {
    id: 'p-2',
    name: 'Ripe Tomatoes',
    category: 'Vegetable',
    quantity: '4',
    unit: 'pieces',
    addedDate: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    storageLocation: 'Fridge',
    notes: 'Softening slightly. Perfect for spicy tomato chutney or pasta sauce.',
    isUsed: false,
  },
  {
    id: 'p-3',
    name: 'Boiled Potatoes',
    category: 'Vegetable',
    quantity: '3',
    unit: 'medium',
    addedDate: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    storageLocation: 'Fridge',
    notes: 'Ready for aloo paratha or quick potato hash.',
    isUsed: false,
  },
  {
    id: 'p-4',
    name: 'Fresh Lemons',
    category: 'Fruit',
    quantity: '2',
    unit: 'whole',
    addedDate: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
    storageLocation: 'Fridge',
    notes: 'Use zest first before juicing.',
    isUsed: false,
  },
  {
    id: 'p-5',
    name: 'Red Onions',
    category: 'Vegetable',
    quantity: '5',
    unit: 'medium',
    addedDate: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
    storageLocation: 'Pantry Counter',
    notes: 'Keep cool and ventilated.',
    isUsed: false,
  },
];

const INITIAL_SAVED_RECIPES: Recipe[] = [
  {
    id: 'sample-lemon-rice',
    title: 'South Indian Lemon Rice (Chitranna)',
    description: 'A fragrant, tangy South Indian classic that breathes new life into yesterday’s leftover cooked rice with mustard seeds, crunchy peanuts, and fresh lemon juice.',
    cuisine: 'South Indian',
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: 2,
    difficulty: 'Easy',
    rescuedIngredients: ['Cooked Basmati Rice', 'Fresh Lemons'],
    pantryStaplesNeeded: ['Mustard seeds', 'Peanuts', 'Curry leaves', 'Turmeric', 'Green chili', 'Oil'],
    ingredients: [
      { name: 'Cold leftover cooked rice', amount: '2 cups', isRescued: true },
      { name: 'Fresh lemon juice', amount: '2 tbsp', isRescued: true },
      { name: 'Cooking oil or ghee', amount: '1.5 tbsp' },
      { name: 'Mustard seeds', amount: '1/2 tsp' },
      { name: 'Roasted peanuts', amount: '2 tbsp' },
      { name: 'Turmeric powder', amount: '1/4 tsp' },
      { name: 'Green chillies (slit)', amount: '2' },
      { name: 'Curry leaves', amount: '6-8 leaves', isOptional: true },
      { name: 'Salt', amount: 'to taste' },
    ],
    instructions: [
      'Gently fluff chilled leftover rice with damp hands or a fork to break any hard clumps.',
      'Heat oil in a heavy skillet over medium heat. Add mustard seeds and let them crackle.',
      'Add raw peanuts and fry until golden and aromatic. Stir in slit green chillies and curry leaves for 30 seconds.',
      'Lower flame to low, sprinkle turmeric powder and salt, and stir immediately to avoid burning.',
      'Add the fluffed cooked rice and fold everything gently until every grain is tinted sun-yellow.',
      'Turn off heat completely. Pour in fresh lemon juice and toss thoroughly. Serve warm with crisp papad or yogurt.',
    ],
    substitutions: [
      { original: 'Fresh lemon', substitute: 'Bottled lemon juice or amchur (dry mango powder)', note: 'Add gradually to balance acidity' },
      { original: 'Peanuts', substitute: 'Cashews or roasted chana dal', note: 'Provides essential crunch' },
    ],
    foodSavingTip: 'Day-old refrigerated rice is actually preferred over freshly cooked rice because dry grains separate neatly without becoming mushy.',
    estimatedFoodSavedGrams: 350,
    tags: ['Indian Leftover', 'Zero-Waste Favorite', '15-Minute Meal', 'Vegetarian'],
    isSaved: true,
    cookedCount: 1,
    lastCookedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'sample-tomato-chutney',
    title: 'Tangy South Indian Tomato Chutney',
    description: 'Transform overripe, bruised, or softening tomatoes into a deeply flavorful, spicy, and tangy condiment that pairs with dosa, idli, rice, or flatbread.',
    cuisine: 'South Indian',
    prepTime: '5 mins',
    cookTime: '15 mins',
    servings: 4,
    difficulty: 'Easy',
    rescuedIngredients: ['Ripe Tomatoes', 'Red Onions'],
    pantryStaplesNeeded: ['Garlic', 'Dry red chillies', 'Oil', 'Mustard seeds', 'Salt'],
    ingredients: [
      { name: 'Overripe tomatoes, chopped', amount: '4 medium', isRescued: true },
      { name: 'Roughly chopped onion', amount: '1 medium', isRescued: true },
      { name: 'Garlic cloves', amount: '4 cloves' },
      { name: 'Dried red chillies', amount: '3-4' },
      { name: 'Cooking oil', amount: '2 tbsp' },
      { name: 'Mustard seeds', amount: '1/2 tsp' },
      { name: 'Salt', amount: 'to taste' },
    ],
    instructions: [
      'Heat 1 tbsp oil in a pan. Sauté garlic, onions, and dry red chillies until onions turn soft and translucent.',
      'Toss in chopped softening tomatoes and a pinch of salt. Cook on medium flame until tomatoes collapse completely into a jammy consistency.',
      'Let cool down for 5 minutes, then blend into a smooth or slightly rustic paste.',
      'In a small tempering ladle, heat the remaining 1 tbsp oil, pop mustard seeds, and pour the crackling oil over the blended chutney.',
      'Store in an airtight jar in the fridge for up to 6 days.',
    ],
    substitutions: [
      { original: 'Red chillies', substitute: 'Red chili flakes or cayenne', note: 'Adjust according to spice tolerance' },
    ],
    foodSavingTip: 'Tomatoes that feel too soft for raw salads have higher concentrated sugars—they yield the most rich, caramelized cooked chutneys.',
    estimatedFoodSavedGrams: 400,
    tags: ['Indian Leftover', 'Pantry Condiment', 'Vegan', 'Gluten-Free'],
    isSaved: true,
    cookedCount: 0,
  },
];

const INITIAL_WASTE_STATS: WasteStats = {
  totalGramsSaved: 1250,
  mealsCooked: 3,
  itemsRescued: 7,
  activities: [
    {
      id: 'act-1',
      action: 'recipe_cooked',
      title: 'Cooked South Indian Lemon Rice',
      description: 'Rescued 2 cups of day-old cooked basmati rice and fresh lemon.',
      gramsSaved: 350,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'act-2',
      action: 'pantry_used',
      title: 'Used Overripe Bananas',
      description: 'Used 3 softening bananas for quick pancake batter.',
      gramsSaved: 400,
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'act-3',
      action: 'recipe_cooked',
      title: 'Cooked Crispy Aloo Tikki',
      description: 'Rescued leftover boiled potatoes and peas.',
      gramsSaved: 500,
      date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    },
  ],
};

// Pantry Storage
export function loadPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PANTRY);
    if (!raw) {
      savePantry(INITIAL_PANTRY);
      return INITIAL_PANTRY;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load pantry from storage', err);
    return INITIAL_PANTRY;
  }
}

export function savePantry(items: PantryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PANTRY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pantry to storage', err);
  }
}

// Recipes Storage
export function loadSavedRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
    if (!raw) {
      saveSavedRecipes(INITIAL_SAVED_RECIPES);
      return INITIAL_SAVED_RECIPES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved recipes', err);
    return INITIAL_SAVED_RECIPES;
  }
}

export function saveSavedRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(recipes));
  } catch (err) {
    console.error('Failed to save recipes to storage', err);
  }
}

// Waste Stats Storage
export function loadWasteStats(): WasteStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WASTE_STATS);
    if (!raw) {
      saveWasteStats(INITIAL_WASTE_STATS);
      return INITIAL_WASTE_STATS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load waste stats', err);
    return INITIAL_WASTE_STATS;
  }
}

export function saveWasteStats(stats: WasteStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WASTE_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save waste stats', err);
  }
}

export function recordRescueActivity(
  action: 'recipe_cooked' | 'pantry_used' | 'food_scanned',
  title: string,
  description: string,
  gramsSaved: number
): WasteStats {
  const current = loadWasteStats();
  const newActivity: WasteActivity = {
    id: 'act-' + Date.now(),
    action,
    title,
    description,
    gramsSaved,
    date: new Date().toISOString(),
  };

  const updated: WasteStats = {
    totalGramsSaved: current.totalGramsSaved + (gramsSaved || 0),
    mealsCooked: action === 'recipe_cooked' ? current.mealsCooked + 1 : current.mealsCooked,
    itemsRescued: action === 'pantry_used' || action === 'recipe_cooked' ? current.itemsRescued + 1 : current.itemsRescued,
    activities: [newActivity, ...current.activities].slice(0, 50),
  };

  saveWasteStats(updated);
  return updated;
}
