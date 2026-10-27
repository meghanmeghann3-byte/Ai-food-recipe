import React, { useState, useMemo } from 'react';
import { PantryItem } from '../types/food';
import {
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  ChefHat,
  Sparkles,
  MapPin,
  Check,
  X,
  Archive,
  ArrowUpDown,
} from 'lucide-react';

interface PantryManagerProps {
  items: PantryItem[];
  onAddItem: (item: Omit<PantryItem, 'id' | 'isUsed'>) => void;
  onUpdateItem: (item: PantryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onMarkAsUsed: (item: PantryItem) => void;
  onFindRecipesForSelected: (ingredients: string[]) => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMarkAsUsed,
  onFindRecipesForSelected,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    quantity: string;
    unit: string;
    expiryDate: string;
    storageLocation: 'Fridge' | 'Freezer' | 'Pantry Counter' | 'Cupboard';
    notes: string;
  }>({
    name: '',
    category: 'Vegetable',
    quantity: '1',
    unit: 'pieces',
    expiryDate: '',
    storageLocation: 'Fridge',
    notes: '',
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Vegetable',
      quantity: '1',
      unit: 'pieces',
      expiryDate: '',
      storageLocation: 'Fridge',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: PantryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate || '',
      storageLocation: item.storageLocation,
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: formData.name.trim(),
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        expiryDate: formData.expiryDate ? formData.expiryDate : null,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
      });
    } else {
      onAddItem({
        name: formData.name.trim(),
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        addedDate: new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate ? formData.expiryDate : null,
        storageLocation: formData.storageLocation,
        notes: formData.notes,
      });
    }

    setIsAddModalOpen(false);
  };

  // Expiry calculation helper
  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return { text: 'No expiry set', status: 'normal', color: 'text-gray-400' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Expired ${Math.abs(diffDays)}d ago`, status: 'expired', color: 'text-red-600 bg-red-50 border-red-200' };
    } else if (diffDays === 0) {
      return { text: 'Expires Today!', status: 'urgent', color: 'text-amber-700 bg-amber-50 border-amber-300 animate-pulse font-bold' };
    } else if (diffDays <= 2) {
      return { text: `Expires in ${diffDays} day${diffDays === 1 ? '' : 's'}`, status: 'warning', color: 'text-amber-700 bg-amber-50 border-amber-200 font-semibold' };
    } else {
      return { text: `Exp: ${expiryDate}`, status: 'safe', color: 'text-[#4A5D50] bg-gray-50 border-gray-200' };
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation =
        locationFilter === 'All' || item.storageLocation === locationFilter;

      return matchesSearch && matchesLocation && !item.isUsed;
    });
  }, [items, searchQuery, locationFilter]);

  // Urgent expiry items count
  const urgentCount = useMemo(() => {
    return items.filter((i) => {
      if (i.isUsed || !i.expiryDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const exp = new Date(i.expiryDate);
      exp.setHours(0, 0, 0, 0);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 2;
    }).length;
  }, [items]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCookSelected = () => {
    const selectedNames = items
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => i.name);
    if (selectedNames.length > 0) {
      onFindRecipesForSelected(selectedNames);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Expiry Alert */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3ECE5] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2922]">
              My Pantry & Fridge
            </h2>
            <span className="bg-[#E8F3EB] text-[#2D5A3C] text-xs font-bold px-2.5 py-1 rounded-full">
              {filteredItems.length} Active Items
            </span>
          </div>
          <p className="text-sm text-[#5B6D61]">
            Keep track of fresh ingredients, shelf dates, and rescue food before it spoils.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={handleCookSelected}
              className="py-3 px-4 rounded-xl bg-[#88D49E] text-[#1E3A27] font-bold text-sm transition hover:bg-[#72C889] flex items-center gap-2 cursor-pointer shadow-sm animate-in fade-in"
            >
              <ChefHat className="w-4 h-4" />
              <span>Rescue Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="py-3 px-5 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Urgent Expiry Warning Bar */}
      {urgentCount > 0 && (
        <div className="bg-[#FFF9EE] border border-[#F5D59A] rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Food Rescue Alert:</strong> You have{' '}
              <span className="font-bold underline">{urgentCount} item(s)</span> expiring in the next 48 hours. Cook them now to prevent waste!
            </span>
          </div>
          <button
            onClick={() => {
              const expiringNames = items
                .filter((i) => {
                  if (i.isUsed || !i.expiryDate) return false;
                  const exp = new Date(i.expiryDate);
                  const diff = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return diff <= 2;
                })
                .map((i) => i.name);
              onFindRecipesForSelected(expiringNames);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer shrink-0"
          >
            Find Recipes Now
          </button>
        </div>
      )}

      {/* Search & Location Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-[#E3ECE5]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ingredients, category, notes..."
            className="w-full bg-[#FAF7F2] pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5CD] text-xs sm:text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Fridge', 'Freezer', 'Pantry Counter', 'Cupboard'].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocationFilter(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                locationFilter === loc
                  ? 'bg-[#2D5A3C] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#5B6D61] hover:text-[#1E2922] border border-[#E3ECE5]'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Pantry Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E3ECE5]">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#1E2922] mb-1">No pantry items found</h4>
          <p className="text-xs text-[#5B6D61] max-w-sm mx-auto mb-5">
            {searchQuery
              ? 'Try modifying your search or location filter.'
              : 'Add ingredients manually or scan food with your camera to build your pantry inventory.'}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#2D5A3C] text-white text-xs font-bold hover:bg-[#234830] transition cursor-pointer"
          >
            + Add First Ingredient
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const expInfo = getExpiryStatus(item.expiryDate);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border transition-all shadow-sm flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-[#2D5A3C] ring-2 ring-[#2D5A3C]/20 bg-[#F4F9F5]'
                    : 'border-[#E3ECE5] hover:border-[#CBD5CD]'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D5A3C] border-[#2D5A3C] text-white'
                          : 'border-gray-300 bg-white hover:border-[#2D5A3C]'
                      }`}
                      title="Select for rescue recipes"
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A3C] bg-[#E8F3EB] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Quantity */}
                  <h4 className="font-bold text-lg text-[#1E2922] mb-1 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#2D5A3C] mb-3">
                    {item.quantity} {item.unit}
                  </p>

                  {/* Expiry Pill */}
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border ${expInfo.color}`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{expInfo.text}</span>
                    </span>
                  </div>

                  {/* Location & Notes */}
                  <div className="space-y-1 text-xs text-[#5B6D61]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>Stored in {item.storageLocation}</span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-[#4A5D50] italic line-clamp-2 mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-[#F2F4F2] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onMarkAsUsed(item)}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#E8F3EB] hover:bg-[#88D49E] text-[#1E3A27] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Mark as used / cooked"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mark Used</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-gray-500 hover:text-[#1E2922] hover:bg-gray-100 transition cursor-pointer"
                    title="Edit item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Ingredient Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E3ECE5] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-xl text-[#1E2922]">
                {editingItem ? 'Edit Pantry Item' : 'Add Ingredient to Pantry'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ripe Tomatoes, Cooked Rice, Paneer"
                  className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                    Quantity
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="2"
                    className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E2922] mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="cups, pieces, grams"
                    className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                  >
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Grains & Carbs">Grains & Carbs</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Protein & Meat">Protein & Meat</option>
                    <option value="Bakery & Bread">Bakery & Bread</option>
                    <option value="Prepared Dish">Prepared Dish</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                    Storage Location
                  </label>
                  <select
                    value={formData.storageLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storageLocation: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                  >
                    <option value="Fridge">Fridge</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Pantry Counter">Pantry Counter</option>
                    <option value="Cupboard">Cupboard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3.5 py-2.5 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Leave blank if unknown; we do not invent expiry dates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E2922] mb-1">
                  Notes / State
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Slightly softened, use by Tuesday"
                  className="w-full bg-[#FAF7F2] border border-[#CBD5CD] rounded-xl px-3.5 py-2 text-sm text-[#1E2922] outline-none focus:border-[#2D5A3C]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#CBD5CD] text-gray-700 text-sm font-semibold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#2D5A3C] hover:bg-[#234830] text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add to Pantry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
