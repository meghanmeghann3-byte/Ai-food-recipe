import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CameraScanner } from './components/CameraScanner';
import { ImageUploader } from './components/ImageUploader';
import { ScanResultsView } from './components/ScanResultsView';
import { RecipeGenerator } from './components/RecipeGenerator';
import { SavedRecipesView } from './components/SavedRecipesView';
import { PantryManager } from './components/PantryManager';
import { WasteTracker } from './components/WasteTracker';

import {
  FoodRecognitionResult,
  Recipe,
  PantryItem,
  WasteStats,
} from './types/food';

import {
  loadPantry,
  savePantry,
  loadSavedRecipes,
  saveSavedRecipes,
  loadWasteStats,
  saveWasteStats,
  recordRescueActivity,
} from './utils/storage';

import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // App persistent states
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [wasteStats, setWasteStats] = useState<WasteStats>({
    totalGramsSaved: 0,
    mealsCooked: 0,
    itemsRescued: 0,
    activities: [],
  });

  // Food Scan & AI Recognition states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [recognitionResult, setRecognitionResult] = useState<FoodRecognitionResult | null>(null);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Recipe generation context pass-through
  const [recipeSearchIngredients, setRecipeSearchIngredients] = useState<string[]>([]);
  const [recipePrimaryFood, setRecipePrimaryFood] = useState<string>('');

  // Toast notification state
  const [toast, setToToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToToast({ message, type });
    setTimeout(() => {
      setToToast(null);
    }, 4000);
  };

  // Initialize from storage on mount
  useEffect(() => {
    setPantryItems(loadPantry());
    setSavedRecipes(loadSavedRecipes());
    setWasteStats(loadWasteStats());
  }, []);

  // Send captured or uploaded image to real server-side Gemini API
  const handleAnalyzeFoodImage = async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setRecognitionError(null);

    try {
      // Determine mimeType
      const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const response = await fetch('/api/recognize-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.error ||
            'Failed to recognize food in image. Please ensure your image is clear and try again.'
        );
      }

      const resultData: FoodRecognitionResult = {
        ...json.data,
        capturedImage: imageDataUrl,
        scannedAt: new Date().toISOString(),
      };

      setRecognitionResult(resultData);

      // Record activity in tracker if food is recognized
      if (resultData.isRecognizedFood) {
        const updated = recordRescueActivity(
          'food_scanned',
          `Scanned ${resultData.foodName}`,
          `Identified ${resultData.foodName} (${resultData.category}) for potential rescue recipes.`,
          150 // baseline weight estimate for food inspection
        );
        setWasteStats(updated);
        showToast(`Gemini identified "${resultData.foodName}"!`);
      }
    } catch (err: any) {
      console.error('Error analyzing food:', err);
      setRecognitionError(
        err.message || 'An error occurred during food recognition. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Navigate to recipes from scan results
  const handleFindRecipesFromScan = (ingredients: string[], primaryFood: string) => {
    setRecipeSearchIngredients(ingredients);
    setRecipePrimaryFood(primaryFood);
    setActiveTab('recipes');
  };

  // Add recognized food directly to pantry
  const handleAddScanToPantry = (result: FoodRecognitionResult) => {
    const newItem: PantryItem = {
      id: 'pantry-' + Date.now(),
      name: result.foodName,
      category: result.category || 'Vegetable',
      quantity: result.approximateQuantity || '1 portion',
      unit: '',
      addedDate: new Date().toISOString().split('T')[0],
      expiryDate: null,
      storageLocation: 'Fridge',
      notes: result.storageTip || 'Added from camera food scan',
      isUsed: false,
    };

    const updated = [newItem, ...pantryItems];
    setPantryItems(updated);
    savePantry(updated);
    showToast(`Added "${result.foodName}" to your pantry!`);
  };

  // Pantry handlers
  const handleAddPantryItem = (itemData: Omit<PantryItem, 'id' | 'isUsed'>) => {
    const newItem: PantryItem = {
      ...itemData,
      id: 'pantry-' + Date.now(),
      isUsed: false,
    };
    const updated = [newItem, ...pantryItems];
    setPantryItems(updated);
    savePantry(updated);
    showToast(`Added "${newItem.name}" to pantry.`);
  };

  const handleUpdatePantryItem = (updatedItem: PantryItem) => {
    const updated = pantryItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setPantryItems(updated);
    savePantry(updated);
    showToast(`Updated "${updatedItem.name}".`);
  };

  const handleDeletePantryItem = (itemId: string) => {
    const target = pantryItems.find((i) => i.id === itemId);
    const updated = pantryItems.filter((item) => item.id !== itemId);
    setPantryItems(updated);
    savePantry(updated);
    if (target) {
      showToast(`Removed "${target.name}".`, 'info');
    }
  };

  const handleMarkPantryItemUsed = (item: PantryItem) => {
    const updated = pantryItems.map((i) =>
      i.id === item.id ? { ...i, isUsed: true, usedDate: new Date().toISOString() } : i
    );
    setPantryItems(updated);
    savePantry(updated);

    // Record into waste tracker
    const newStats = recordRescueActivity(
      'pantry_used',
      `Used ${item.name}`,
      `Successfully consumed before expiry (${item.quantity} ${item.unit || ''}).`,
      250 // average ingredient portion grams
    );
    setWasteStats(newStats);
    showToast(`Rescued "${item.name}"! Logged in Waste Tracker. 🌿`);
  };

  const handlePantryCookSelected = (selectedIngredients: string[]) => {
    setRecipeSearchIngredients(selectedIngredients);
    setRecipePrimaryFood('');
    setActiveTab('recipes');
  };

  // Recipe handlers
  const handleSaveRecipe = (recipe: Recipe) => {
    if (!savedRecipes.some((r) => r.id === recipe.id)) {
      const updated = [{ ...recipe, isSaved: true }, ...savedRecipes];
      setSavedRecipes(updated);
      saveSavedRecipes(updated);
      showToast(`Saved "${recipe.title}"!`);
    }
  };

  const handleRemoveSavedRecipe = (recipeId: string) => {
    const target = savedRecipes.find((r) => r.id === recipeId);
    const updated = savedRecipes.filter((r) => r.id !== recipeId);
    setSavedRecipes(updated);
    saveSavedRecipes(updated);
    if (target) {
      showToast(`Removed "${target.title}" from saved.`, 'info');
    }
  };

  const handleMarkRecipeCooked = (recipe: Recipe) => {
    // Update cooked count
    const updatedRecipes = savedRecipes.map((r) => {
      if (r.id === recipe.id) {
        return {
          ...r,
          cookedCount: (r.cookedCount || 0) + 1,
          lastCookedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    setSavedRecipes(updatedRecipes);
    saveSavedRecipes(updatedRecipes);

    // Record in waste tracker
    const grams = recipe.estimatedFoodSavedGrams || 350;
    const newStats = recordRescueActivity(
      'recipe_cooked',
      `Cooked ${recipe.title}`,
      `Rescued ${recipe.rescuedIngredients.join(', ')} into a home-cooked meal.`,
      grams
    );
    setWasteStats(newStats);
    showToast(`Great job! Cooked "${recipe.title}". Saved ~${grams}g of food! 🍲`);
  };

  const handleQuickRecipeStart = (ingredients: string[]) => {
    setRecipeSearchIngredients(ingredients);
    setRecipePrimaryFood('');
    setActiveTab('recipes');
  };

  const handleScanAgain = () => {
    setRecognitionResult(null);
    setRecognitionError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1E2922] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          // If navigating to scan, reset previous result so camera opens
          if (tab === 'scan') {
            setRecognitionResult(null);
            setRecognitionError(null);
          }
        }}
        pantryCount={pantryItems.filter((i) => !i.isUsed).length}
        savedRecipesCount={savedRecipes.length}
        totalKgSaved={(wasteStats.totalGramsSaved / 1000).toFixed(1)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Error notification banner if API recognition failed */}
        {recognitionError && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Food Recognition Issue</strong>
                <p className="mt-0.5 text-xs text-red-700 leading-relaxed">{recognitionError}</p>
              </div>
            </div>
            <button
              onClick={() => setRecognitionError(null)}
              className="text-red-500 hover:text-red-700 p-1 text-xs font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Home */}
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => {
              setActiveTab(tab);
              if (tab === 'scan') {
                setRecognitionResult(null);
                setRecognitionError(null);
              }
            }}
            pantryItems={pantryItems}
            wasteStats={wasteStats}
            onQuickRecipeStart={handleQuickRecipeStart}
          />
        )}

        {/* Tab 2: Scan Food (Front camera preferred) */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {!recognitionResult ? (
              <CameraScanner
                onCaptureComplete={handleAnalyzeFoodImage}
                onSwitchToUpload={() => setActiveTab('upload')}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <ScanResultsView
                result={recognitionResult}
                onFindRecipes={handleFindRecipesFromScan}
                onAddToPantry={handleAddScanToPantry}
                onScanAgain={handleScanAgain}
              />
            )}
          </div>
        )}

        {/* Tab 3: Upload Food Image */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {!recognitionResult ? (
              <ImageUploader
                onImageSelected={handleAnalyzeFoodImage}
                onSwitchToCamera={() => {
                  setRecognitionResult(null);
                  setActiveTab('scan');
                }}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <ScanResultsView
                result={recognitionResult}
                onFindRecipes={handleFindRecipesFromScan}
                onAddToPantry={handleAddScanToPantry}
                onScanAgain={handleScanAgain}
              />
            )}
          </div>
        )}

        {/* Tab 4: Recipe Generator & Manual Ingredient Entry */}
        {activeTab === 'recipes' && (
          <RecipeGenerator
            initialIngredients={recipeSearchIngredients}
            initialPrimaryFood={recipePrimaryFood}
            savedRecipes={savedRecipes}
            onSaveRecipe={handleSaveRecipe}
            onRemoveRecipe={handleRemoveSavedRecipe}
            onMarkCooked={handleMarkRecipeCooked}
          />
        )}

        {/* Tab 5: Saved Recipes Collection */}
        {activeTab === 'saved' && (
          <SavedRecipesView
            recipes={savedRecipes}
            onRemoveRecipe={handleRemoveSavedRecipe}
            onMarkCooked={handleMarkRecipeCooked}
          />
        )}

        {/* Tab 6: My Pantry */}
        {activeTab === 'pantry' && (
          <PantryManager
            items={pantryItems}
            onAddItem={handleAddPantryItem}
            onUpdateItem={handleUpdatePantryItem}
            onDeleteItem={handleDeletePantryItem}
            onMarkAsUsed={handleMarkPantryItemUsed}
            onFindRecipesForSelected={handlePantryCookSelected}
          />
        )}

        {/* Tab 7: Food Waste Tracker */}
        {activeTab === 'tracker' && (
          <WasteTracker stats={wasteStats} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3ECE5] bg-white/70 py-8 text-center text-xs text-[#5B6D61]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1E2922]">LeftoverLens</span>
            <span>•</span>
            <span>"See the potential. Save the food."</span>
          </div>
          <div>
            Built with Google AI Studio • Real Multimodal Gemini Vision
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2922] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#3E7451] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#88D49E] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
