import React, { useState } from 'react';
import { Recipe } from '../types/food';
import {
  Sparkles,
  ChefHat,
  Clock,
  Flame,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Plus,
  X,
  RefreshCw,
  Lightbulb,
  ArrowRight,
  Filter,
  Check,
  Utensils,
  Share2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface RecipeGeneratorProps {
  initialIngredients?: string[];
  initialPrimaryFood?: string;
  savedRecipes: Recipe[];
  onSaveRecipe: (recipe: Recipe) => void;
  onRemoveRecipe: (recipeId: string) => void;
  onMarkCooked: (recipe: Recipe) => void;
}

const COMMON_QUICK_INGREDIENTS = [
  'Cooked Rice',
  'Ripe Tomatoes',
  'Boiled Potatoes',
  'Red Onions',
  'Carrots',
  'Fresh Lemons',
  'Eggs',
  'Spinach',
  'Bread Slices',
  'Curd / Yogurt',
  'Bell Peppers',
  'Lentils (Dal)',
];

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  initialIngredients = [],
  initialPrimaryFood = '',
  savedRecipes,
  onSaveRecipe,
  onRemoveRecipe,
  onMarkCooked,
}) => {
  const [ingredients, setIngredients] = useState<string[]>(
    initialIngredients.length > 0 ? initialIngredients : ['Cooked Rice', 'Ripe Tomatoes']
  );
  const [inputVal, setInputVal] = useState<string>('');
  const [culturalPref, setCulturalPref] = useState<string>('Any Cuisine (Include Indian Classics)');
  const [dietaryChoice, setDietaryChoice] = useState<string>('All');
  const [maxTime, setMaxTime] = useState<string>('30 mins');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>(savedRecipes.slice(0, 2));
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(
    savedRecipes.length > 0 ? savedRecipes[0] : null
  );
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
    }
    setInputVal('');
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputVal);
    }
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      setErrorMsg('Please add at least one ingredient to generate recipes.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients,
          primaryFood: initialPrimaryFood,
          culturalPreference: culturalPref,
          dietary: dietaryChoice !== 'All' ? [dietaryChoice] : [],
          cookingTime: maxTime,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate recipes');
      }

      setGeneratedSummary(data.data.summary || '');
      setRecipes(data.data.recipes || []);
      if (data.data.recipes && data.data.recipes.length > 0) {
        setSelectedRecipe(data.data.recipes[0]);
        setCheckedSteps({});
      }
    } catch (err: any) {
      console.error('Error generating recipes:', err);
      setErrorMsg(
        err.message ||
          'Failed to reach AI recipe engine. Please verify your connection or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = (recipe: Recipe) => {
    const isSaved = savedRecipes.some((r) => r.id === recipe.id);
    if (isSaved) {
      onRemoveRecipe(recipe.id);
    } else {
      onSaveRecipe(recipe);
    }
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipes.some((r) => r.id === recipeId);
  };

  const toggleStep = (stepIdx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx],
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Ingredient Input & Filter Console */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2922] flex items-center gap-2.5">
              <ChefHat className="w-7 h-7 text-[#2D5A3C]" />
              <span>AI Leftover Recipe Generator</span>
            </h2>
            <p className="text-sm text-[#5B6D61] mt-1">
              Turn expiring ingredients, produce scraps, and yesterday’s leftovers into gourmet zero-waste meals.
            </p>
          </div>

          <button
            type="button"
            onClick={generateRecipes}
            disabled={isLoading || ingredients.length === 0}
            className="py-3 px-6 rounded-2xl bg-[#2D5A3C] hover:bg-[#234830] active:scale-95 text-white font-bold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#88D49E]" />
                <span>Creating Custom Recipes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#88D49E]" />
                <span>Generate Rescue Recipes</span>
              </>
            )}
          </button>
        </div>

        {/* Ingredient Chips & Input */}
        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2D5A3C]">
            Ingredients to Rescue ({ingredients.length})
          </label>

          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E3ECE5] min-h-[56px]">
            {ingredients.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#2D5A3C] text-sm font-semibold border border-[#CBD5CD] shadow-sm animate-in fade-in"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeIngredient(item)}
                  className="hover:text-red-500 transition cursor-pointer p-0.5"
                  title={`Remove ${item}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex-1 min-w-[200px] flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type ingredient (e.g. rice, tomato, onion)..."
                className="w-full bg-transparent border-none outline-none text-sm text-[#1E2922] placeholder:text-gray-400 px-2 py-1"
              />
              {inputVal.trim() && (
                <button
                  type="button"
                  onClick={() => addIngredient(inputVal)}
                  className="p-1.5 rounded-lg bg-[#2D5A3C] text-white hover:bg-[#234830] transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-xs text-[#5B6D61] font-medium mr-2">Quick Add:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {COMMON_QUICK_INGREDIENTS.map((item, idx) => {
                const isAdded = ingredients.includes(item);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => (isAdded ? removeIngredient(item) : addIngredient(item))}
                    className={`text-xs px-2.5 py-1 rounded-lg transition cursor-pointer border ${
                      isAdded
                        ? 'bg-[#E8F3EB] border-[#88D49E] text-[#2D5A3C] font-semibold'
                        : 'bg-white border-[#E3ECE5] text-[#5B6D61] hover:border-[#CBD5CD]'
                    }`}
                  >
                    {isAdded ? '✓ ' : '+ '}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E3ECE5]">
            <div>
              <label className="block text-xs font-semibold text-[#5B6D61] mb-1.5">
                Cuisine Style
              </label>
              <select
                value={culturalPref}
                onChange={(e) => setCulturalPref(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
              >
                <option value="Any Cuisine (Include Indian Classics)">
                  Any Cuisine (Indian, Global, Fusion)
                </option>
                <option value="Authentic Indian Leftovers">Authentic Indian Leftovers</option>
                <option value="Quick Global / Continental">Quick Global / Continental</option>
                <option value="Asian Stir-Fries & Noodles">Asian Stir-Fries & Fried Rice</option>
                <option value="Comforting Soups & Stews">Comforting Soups & Stews</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6D61] mb-1.5">
                Dietary Preference
              </label>
              <select
                value={dietaryChoice}
                onChange={(e) => setDietaryChoice(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
              >
                <option value="All">All Diets</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Dairy-Free">Dairy-Free</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6D61] mb-1.5">
                Max Prep & Cook Time
              </label>
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
              >
                <option value="15 mins">⚡ Under 15 Minutes</option>
                <option value="30 mins">⏱ Under 30 Minutes</option>
                <option value="45 mins">🍲 Under 45 Minutes</option>
                <option value="No limit">Any Duration</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">{errorMsg}</div>
          <button
            onClick={generateRecipes}
            className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Culinary Summary */}
      {generatedSummary && (
        <div className="bg-[#E8F3EB] rounded-2xl p-4 sm:p-5 border border-[#88D49E]/40 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#2D5A3C] shrink-0 mt-0.5" />
          <p className="text-sm text-[#1E3A27] leading-relaxed font-medium">
            {generatedSummary}
          </p>
        </div>
      )}

      {/* Recipe Showcase Grid (Cards + Active Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Recipe Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1E2922] text-lg">
              Recipe Suggestions ({recipes.length})
            </h3>
            <span className="text-xs text-[#5B6D61]">Click to view details</span>
          </div>

          <div className="space-y-3">
            {recipes.map((rec) => {
              const isSelected = selectedRecipe?.id === rec.id;
              const saved = isRecipeSaved(rec.id);

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecipe(rec);
                    setCheckedSteps({});
                  }}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white border-[#2D5A3C] shadow-md ring-2 ring-[#2D5A3C]/20'
                      : 'bg-white/80 hover:bg-white border-[#E3ECE5] hover:border-[#CBD5CD] shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A3C] bg-[#E8F3EB] px-2.5 py-0.5 rounded-md">
                      {rec.cuisine}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(rec);
                      }}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-[#2D5A3C] transition cursor-pointer"
                      title={saved ? 'Remove from saved' : 'Save recipe'}
                    >
                      {saved ? (
                        <BookmarkCheck className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-gray-400 hover:text-[#2D5A3C]" />
                      )}
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-[#1E2922] mb-1.5">{rec.title}</h4>
                  <p className="text-xs text-[#5B6D61] line-clamp-2 mb-3 leading-relaxed">
                    {rec.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#5B6D61] pt-2 border-t border-[#F2F4F2]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A3C]" />
                      {rec.cookTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      {rec.difficulty}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">
                      Rescues {rec.rescuedIngredients.length} items
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Recipe Detail Panel */}
        <div className="lg:col-span-7">
          {selectedRecipe ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-xl space-y-6 sticky top-6">
              {/* Header */}
              <div className="border-b border-[#E3ECE5] pb-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F3EB] text-[#2D5A3C]">
                      {selectedRecipe.cuisine}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Difficulty: {selectedRecipe.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSave(selectedRecipe)}
                      className="px-3 py-1.5 rounded-xl border border-[#CBD5CD] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hover:bg-[#FAF7F2]"
                    >
                      {isRecipeSaved(selectedRecipe.id) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4 text-[#2D5A3C]" />
                          <span>Save Recipe</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onMarkCooked(selectedRecipe)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-[#88D49E]" />
                      <span>Cooked This!</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-[#1E2922] mb-2">
                  {selectedRecipe.title}
                </h3>
                <p className="text-sm text-[#4A5D50] leading-relaxed">
                  {selectedRecipe.description}
                </p>

                {/* Timing & Metrics */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#F2F4F2] text-xs text-[#5B6D61]">
                  <div>
                    <span className="text-gray-400">Prep:</span>{' '}
                    <span className="font-semibold text-[#1E2922]">{selectedRecipe.prepTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cook:</span>{' '}
                    <span className="font-semibold text-[#1E2922]">{selectedRecipe.cookTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Yield:</span>{' '}
                    <span className="font-semibold text-[#1E2922]">{selectedRecipe.servings} Servings</span>
                  </div>
                  {selectedRecipe.estimatedFoodSavedGrams && (
                    <div className="text-emerald-700 font-bold bg-[#E8F3EB] px-2 py-0.5 rounded-md">
                      Saves ~{selectedRecipe.estimatedFoodSavedGrams}g food
                    </div>
                  )}
                </div>
              </div>

              {/* Zero-Waste Food Saving Tip */}
              <div className="bg-[#F4F9F5] p-4 rounded-2xl border border-[#D5EADB] flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#2D5A3C] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-[#1E3A27] uppercase tracking-wider mb-1">
                    Food-Saving Chef Tip
                  </h5>
                  <p className="text-xs text-[#2D5A3C] leading-relaxed">
                    {selectedRecipe.foodSavingTip}
                  </p>
                </div>
              </div>

              {/* Ingredients List */}
              <div>
                <h4 className="font-bold text-base text-[#1E2922] mb-3">
                  Ingredients Needed
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        ing.isRescued
                          ? 'bg-[#F2F9F4] border-[#88D49E] text-[#1E3A27] font-medium'
                          : 'bg-[#FAF7F2] border-[#E3ECE5] text-[#3D4F43]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ing.isRescued ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                        />
                        <span>{ing.name}</span>
                      </div>
                      <span className="font-bold text-[#1E2922]">{ing.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#5B6D61]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Rescued item
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Pantry staple / seasoning
                  </span>
                </div>
              </div>

              {/* Step-by-Step Instructions with Checkbox Tracker */}
              <div>
                <h4 className="font-bold text-base text-[#1E2922] mb-3">
                  Step-by-Step Instructions
                </h4>
                <div className="space-y-2.5">
                  {selectedRecipe.instructions.map((step, idx) => {
                    const isDone = checkedSteps[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          isDone
                            ? 'bg-[#E8F3EB]/60 border-[#88D49E] opacity-75'
                            : 'bg-white border-[#E3ECE5] hover:border-[#CBD5CD]'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition ${
                            isDone
                              ? 'bg-[#2D5A3C] text-white'
                              : 'bg-[#FAF7F2] border border-[#CBD5CD] text-[#2D5A3C]'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isDone ? 'line-through text-gray-500' : 'text-[#1E2922]'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Substitutions */}
              {selectedRecipe.substitutions && selectedRecipe.substitutions.length > 0 && (
                <div className="pt-4 border-t border-[#E3ECE5]">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#5B6D61] mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Ingredient Substitutions</span>
                  </h5>
                  <div className="space-y-1.5">
                    {selectedRecipe.substitutions.map((sub, i) => (
                      <div
                        key={i}
                        className="text-xs text-[#3D4F43] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E3ECE5]"
                      >
                        <span className="font-bold text-[#1E2922]">{sub.original}:</span> swap with{' '}
                        <span className="font-semibold text-[#2D5A3C]">{sub.substitute}</span>
                        {sub.note && <span className="text-gray-500"> ({sub.note})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-[#E3ECE5] text-center text-[#5B6D61]">
              <Utensils className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-base font-semibold">Select a recipe from the list to view instructions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
