import React, { useState } from 'react';
import { Recipe } from '../types/food';
import {
  BookmarkCheck,
  Search,
  Clock,
  Flame,
  Trash2,
  CheckCircle2,
  Utensils,
  ChevronRight,
  Lightbulb,
  Check,
} from 'lucide-react';

interface SavedRecipesViewProps {
  recipes: Recipe[];
  onRemoveRecipe: (recipeId: string) => void;
  onMarkCooked: (recipe: Recipe) => void;
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({
  recipes,
  onRemoveRecipe,
  onMarkCooked,
}) => {
  const [search, setSearch] = useState<string>('');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(
    recipes.length > 0 ? recipes[0] : null
  );
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  const filtered = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
      r.rescuedIngredients.some((ing) => ing.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookmarkCheck className="w-6 h-6 text-[#2D5A3C]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2922]">
              Saved Leftover Recipes
            </h2>
            <span className="bg-[#E8F3EB] text-[#2D5A3C] text-xs font-bold px-2.5 py-1 rounded-full">
              {recipes.length} Saved
            </span>
          </div>
          <p className="text-sm text-[#5B6D61]">
            Your personal collection of zero-waste recipes ready to cook anytime.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved recipes..."
            className="w-full bg-[#FAF7F2] pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5CD] text-xs sm:text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
          />
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E3ECE5]">
          <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#1E2922] mb-1">No saved recipes yet</h4>
          <p className="text-xs text-[#5B6D61] max-w-sm mx-auto mb-5">
            Generate recipes from your food scans or manual ingredient entries, and click the bookmark icon to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recipe list column */}
          <div className="lg:col-span-5 space-y-3">
            {filtered.map((r) => {
              const isSelected = activeRecipe?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setActiveRecipe(r);
                    setCheckedSteps({});
                  }}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white border-[#2D5A3C] shadow-md ring-2 ring-[#2D5A3C]/20'
                      : 'bg-white/80 hover:bg-white border-[#E3ECE5] hover:border-[#CBD5CD]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A3C] bg-[#E8F3EB] px-2.5 py-0.5 rounded-md">
                      {r.cuisine}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecipe(r.id);
                        if (activeRecipe?.id === r.id) {
                          setActiveRecipe(null);
                        }
                      }}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="font-bold text-base text-[#1E2922] mb-1">{r.title}</h4>
                  <p className="text-xs text-[#5B6D61] line-clamp-2 mb-3 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-[#5B6D61] pt-2 border-t border-[#F2F4F2]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A3C]" />
                      {r.cookTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      {r.difficulty}
                    </span>
                    {r.cookedCount && r.cookedCount > 0 ? (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">
                          Cooked {r.cookedCount}x
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Recipe Detail Column */}
          <div className="lg:col-span-7">
            {activeRecipe ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-xl space-y-6 sticky top-6">
                <div className="border-b border-[#E3ECE5] pb-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F3EB] text-[#2D5A3C]">
                        {activeRecipe.cuisine}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {activeRecipe.difficulty}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onMarkCooked(activeRecipe)}
                      className="px-4 py-2 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#88D49E]" />
                      <span>Mark Cooked Today</span>
                    </button>
                  </div>

                  <h3 className="text-2xl font-extrabold text-[#1E2922] mb-2">
                    {activeRecipe.title}
                  </h3>
                  <p className="text-sm text-[#4A5D50] leading-relaxed">
                    {activeRecipe.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#F2F4F2] text-xs text-[#5B6D61]">
                    <div>
                      <span className="text-gray-400">Prep:</span>{' '}
                      <span className="font-semibold text-[#1E2922]">{activeRecipe.prepTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cook:</span>{' '}
                      <span className="font-semibold text-[#1E2922]">{activeRecipe.cookTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Yield:</span>{' '}
                      <span className="font-semibold text-[#1E2922]">{activeRecipe.servings} Servings</span>
                    </div>
                    {activeRecipe.estimatedFoodSavedGrams && (
                      <div className="text-emerald-700 font-bold bg-[#E8F3EB] px-2 py-0.5 rounded-md">
                        Saves ~{activeRecipe.estimatedFoodSavedGrams}g food
                      </div>
                    )}
                  </div>
                </div>

                {/* Food saving tip */}
                <div className="bg-[#F4F9F5] p-4 rounded-2xl border border-[#D5EADB] flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-[#2D5A3C] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-[#1E3A27] uppercase tracking-wider mb-1">
                      Chef's Leftover Rescue Tip
                    </h5>
                    <p className="text-xs text-[#2D5A3C] leading-relaxed">
                      {activeRecipe.foodSavingTip}
                    </p>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="font-bold text-base text-[#1E2922] mb-3">
                    Ingredients List
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeRecipe.ingredients.map((ing, idx) => (
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
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-bold text-base text-[#1E2922] mb-3">
                    Cooking Instructions
                  </h4>
                  <div className="space-y-2.5">
                    {activeRecipe.instructions.map((step, idx) => {
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
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 border border-[#E3ECE5] text-center text-[#5B6D61]">
                <Utensils className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-base font-semibold">Select a saved recipe to see instructions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
