import React from 'react';
import {
  Camera,
  Upload,
  ChefHat,
  Package,
  TrendingUp,
  Leaf,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { PantryItem, WasteStats } from '../types/food';

interface HomeViewProps {
  onNavigate: (tab: 'scan' | 'upload' | 'recipes' | 'pantry' | 'tracker') => void;
  pantryItems: PantryItem[];
  wasteStats: WasteStats;
  onQuickRecipeStart: (ingredients: string[]) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  pantryItems,
  wasteStats,
  onQuickRecipeStart,
}) => {
  // Find items expiring soon
  const expiringItems = pantryItems.filter((i) => {
    if (i.isUsed || !i.expiryDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(i.expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 2;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2D5A3C] via-[#234830] to-[#193522] rounded-[36px] text-white p-8 sm:p-12 md:p-16 shadow-2xl border border-[#3E7451]">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#88D49E]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 rounded-full bg-[#E8F3EB]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#88D49E] text-xs font-semibold mb-6 border border-white/10">
            <Sparkles className="w-4 h-4 text-[#88D49E]" />
            <span>AI-Powered Zero-Waste Cooking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-4">
            See the potential. <br />
            <span className="text-[#88D49E]">Save the food.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#E3ECE5] font-normal leading-relaxed mb-8 max-w-2xl">
            LeftoverLens turns your smartphone or laptop webcam into an intelligent kitchen assistant.
            Hold food up to your <strong>front camera</strong> or upload photos to instantly recognize ingredients, detect freshness, and cook mouthwatering zero-waste meals.
          </p>

          {/* Core Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <button
              onClick={() => onNavigate('scan')}
              className="py-4 px-7 rounded-2xl bg-[#88D49E] hover:bg-[#72C889] text-[#1E3A27] font-extrabold text-base transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Camera className="w-5 h-5 text-[#1E3A27]" />
              <span>Scan Food with Front Camera</span>
            </button>

            <button
              onClick={() => onNavigate('upload')}
              className="py-4 px-6 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-base transition-all backdrop-blur-sm border border-white/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={() => onNavigate('recipes')}
              className="py-4 px-6 rounded-2xl bg-transparent hover:bg-white/10 text-white font-semibold text-base transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Manual Recipe Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Rescue Alert (if expiring items exist) */}
      {expiringItems.length > 0 && (
        <div className="bg-[#FFF9EE] border-2 border-[#F5D59A] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-amber-950">
                Pantry Rescue Needed ({expiringItems.length} items expiring soon)
              </h4>
              <p className="text-xs sm:text-sm text-amber-900/90 mt-0.5">
                {expiringItems.map((i) => i.name).join(', ')} are nearing their expiration date. Don't let them go to waste!
              </p>
            </div>
          </div>

          <button
            onClick={() => onQuickRecipeStart(expiringItems.map((i) => i.name))}
            className="py-3 px-5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm transition cursor-pointer shrink-0 shadow flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Generate Rescue Recipes</span>
          </button>
        </div>
      )}

      {/* 4 Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Front Camera Feature */}
        <div
          onClick={() => onNavigate('scan')}
          className="bg-white rounded-3xl p-6 border border-[#E3ECE5] hover:border-[#2D5A3C] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1E2922] mb-1.5 flex items-center gap-1.5">
              <span>Front Camera Scan</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#2D5A3C]" />
            </h3>
            <p className="text-xs text-[#5B6D61] leading-relaxed">
              Default selfie mode makes holding food or produce up to your device effortless. Flip to rear camera anytime.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A3C] mt-4 block">
            Start Live Camera →
          </span>
        </div>

        {/* Real Gemini Vision Feature */}
        <div
          onClick={() => onNavigate('upload')}
          className="bg-white rounded-3xl p-6 border border-[#E3ECE5] hover:border-[#2D5A3C] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1E2922] mb-1.5 flex items-center gap-1.5">
              <span>Real Gemini Vision</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#2D5A3C]" />
            </h3>
            <p className="text-xs text-[#5B6D61] leading-relaxed">
              Multimodal AI identifies ingredients, category, approximate quantity, freshness signs, and safety caveats.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A3C] mt-4 block">
            Upload or Scan →
          </span>
        </div>

        {/* Indian & Global Recipes */}
        <div
          onClick={() => onNavigate('recipes')}
          className="bg-white rounded-3xl p-6 border border-[#E3ECE5] hover:border-[#2D5A3C] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1E2922] mb-1.5 flex items-center gap-1.5">
              <span>Creative Rescue Recipes</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#2D5A3C]" />
            </h3>
            <p className="text-xs text-[#5B6D61] leading-relaxed">
              Tailored for leftover rice, soft tomatoes, boiled potatoes. Features lemon rice, tomato chutney, upma, and more.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A3C] mt-4 block">
            Explore Recipes →
          </span>
        </div>

        {/* Waste Tracker */}
        <div
          onClick={() => onNavigate('tracker')}
          className="bg-white rounded-3xl p-6 border border-[#E3ECE5] hover:border-[#2D5A3C] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg text-[#1E2922] mb-1.5 flex items-center gap-1.5">
              <span>Honest Impact Tracker</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-[#2D5A3C]" />
            </h3>
            <p className="text-xs text-[#5B6D61] leading-relaxed">
              Track real food weight rescued, meals cooked, and estimated grocery dollars saved without fabricated stats.
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A3C] mt-4 block">
            {(wasteStats.totalGramsSaved / 1000).toFixed(1)} kg Rescued So Far →
          </span>
        </div>
      </div>

      {/* Classic Leftover Ideas Section */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E3ECE5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-extrabold text-xl text-[#1E2922]">
              Popular Leftover Transformations
            </h3>
            <p className="text-xs text-[#5B6D61]">
              Instant inspiration for high-frequency kitchen surplus
            </p>
          </div>
          <span className="text-xs font-bold text-[#2D5A3C]">
            Click any dish to generate instant recipes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Lemon Rice (Chitranna)',
              ingredients: ['Cooked Basmati Rice', 'Fresh Lemons', 'Peanuts'],
              desc: 'Crisp tempering turns day-old chilled rice into tangy perfection.',
            },
            {
              title: 'Spicy Tomato Chutney',
              ingredients: ['Ripe Tomatoes', 'Red Onions', 'Garlic'],
              desc: 'Overripe, bruised tomatoes concentrate natural sweetness when stewed.',
            },
            {
              title: 'Aloo Paratha & Hash',
              ingredients: ['Boiled Potatoes', 'Onions', 'Spices'],
              desc: 'Boiled potatoes mash easily with cumin and coriander for flatbread filling.',
            },
            {
              title: 'Zero-Waste Veggie Fried Rice',
              ingredients: ['Cooked Rice', 'Carrots', 'Bell Peppers', 'Eggs'],
              desc: 'High heat sizzle revives any limp vegetable ends in 10 minutes.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onQuickRecipeStart(item.ingredients)}
              className="bg-white p-5 rounded-2xl border border-[#E3ECE5] hover:border-[#2D5A3C] transition cursor-pointer shadow-xs hover:shadow-sm"
            >
              <h4 className="font-bold text-sm text-[#1E2922] mb-1">{item.title}</h4>
              <p className="text-xs text-[#5B6D61] mb-3 leading-relaxed">{item.desc}</p>
              <div className="flex flex-wrap gap-1">
                {item.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-[#FAF7F2] border border-[#E3ECE5] text-[#2D5A3C] px-2 py-0.5 rounded-md"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
