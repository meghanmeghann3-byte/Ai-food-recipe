import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.K_SERVICE);
// In AI Studio development, dev server must run on port 3000.
// In Cloud Run deployment (production), listen on process.env.PORT (or fallback to 3000).
const PORT = isProd && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Generous body limit for full resolution webcam & camera captures
app.use(express.json({ limit: '25mb' }));

// Helper to get Gemini client
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Call Gemini with intelligent fallback between valid Gemini 3 models (3.1-flash-lite and 3.8-flash)
async function generateWithFallback(options: {
  contents: any;
  config?: any;
}): Promise<string> {
  const ai = getGenAIClient();
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  let lastError: any = null;
  for (const model of modelsToTry) {
    try {
      console.log(`[LeftoverLens AI] Generating with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });

      const textOutput = response.text;
      if (textOutput) {
        return textOutput;
      }
    } catch (err: any) {
      console.warn(`[LeftoverLens AI] Attempt with ${model} failed:`, err?.message || err);
      lastError = err;
      // If error is 503 or transient, continue to next model
    }
  }

  throw lastError || new Error('All model attempts failed.');
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Real AI Food Recognition Endpoint
app.post('/api/recognize-food', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing image data. Please capture or upload a valid food image.',
      });
      return;
    }

    // Clean base64 data prefix if present (e.g., data:image/jpeg;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const prompt = `Analyze this food image carefully and thoroughly.
Identify:
1. Primary food, dish, or produce item name.
2. Category: one of ["Vegetable", "Fruit", "Grains & Carbs", "Prepared Dish", "Dairy & Eggs", "Protein & Meat", "Bakery & Bread", "Condiment & Sauce", "Snack", "Beverage", "Other"].
3. Food state: one of ["raw_ingredient", "prepared_dish", "leftover", "packaged_food"].
4. Visible ingredients or items detected in the image.
5. Approximate quantity (only when reasonably estimable from visual cues; if not clearly discernable, state so honestly e.g. "approx. 2 medium items" or "single portion, approx. 200g").
6. Freshness and spoilage evaluation: examine visible texture, discoloration, wilting, bruising, or browning. Clearly state uncertainty (e.g., "Visual appearance only; always smell, touch, and inspect before consuming. No visible mold seen.").
7. Confidence score: integer 0 to 100.
8. Confidence assessment & uncertainty notes: explain why confidence is high or what ambiguities exist (lighting, angle, obscured view).
9. Alternative plausible identifications if ambiguous.
10. Short description of what is seen.
11. Recommended food rescue / storage tip to keep it fresh or prevent waste.
12. IsRecognizedFood: true if recognizable edible items or ingredients are detected. If the image is blurry, contains no food, or is completely obscure, set isRecognizedFood to false and explain in description.

Strictly return structured JSON adhering to the specified schema.`;

    const textOutput = await generateWithFallback({
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRecognizedFood: {
              type: Type.BOOLEAN,
              description: 'Whether recognizable food items were found in the image',
            },
            foodName: {
              type: Type.STRING,
              description: 'Identified food or dish name',
            },
            category: {
              type: Type.STRING,
              description: 'Broad food category',
            },
            foodState: {
              type: Type.STRING,
              description: 'raw_ingredient, prepared_dish, leftover, or packaged_food',
            },
            description: {
              type: Type.STRING,
              description: 'Detailed description of the recognized item(s)',
            },
            visibleIngredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of visible foods, ingredients, or components',
            },
            approximateQuantity: {
              type: Type.STRING,
              description: 'Visual quantity estimate or statement of uncertainty',
            },
            freshnessObservation: {
              type: Type.STRING,
              description: 'Observations regarding freshness, wilting, browning, or safety warnings with explicit uncertainty statement',
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: 'Confidence level from 0 to 100',
            },
            uncertaintyNotes: {
              type: Type.STRING,
              description: 'Any factors contributing to uncertainty (viewpoint, obscured sauce, etc.)',
            },
            alternativeIdentifications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Other possible interpretations if ambiguous',
            },
            storageTip: {
              type: Type.STRING,
              description: 'Practical storage or preservation advice to avoid waste',
            },
            suggestedDishes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 quick dish ideas that could use this item',
            },
          },
          required: [
            'isRecognizedFood',
            'foodName',
            'category',
            'foodState',
            'description',
            'visibleIngredients',
            'approximateQuantity',
            'freshnessObservation',
            'confidenceScore',
            'storageTip',
          ],
        },
      },
    });

    const parsed = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/recognize-food:', error);
    const message = error?.message || 'Failed to analyze food image.';
    const isApiKeyError = message.includes('API_KEY') || message.includes('apiKey');

    res.status(isApiKeyError ? 401 : 500).json({
      success: false,
      error: message,
      isApiKeyMissing: isApiKeyError,
    });
  }
});

// AI Recipe Generator Endpoint
app.post('/api/generate-recipes', async (req: Request, res: Response) => {
  try {
    const {
      ingredients = [],
      primaryFood = '',
      dietary = [],
      cookingTime = '',
      skillLevel = '',
      culturalPreference = '',
    } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Please provide at least one ingredient to generate recipes.',
      });
      return;
    }

    const prompt = `You are an expert chef dedicated to zero-waste cooking, leftover rescue, and budget-friendly household meals.
Generate 3 to 4 creative, delicious, and highly practical recipes that rescue and feature the following ingredients:
Main ingredients to rescue: ${ingredients.join(', ')}
${primaryFood ? `Primary focused item: ${primaryFood}` : ''}
${dietary.length ? `Dietary preferences: ${dietary.join(', ')}` : ''}
${cookingTime ? `Preferred max time: ${cookingTime}` : ''}
${skillLevel ? `Skill level: ${skillLevel}` : ''}
${culturalPreference ? `Cultural preference: ${culturalPreference}` : ''}

CRITICAL RECIPE REQUIREMENTS:
- When leftover rice is included, include dishes like Indian Lemon Rice, Tomato Chutney Rice, or Quick Veg Fried Rice if appropriate.
- When tomatoes/onions/potatoes are included, include classic rescue dishes like Tomato Chutney, Aloo Paratha, or Veg Upma alongside global pantry staples like Shakshuka, Frittata, or Vegetable Hash.
- Explicitly label which ingredients are from the rescue list and which are common pantry staples (like salt, oil, chili, cumin, turmeric, garlic, black pepper).
- Provide practical ingredient substitutions (e.g., "no lemon? use vinegar or amchur").
- Provide an honest, insightful "foodSavingTip" for each recipe (e.g. how to store parts, use peels/stems, or freeze).
- Return valid JSON matching the schema.`;

    const textOutput = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Short encouraging culinary note about how these recipes save the ingredients',
            },
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  cuisine: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  servings: { type: Type.INTEGER },
                  difficulty: {
                    type: Type.STRING,
                    description: 'Easy, Medium, or Advanced',
                  },
                  rescuedIngredients: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  pantryStaplesNeeded: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.STRING },
                        isRescued: { type: Type.BOOLEAN },
                        isOptional: { type: Type.BOOLEAN },
                      },
                      required: ['name', 'amount'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  substitutions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        original: { type: Type.STRING },
                        substitute: { type: Type.STRING },
                        note: { type: Type.STRING },
                      },
                      required: ['original', 'substitute'],
                    },
                  },
                  foodSavingTip: { type: Type.STRING },
                  estimatedFoodSavedGrams: {
                    type: Type.INTEGER,
                    description: 'Rough estimate of food weight saved in grams (e.g. 200, 350)',
                  },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'id',
                  'title',
                  'description',
                  'cuisine',
                  'prepTime',
                  'cookTime',
                  'servings',
                  'difficulty',
                  'ingredients',
                  'instructions',
                  'foodSavingTip',
                ],
              },
            },
          },
          required: ['recipes', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(textOutput);
    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/generate-recipes:', error);
    const message = error?.message || 'Failed to generate recipes.';
    const isApiKeyError = message.includes('API_KEY') || message.includes('apiKey');

    res.status(isApiKeyError ? 401 : 500).json({
      success: false,
      error: message,
      isApiKeyMissing: isApiKeyError,
    });
  }
});

// Setup Vite middleware for development or serve dist for production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeftoverLens server running on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
