import React from 'react';
import {
  Camera,
  ChefHat,
  Package,
  TrendingUp,
  Home,
  Bookmark,
  Sparkles,
  Leaf,
  Upload,
} from 'lucide-react';

export type NavTab = 'home' | 'scan' | 'upload' | 'recipes' | 'saved' | 'pantry' | 'tracker';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pantryCount: number;
  savedRecipesCount: number;
  totalKgSaved: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  pantryCount,
  savedRecipesCount,
  totalKgSaved,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E3ECE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline */}
          <button
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 text-left cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#2D5A3C] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6 text-[#88D49E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-[#1E2922] tracking-tight">
                  Leftover<span className="text-[#2D5A3C]">Lens</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EB] text-[#2D5A3C]">
                  AI Food Rescue
                </span>
              </div>
              <p className="text-xs text-[#5B6D61] font-medium hidden xs:block">
                See the potential. Save the food.
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onTabChange('home')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onTabChange('scan')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 relative ${
                activeTab === 'scan'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <Camera className="w-4 h-4 text-[#88D49E]" />
              <span>Scan Food</span>
              <span className="text-[10px] bg-[#88D49E] text-[#1E3A27] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                Front Cam
              </span>
            </button>

            <button
              onClick={() => onTabChange('recipes')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recipes'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Recipes</span>
            </button>

            <button
              onClick={() => onTabChange('saved')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saved'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved</span>
              {savedRecipesCount > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                  {savedRecipesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('pantry')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pantry'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Pantry</span>
              {pantryCount > 0 && (
                <span className="text-[10px] bg-[#E8F3EB] text-[#2D5A3C] px-1.5 py-0.5 rounded-full font-bold">
                  {pantryCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('tracker')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tracker'
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'text-[#4A5D50] hover:text-[#1E2922] hover:bg-white/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Waste Tracker</span>
            </button>
          </nav>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <div
              onClick={() => onTabChange('tracker')}
              className="bg-[#E8F3EB] border border-[#CBD5CD] px-3 py-1.5 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-[#D5EADB] transition"
              title="Total Food Rescued"
            >
              <Leaf className="w-4 h-4 text-[#2D5A3C]" />
              <div className="text-right">
                <span className="text-xs font-bold text-[#1E3A27]">{totalKgSaved} kg</span>
                <span className="text-[10px] text-[#4A5D50] block -mt-0.5">Rescued</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-[#E3ECE5] no-scrollbar">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onTabChange('scan')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'scan'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#2D5A3C] border border-[#88D49E]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#88D49E]" />
            <span>Scan Food</span>
          </button>
          <button
            onClick={() => onTabChange('upload')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'upload'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => onTabChange('recipes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'recipes'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            Recipes
          </button>
          <button
            onClick={() => onTabChange('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            Saved ({savedRecipesCount})
          </button>
          <button
            onClick={() => onTabChange('pantry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'pantry'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            Pantry ({pantryCount})
          </button>
          <button
            onClick={() => onTabChange('tracker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'tracker'
                ? 'bg-[#2D5A3C] text-white'
                : 'bg-white text-[#4A5D50] border border-[#E3ECE5]'
            }`}
          >
            Tracker
          </button>
        </div>
      </div>
    </header>
  );
};
