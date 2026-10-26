import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import type { Product, ProductCategory } from '../../types/pos';
import { Package, Search, Plus, AlertTriangle, Barcode, Trash2, Edit3, X } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, restockProduct } = usePOS();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form State
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Grocery' as ProductCategory,
    price: 0,
    costPrice: 0,
    stock: 20,
    minStock: 5,
    unit: 'pack',
    gstRate: 12,
  });

  const categories: ProductCategory[] = [
    'All',
    'Grocery',
    'Dairy',
    'Snacks',
    'Beverages',
    'Personal Care',
    'Household',
  ];

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValuation = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  const filteredProducts = products.filter((prod) => {
    const matchCat = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(search.toLowerCase()) ||
      prod.barcode.includes(search);
    const matchLowStock = showLowStockOnly ? prod.stock <= prod.minStock : true;
    return matchCat && matchSearch && matchLowStock;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) return;

    addProduct({
      ...formData,
      barcode: formData.barcode.trim() || `890${Date.now().toString().slice(-10)}`,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      barcode: '',
      category: 'Grocery',
      price: 0,
      costPrice: 0,
      stock: 20,
      minStock: 5,
      unit: 'pack',
      gstRate: 12,
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 pb-24">
      
      {/* Inventory Header & KPI Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Inventory & Stock Management
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time stock decrement, automatic low-stock alerts, and fast restock
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 bg-ios-red hover:bg-ios-redHover text-white px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-ios">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Catalog Items
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
            {products.length}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Unique SKUs active</span>
        </div>

        <div
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`p-4 rounded-3xl border cursor-pointer transition-all ${
            showLowStockOnly
              ? 'bg-amber-500 text-white border-amber-600 shadow-md'
              : 'bg-white border-slate-200 hover:border-amber-400 shadow-ios'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold block uppercase tracking-wider ${showLowStockOnly ? 'text-amber-100' : 'text-slate-400'}`}>
              Low Stock Warnings
            </span>
            <AlertTriangle className={`w-4 h-4 ${showLowStockOnly ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <span className={`text-2xl font-black font-mono mt-0.5 block ${showLowStockOnly ? 'text-white' : 'text-amber-600'}`}>
            {lowStockCount}
          </span>
          <span className={`text-[10px] font-medium ${showLowStockOnly ? 'text-amber-100' : 'text-slate-500'}`}>
            {showLowStockOnly ? 'Click to show all' : 'Click to filter low stock'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-ios">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Units in Store
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
            {totalStockUnits}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Packaged units</span>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-ios">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Inventory Valuation
          </span>
          <span className="text-2xl font-black text-ios-red font-mono mt-0.5 block">
            ₹{Math.round(totalValuation).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">Cost value of holding stock</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-ios-red"
          />
        </div>

        {/* Categories Bar */}
        <div className="overflow-x-auto w-full sm:w-auto -mx-2 px-2 scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-ios overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-3">Barcode</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Cost Price</th>
                <th className="py-3.5 px-3 text-right">Selling Price</th>
                <th className="py-3.5 px-3 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Quick Restock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= prod.minStock;
                const marginPercent =
                  prod.price > 0 ? Math.round(((prod.price - prod.costPrice) / prod.price) * 100) : 0;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Product Name */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-slate-600" />
                        </div>
                        <div>
                          <span className="block">{prod.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Unit: {prod.unit} • GST: {prod.gstRate}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Barcode className="w-3 h-3 text-slate-300" />
                        <span>{prod.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 font-semibold">
                      ₹{prod.costPrice}
                    </td>

                    {/* Selling Price & Margin */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-black text-slate-900 block">
                        ₹{prod.price}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-600 block">
                        +{marginPercent}% margin
                      </span>
                    </td>

                    {/* Stock Level Badge */}
                    <td className="py-3 px-3 text-center">
                      {isOutOfStock ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          0 Out
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>{prod.stock} (Low)</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          {prod.stock} units
                        </span>
                      )}
                    </td>

                    {/* Quick Restock Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => restockProduct(prod.id, 5)}
                          title="Add +5 units to stock"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-colors active:scale-95"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => restockProduct(prod.id, 10)}
                          title="Add +10 units to stock"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-colors active:scale-95"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => restockProduct(prod.id, 25)}
                          title="Add +25 units to stock"
                          className="bg-ios-red/10 hover:bg-ios-red hover:text-white text-ios-red font-bold text-[10px] px-2 py-1 rounded-lg transition-colors active:scale-95"
                        >
                          +25
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prod)}
                          title="Edit product"
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete ${prod.name} from inventory?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          title="Delete product"
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Add New Product to Store</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parle-G Biscuits 250g"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-ios-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Barcode / EAN</label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto code"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-ios-red"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-ios-red"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-ios-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Min Alert Stock</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-ios-red hover:bg-ios-redHover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Edit {editingProduct.name}</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-ios-red"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
