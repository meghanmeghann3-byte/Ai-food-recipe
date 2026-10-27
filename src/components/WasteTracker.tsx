import React from 'react';
import { WasteStats } from '../types/food';
import {
  TrendingUp,
  Leaf,
  Utensils,
  Award,
  History,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface WasteTrackerProps {
  stats: WasteStats;
  onClearHistory?: () => void;
}

export const WasteTracker: React.FC<WasteTrackerProps> = ({ stats }) => {
  const kgSaved = (stats.totalGramsSaved / 1000).toFixed(2);
  // Estimate financial value honestly ($4.50/kg average food value benchmark)
  const estMoneySaved = (Number(kgSaved) * 4.5).toFixed(2);
  // Estimate CO2e honest benchmark (~2.5 kg CO2e per kg food waste diverted from landfill)
  const estCo2Saved = (Number(kgSaved) * 2.5).toFixed(2);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2922]">
                Food Rescue Impact Tracker
              </h2>
            </div>
            <p className="text-sm text-[#5B6D61]">
              Honest, real-world metrics based solely on items you have scanned, used from your pantry, and cooked into meals.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F3EB] text-[#2D5A3C] text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Verified User Actions</span>
          </div>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Saved */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3ECE5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center mb-3">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6D61]">
              Food Rescued
            </span>
            <div className="text-3xl font-black text-[#1E2922] mt-1">
              {kgSaved} <span className="text-base font-bold text-[#5B6D61]">kg</span>
            </div>
          </div>
          <p className="text-[11px] text-[#4A5D50] mt-3 pt-3 border-t border-[#F2F4F2]">
            Totaling {stats.totalGramsSaved.toLocaleString()} grams diverted from spoilage.
          </p>
        </div>

        {/* Meals Cooked */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3ECE5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6D61]">
              Leftover Meals Cooked
            </span>
            <div className="text-3xl font-black text-[#1E2922] mt-1">
              {stats.mealsCooked}
            </div>
          </div>
          <p className="text-[11px] text-[#4A5D50] mt-3 pt-3 border-t border-[#F2F4F2]">
            Transforming day-old ingredients into freshly cooked dishes.
          </p>
        </div>

        {/* Ingredients Rescued */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3ECE5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6D61]">
              Pantry Items Used
            </span>
            <div className="text-3xl font-black text-[#1E2922] mt-1">
              {stats.itemsRescued}
            </div>
          </div>
          <p className="text-[11px] text-[#4A5D50] mt-3 pt-3 border-t border-[#F2F4F2]">
            Used before their expiration threshold.
          </p>
        </div>

        {/* Est Money Saved */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3ECE5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5B6D61]">
              Estimated Grocery Savings
            </span>
            <div className="text-3xl font-black text-[#1E2922] mt-1">
              ${estMoneySaved}
            </div>
          </div>
          <p className="text-[11px] text-[#4A5D50] mt-3 pt-3 border-t border-[#F2F4F2]">
            Approx. ~{estCo2Saved} kg CO₂e greenhouse gases prevented.
          </p>
        </div>
      </div>

      {/* Zero Waste Principles Card */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E3ECE5]">
        <h3 className="text-lg font-bold text-[#1E2922] mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#2D5A3C]" />
          <span>LeftoverLens Zero-Waste Principles</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-[#4A5D50]">
          <div className="bg-white p-4 rounded-2xl border border-[#E3ECE5]">
            <h4 className="font-bold text-[#1E2922] mb-1">1. First-In, First-Out</h4>
            <p className="leading-relaxed">
              Keep older produce in clear sight inside your fridge. Check your LeftoverLens pantry before grocery shopping.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E3ECE5]">
            <h4 className="font-bold text-[#1E2922] mb-1">2. Embrace "Ugly" Produce</h4>
            <p className="leading-relaxed">
              Wrinkled bell peppers or bruised tomatoes are perfect for Indian curries, chutneys, and sauces without flavor loss.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E3ECE5]">
            <h4 className="font-bold text-[#1E2922] mb-1">3. The Starchy Transformer</h4>
            <p className="leading-relaxed">
              Day-old cooked rice and boiled potatoes are kitchen gold for fried rice, lemon rice, and crispy parathas.
            </p>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-lg">
        <h3 className="font-bold text-xl text-[#1E2922] mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#2D5A3C]" />
          <span>Recent Food Rescue Log</span>
        </h3>

        {stats.activities.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">
            No activity logged yet. Scan food, mark items used in pantry, or cook recipes to record your impact!
          </p>
        ) : (
          <div className="divide-y divide-[#F2F4F2]">
            {stats.activities.map((act) => (
              <div key={act.id} className="py-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E8F3EB] text-[#2D5A3C] flex items-center justify-center shrink-0 mt-0.5">
                    {act.action === 'recipe_cooked' ? (
                      <Utensils className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#1E2922]">{act.title}</h5>
                    <p className="text-xs text-[#5B6D61] mt-0.5">{act.description}</p>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      {new Date(act.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {act.gramsSaved > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-[#E8F3EB] px-2.5 py-1 rounded-full shrink-0">
                    +{act.gramsSaved}g saved
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
