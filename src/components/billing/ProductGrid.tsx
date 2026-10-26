import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import type { ProductCategory } from '../../types/pos';
import { Search, Camera, Plus, Barcode, AlertTriangle } from 'lucide-react';

interface ProductGridProps {
  onOpenScanner: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onOpenScanner }) => {
  const { products, addToCart, cart } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');

  const categories: ProductCategory[] = [
    'All',
    'Grocery',
    'Dairy',
    'Snacks',
    'Beverages',
    'Personal Care',
    'Household',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.barcode.includes(q) ||
        prod.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Helper to check how many already in cart
  const getCartQuantity = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4">
      
      {/* Top Search Bar & Camera Scanner Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name or type barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ios-red shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Live Camera Scanner Button */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 bg-ios-red hover:bg-ios-redHover text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl font-bold text-xs shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Camera Scan</span>
        </button>
      </div>

      {/* Category Segmented Scroll Bar */}
      <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Barcode className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
            <p className="font-bold text-sm text-slate-600">No products found</p>
            <p className="text-xs text-slate-400">Try searching with a different keyword or barcode</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 pb-20 lg:pb-4">
            {filteredProducts.map((prod) => {
              const inCartQty = getCartQuantity(prod.id);
              const isOutOfStock = prod.stock <= 0;
              const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;

              return (
                <div
                  key={prod.id}
                  onClick={() => !isOutOfStock && addToCart(prod)}
                  className={`group relative bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between cursor-pointer select-none active:scale-[0.98] ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60 cursor-not-allowed'
                      : inCartQty > 0
                      ? 'border-ios-red/60 ring-2 ring-ios-red/10 shadow-sm'
                      : 'border-slate-200/90 hover:border-ios-red hover:shadow-md'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[85px]">
                      {prod.category}
                    </span>

                    {/* Stock status indicator */}
                    {isOutOfStock ? (
                      <span className="text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {prod.stock} left
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {prod.stock} in stock
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <div className="space-y-1 mb-3">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2">
                      {prod.name}
                    </h4>
                    <p className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                      <Barcode className="w-3 h-3 text-slate-300" />
                      <span>{prod.barcode.slice(-6)}</span>
                    </p>
                  </div>

                  {/* Price & Add Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base sm:text-lg font-black text-ios-red tracking-tight">
                        ₹{prod.price}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block -mt-1">
                        /{prod.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black transition-all ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-ios-red text-white shadow-sm'
                          : 'bg-slate-100 group-hover:bg-ios-red group-hover:text-white text-slate-700'
                      }`}
                    >
                      {inCartQty > 0 ? (
                        <span className="text-xs font-black">{inCartQty}</span>
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
