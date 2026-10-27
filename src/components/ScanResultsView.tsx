import React, { useState } from 'react';
import { FoodRecognitionResult } from '../types/food';
import {
  Sparkles,
  UtensilsCrossed,
  PackagePlus,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Tag,
  Scale,
  ChefHat,
  ChevronRight,
} from 'lucide-react';

interface ScanResultsViewProps {
  result: FoodRecognitionResult;
  onFindRecipes: (ingredients: string[], primaryFood: string) => void;
  onAddToPantry: (result: FoodRecognitionResult) => void;
  onScanAgain: () => void;
}

export const ScanResultsView: React.FC<ScanResultsViewProps> = ({
  result,
  onFindRecipes,
  onAddToPantry,
  onScanAgain,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    result.visibleIngredients.length > 0 ? result.visibleIngredients : [result.foodName]
  );
  const [isAddedToPantry, setIsAddedToPantry] = useState<boolean>(false);

  const toggleIngredient = (ing: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  const handlePantryClick = () => {
    onAddToPantry(result);
    setIsAddedToPantry(true);
  };

  // If AI determined this is not recognizable food or image was unusable
  if (!result.isRecognizedFood) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-[#E3ECE5] shadow-xl p-6 sm:p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#1E2922] mb-2">
          Unable to Confidently Identify Food
        </h3>
        <p className="text-sm text-[#5B6D61] max-w-md mx-auto mb-6 leading-relaxed">
          {result.description ||
            'The image was too blurry, obscured, or does not appear to contain recognizable food items. We never guess ingredients to ensure your safety.'}
        </p>

        {result.capturedImage && (
          <div className="max-w-xs mx-auto mb-6 rounded-2xl overflow-hidden border border-[#CBD5CD] shadow-sm">
            <img
              src={result.capturedImage}
              alt="Unrecognized capture"
              className="w-full h-44 object-cover"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onScanAgain}
            className="px-6 py-3 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white font-semibold text-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again with Front Camera
          </button>
        </div>
      </div>
    );
  }

  // Format food state display
  const foodStateLabels: Record<string, { label: string; color: string }> = {
    raw_ingredient: { label: 'Raw Ingredient / Produce', color: 'bg-emerald-100 text-emerald-800' },
    prepared_dish: { label: 'Prepared Dish', color: 'bg-amber-100 text-amber-800' },
    leftover: { label: 'Leftover Food', color: 'bg-teal-100 text-teal-800' },
    packaged_food: { label: 'Packaged Food', color: 'bg-blue-100 text-blue-800' },
  };

  const stateBadge = foodStateLabels[result.foodState] || {
    label: result.foodState.replace('_', ' '),
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-[#E3ECE5] shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Photo Preview Column */}
          <div className="md:col-span-5 bg-black/5 relative min-h-[240px]">
            <img
              src={result.capturedImage}
              alt={result.foodName}
              className="w-full h-full object-cover min-h-[240px]"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stateBadge.color} shadow-sm backdrop-blur-sm`}>
                {stateBadge.label}
              </span>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
              Scanned {new Date(result.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Core Info Column */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A3C] bg-[#E8F3EB] px-2.5 py-0.5 rounded-md">
                  {result.category}
                </span>

                {/* Confidence Meter */}
                <div className="flex items-center gap-1.5 text-xs text-[#5B6D61]" title="Gemini vision confidence score">
                  <span className="font-medium">Confidence:</span>
                  <span className="font-bold text-[#2D5A3C]">{result.confidenceScore}%</span>
                  <div className="w-14 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.confidenceScore >= 80
                          ? 'bg-emerald-500'
                          : result.confidenceScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidenceScore}%` }}
                    />
                  </div>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2922] mb-2 leading-tight">
                {result.foodName}
              </h2>

              <p className="text-sm text-[#4A5D50] leading-relaxed mb-4">
                {result.description}
              </p>

              {/* Quantity Estimate */}
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E3ECE5] flex items-start gap-2.5 mb-3 text-xs text-[#3D4F43]">
                <Scale className="w-4 h-4 text-[#2D5A3C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1E2922]">Approximate Quantity: </span>
                  <span>{result.approximateQuantity || 'Quantity not strictly measurable from photo'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onFindRecipes(selectedIngredients, result.foodName)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChefHat className="w-4 h-4 text-[#88D49E]" />
                <span>Find Leftover Recipes</span>
              </button>

              <button
                type="button"
                onClick={handlePantryClick}
                disabled={isAddedToPantry}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isAddedToPantry
                    ? 'bg-[#E8F3EB] border-[#88D49E] text-[#2D5A3C]'
                    : 'border-[#CBD5CD] text-[#2D5A3C] hover:bg-[#FAF7F2]'
                }`}
              >
                {isAddedToPantry ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>In Pantry!</span>
                  </>
                ) : (
                  <>
                    <PackagePlus className="w-4 h-4" />
                    <span>Add to Pantry</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onScanAgain}
                className="p-3 rounded-xl border border-[#CBD5CD] text-[#5B6D61] hover:text-[#1E2922] hover:bg-gray-100 transition cursor-pointer"
                title="Scan another food item"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Visible Ingredients Selection */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3ECE5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#1E2922] flex items-center gap-2 text-base">
                <UtensilsCrossed className="w-4 h-4 text-[#2D5A3C]" />
                <span>Visible Ingredients ({result.visibleIngredients.length})</span>
              </h4>
              <span className="text-xs text-[#5B6D61]">Tap to toggle for recipes</span>
            </div>

            <p className="text-xs text-[#5B6D61] mb-3">
              Select which recognized items you want to feature when generating rescue recipes:
            </p>

            <div className="flex flex-wrap gap-2">
              {result.visibleIngredients.map((item, idx) => {
                const isChecked = selectedIngredients.includes(item);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleIngredient(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 ${
                      isChecked
                        ? 'bg-[#2D5A3C] text-white border-[#2D5A3C]'
                        : 'bg-[#FAF7F2] text-[#4A5D50] border-[#E3ECE5] hover:border-[#CBD5CD]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-[#88D49E]' : 'bg-gray-300'}`} />
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {result.suggestedDishes && result.suggestedDishes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#E3ECE5]">
              <span className="text-xs font-semibold text-[#2D5A3C] uppercase tracking-wider block mb-1.5">
                Quick Dish Ideas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.suggestedDishes.map((dish, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#E8F3EB] text-[#2D5A3C] px-2.5 py-1 rounded-lg font-medium"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Freshness, Uncertainty & Storage Tip */}
        <div className="space-y-4">
          {/* Freshness & Food Safety Caution */}
          <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#F2E7D5] shadow-sm">
            <h4 className="font-bold text-[#8A5A18] flex items-center gap-2 text-sm mb-2">
              <ShieldAlert className="w-4 h-4 text-[#C27803]" />
              <span>Visual Freshness & Condition</span>
            </h4>
            <p className="text-xs text-[#5D4625] leading-relaxed">
              {result.freshnessObservation}
            </p>
            <p className="mt-2 text-[11px] text-[#8C6D42] italic">
              * Note: Visual assessment cannot guarantee microbiological safety. Always smell, inspect texture, and ensure proper reheating before consuming.
            </p>
          </div>

          {/* Zero-Waste Storage Tip */}
          <div className="bg-[#F4F9F5] rounded-3xl p-5 border border-[#D5EADB] shadow-sm">
            <h4 className="font-bold text-[#1E3A27] flex items-center gap-2 text-sm mb-1.5">
              <Lightbulb className="w-4 h-4 text-[#2D5A3C]" />
              <span>Zero-Waste Preservation Tip</span>
            </h4>
            <p className="text-xs text-[#2D5A3C] leading-relaxed">
              {result.storageTip}
            </p>
          </div>

          {/* Uncertainty / Alternative Identifications (if ambiguous) */}
          {result.alternativeIdentifications && result.alternativeIdentifications.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-[#E3ECE5] text-xs text-[#5B6D61]">
              <div className="flex items-center gap-1.5 font-semibold text-[#1E2922] mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
                <span>Alternative possibilities:</span>
              </div>
              <p className="text-gray-600">
                {result.alternativeIdentifications.join(', ')}
              </p>
              {result.uncertaintyNotes && (
                <p className="mt-1 text-[11px] text-gray-500 italic">
                  Why: {result.uncertaintyNotes}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
