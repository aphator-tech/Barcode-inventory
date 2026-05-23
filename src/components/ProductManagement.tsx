/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash, 
  Edit, 
  Barcode as BarcodeIcon, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Printer, 
  Tag as TagIcon,
  Shirt, 
  Grid, 
  X, 
  RefreshCw,
  Box,
  MapPin,
  AlertTriangle,
  HeartCrack,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Product, Variant, Supplier } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';
import { playScannerSound } from '../store';

interface ProductManagementProps {
  id: string;
  products: Product[];
  variants: Variant[];
  suppliers: Supplier[];
  onAddProduct: (product: Product, variants: Omit<Variant, 'id' | 'productId'>[]) => void;
  onUpdateProductMeta: (product: Product) => void;
  onUpdateVariant: (variant: Variant) => void;
  onDeleteProduct: (productId: string) => void;
  onImportCSV: (content: string) => { successCount: number; errors: string[] };
}

export const ProductManagement: React.FC<ProductManagementProps> = ({
  id,
  products,
  variants,
  suppliers,
  onAddProduct,
  onUpdateProductMeta,
  onUpdateVariant,
  onDeleteProduct,
  onImportCSV
}) => {
  // Views navigation
  const [activeSubView, setActiveSubView] = useState<'grid' | 'add' | 'labels' | 'import'>('grid');

  // Search & Filters
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedStockLvl, setSelectedStockLvl] = useState<'All' | 'Low' | 'High'>('All');

  // Single Item Editing State
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  // Label print queue state
  const [labelQueue, setLabelQueue] = useState<{ variant: Variant; product: Product; quantity: number } | null>(null);

  // CSV paste input
  const [csvRaw, setCsvRaw] = useState('');
  const [csvUploadResult, setCsvUploadResult] = useState<{ success: number; errors: string[] } | null>(null);

  // --- MATRICES CREATOR FORM STRATEGY ---
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Sweaters & Knitwear');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdGender, setNewProdGender] = useState<'Unisex' | 'Men' | 'Women' | 'Kids'>('Unisex');
  const [newProdMaterial, setNewProdMaterial] = useState('');
  const [newProdSeason, setNewProdSeason] = useState('Spring/Summer 2026');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600');

  // Matrix generation lists
  const [matrixSizes, setMatrixSizes] = useState<string[]>(['S', 'M', 'L']);
  const [matrixColors, setMatrixColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Midnight Jet', hex: '#111827' },
    { name: 'Warm Cream', hex: '#fdf6e2' }
  ]);
  const [purchasePrice, setPurchasePrice] = useState(15.00);
  const [sellingPrice, setSellingPrice] = useState(39.00);
  const [initialStock, setInitialStock] = useState(20);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup1');
  const [storageLoc, setStorageLoc] = useState('Aisle 1, Rack A');

  // Temp sizing & color input holders
  const [sizeInput, setSizeInput] = useState('');
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#888888');

  const addSizeToMatrix = () => {
    const size = sizeInput.trim().toUpperCase();
    if (size && !matrixSizes.includes(size)) {
      setMatrixSizes([...matrixSizes, size]);
      setSizeInput('');
    }
  };

  const removeSizeFromMatrix = (size: string) => {
    setMatrixSizes(matrixSizes.filter(s => s !== size));
  };

  const addColorToMatrix = () => {
    const name = colorNameInput.trim();
    if (name && !matrixColors.some(c => c.name === name)) {
      setMatrixColors([...matrixColors, { name, hex: colorHexInput }]);
      setColorNameInput('');
    }
  };

  const removeColorFromMatrix = (colorName: string) => {
    setMatrixColors(matrixColors.filter(c => c.name !== colorName));
  };

  const handleCreateProductWithMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdBrand) {
      alert('Must fill Product Name and Brand.');
      return;
    }

    if (matrixSizes.length === 0 || matrixColors.length === 0) {
      alert('Variant Matrix requires at least 1 size and 1 color attribute.');
      return;
    }

    const productId = `prod_${Date.now()}`;
    const productMeta: Product = {
      id: productId,
      name: newProdName,
      description: newProdDesc || `${newProdName} classic premium wear.`,
      category: newProdCategory,
      brand: newProdBrand,
      gender: newProdGender,
      material: newProdMaterial || 'Soft Garment Cotton Blend',
      season: newProdSeason,
      image: newProdImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600',
      createdAt: new Date().toISOString()
    };

    // Build the variant logs
    const productVariants: Omit<Variant, 'id' | 'productId'>[] = [];
    
    matrixSizes.forEach(size => {
      matrixColors.forEach(color => {
        // Formulate deterministic unique Barcodes and stock codes for testing
        const hash = Math.floor(Math.random() * 89999 + 10000);
        const barcodeVal = `${Date.now().toString().slice(-4)}${hash}`;
        const skuVal = `${newProdBrand.slice(0,3).toUpperCase()}-${newProdName.slice(0,3).toUpperCase()}-${color.name.slice(0,3).toUpperCase()}-${size}`.replace(/\s+/g, '');

        productVariants.push({
          size,
          color: color.hex,
          colorName: color.name,
          barcode: barcodeVal,
          sku: skuVal,
          currentStock: initialStock,
          minimumStockAlert: minStockAlert,
          purchasePrice,
          sellingPrice,
          supplierId: selectedSupplierId,
          storageLocation: storageLoc
        });
      });
    });

    onAddProduct(productMeta, productVariants);
    playScannerSound('success');

    // Reset fields
    setNewProdName('');
    setNewProdBrand('');
    setNewProdDesc('');
    setNewProdMaterial('');
    setActiveSubView('grid');
  };

  // Bulk export catalog as real downloadable CSV file helper
  const exportCatalogCSV = () => {
    const headers = ['Product Name', 'Category', 'Brand', 'Size', 'Color Name', 'Color Hex Code', 'Barcode Tag', 'SKU Stock Code', 'Current Stock', 'Min Stock Alert', 'Purchase Cost', 'Selling MSRP'];
    const lines = [headers.join(',')];

    variants.forEach(v => {
      const p = products.find(prod => prod.id === v.productId);
      if (!p) return;

      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        `"${p.brand.replace(/"/g, '""')}"`,
        `"${v.size}"`,
        `"${v.colorName.replace(/"/g, '""')}"`,
        `"${v.color}"`,
        `"${v.barcode}"`,
        `"${v.sku}"`,
        v.currentStock,
        v.minimumStockAlert,
        v.purchasePrice,
        v.sellingPrice
      ];
      lines.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `apparel_inventory_catalog_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVBatchCommit = () => {
    if (!csvRaw.trim()) return;
    const res = onImportCSV(csvRaw);
    setCsvUploadResult({
      success: res.successCount,
      errors: res.errors
    });
    setCsvRaw('');
  };

  // Filter Catalog Rows
  const filteredVariants = variants.filter(v => {
    const p = products.find(prod => prod.id === v.productId);
    if (!p) return false;

    // Search query match
    const matchesSearch = `${p.name} ${p.brand} ${v.sku} ${v.barcode} ${v.colorName} ${p.category}`.toLowerCase().includes(searchText.toLowerCase());
    
    // Category match
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    
    // Brand match
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;

    // Gender match
    const matchesGender = selectedGender === 'All' || p.gender === selectedGender;

    // Stock alert level query
    let matchesStock = true;
    if (selectedStockLvl === 'Low') {
      matchesStock = v.currentStock <= v.minimumStockAlert;
    } else if (selectedStockLvl === 'High') {
      matchesStock = v.currentStock > v.minimumStockAlert;
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesGender && matchesStock;
  });

  // Extract list items lists labels filters
  const categoriesList = ['All', ...new Set(products.map(p => p.category))];
  const brandsList = ['All', ...new Set(products.map(p => p.brand))];

  return (
    <div id={id} className="space-y-6 text-left">
      
      {/* TIER Header navigation buttons menu */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shirt className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Clothing & Apparel Variant Ledger
          </h2>
          <p className="text-xs text-gray-500">Configure retail stock tiers, print pricing labels, or set warehouse storage bins.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubView('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSubView === 'grid' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Manage Catalog
          </button>
          
          <button
            onClick={() => setActiveSubView('add')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubView === 'add' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Matrix Creator
          </button>

          <button
            onClick={exportCatalogCSV}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export Catalog
          </button>

          <button
            onClick={() => setActiveSubView('import')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubView === 'import' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: PRIMARY GRID DISPLAY */}
      {activeSubView === 'grid' && (
        <div className="space-y-6">
          
          {/* Filtering row bar controls */}
          <div className="bg-white dark:bg-gray-901 p-5 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="md:col-span-4 relative">
                <input
                  type="text"
                  placeholder="Query ledger item, Brand, SKU or Tag..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full text-xs py-3 pl-10 pr-4 bg-gray-50 dark:bg-gray-950 border border-gray-150 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs py-3 px-3 bg-gray-50 border border-gray-150 rounded-xl focus:outline-hidden text-gray-600"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full text-xs py-3 px-3 bg-gray-50 border border-gray-150 rounded-xl focus:outline-hidden text-gray-600"
                >
                  <option value="All">All Brands</option>
                  {brandsList.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full text-xs py-3 px-2 bg-gray-50 border border-gray-150 rounded-xl focus:outline-hidden text-gray-600"
                >
                  <option value="All">All Genders</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men Only</option>
                  <option value="Women">Women Only</option>
                  <option value="Kids">Kids Line</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedStockLvl}
                  onChange={(e) => setSelectedStockLvl(e.target.value as any)}
                  className="w-full text-xs py-3 px-2 bg-gray-50 border border-gray-150 rounded-xl focus:outline-hidden text-gray-600"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="Low">⚠️ Low Stock Alerts</option>
                  <option value="High">✅ Surplus Stock</option>
                </select>
              </div>

            </div>
          </div>

          {/* MAIN PRODUCT LIST TABLE SYSTEM */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-w-full">
              <table className="min-w-full divide-y divide-gray-100 text-left">
                <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Apparel Variant</th>
                    <th className="px-6 py-4">SKU / TAG Code</th>
                    <th className="px-6 py-4">Attributes</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">MSRP (Cost)</th>
                    <th className="px-6 py-4 text-center">Quantities Remaining</th>
                    <th className="px-6 py-4 text-right">Label Actions</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-gray-50 text-xs">
                  {filteredVariants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-gray-400 space-y-2">
                        <Shirt className="w-8 h-8 mx-auto stroke-1 text-gray-300" />
                        <div className="text-xs font-bold text-gray-500">No matching clothing catalog lines found</div>
                        <p className="text-[11px] text-gray-400 max-w-sm mx-auto">Try clearing search phrases or generate garments inside the Matrix Creator.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVariants.map(v => {
                      const p = products.find(prod => prod.id === v.productId);
                      if (!p) return null;
                      const isLow = v.currentStock <= v.minimumStockAlert;

                      return (
                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                          
                          {/* Name image */}
                          <td className="px-6 py-4 font-medium flex items-center gap-3">
                            <img 
                              src={p.image} 
                              alt="" 
                              className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-gray-900 block">{p.name}</span>
                              <span className="text-[10px] text-gray-400 block">{p.brand} • {p.category}</span>
                            </div>
                          </td>

                          {/* Codes */}
                          <td className="px-6 py-4 font-mono select-all">
                            <span className="block text-gray-700 font-semibold">{v.sku}</span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <BarcodeIcon className="w-3 h-3 text-slate-500" />
                              {v.barcode}
                            </span>
                          </td>

                          {/* Attributes */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-100 rounded-lg text-gray-700 font-bold shadow-2xs">
                              <span className="w-2.5 h-2.5 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: v.color }} />
                              {v.colorName} • Size {v.size}
                            </span>
                          </td>

                          {/* Location */}
                          <td className="px-6 py-4 text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {v.storageLocation || 'Unallocated Bin'}
                            </span>
                          </td>

                          {/* Cost */}
                          <td className="px-6 py-4 font-mono font-bold">
                            <span className="text-teal-600 block">${v.sellingPrice.toFixed(2)}</span>
                            <span className="text-[10px] text-gray-400 block">Cost: ${v.purchasePrice.toFixed(2)}</span>
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <span className={`px-3 py-1 font-mono font-bold text-sm rounded-lg ${
                                isLow ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-800'
                              }`}>
                                {v.currentStock} pcs
                              </span>
                              {isLow && (
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 flex items-center gap-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Replenish Trigger
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Action button triggers */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingVariant(v)}
                                className="p-1.5 bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg border border-gray-100 transition-all cursor-pointer"
                                title="Edit product parameters"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                onClick={() => setLabelQueue({ variant: v, product: p, quantity: 12 })}
                                className="p-1.5 bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 rounded-lg border border-gray-100 transition-all cursor-pointer"
                                title="Print price adhesive labels"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm('Verify deleting this specific variant? Inventory logs persist.')) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg border border-gray-100 transition-all cursor-pointer"
                                title="Purge product entirely"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: ADVANCED MATRIX CREATOR */}
      {activeSubView === 'add' && (
        <form onSubmit={handleCreateProductWithMatrix} className="bg-white dark:bg-gray-901 p-8 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xs space-y-8 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-905">Apparel Variant Matrix Generator</h3>
              <p className="text-xs text-gray-400">Add apparel details. Size and color vectors will generate matching SKUs automatically.</p>
            </div>
            <button 
              type="button" 
              onClick={() => setActiveSubView('grid')}
              className="p-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-105"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left box: Product Core Information */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-100 dark:border-slate-800 pb-1.5">1. Base Apparel Identity</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Clothing Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Classic Denim Trucker"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Brand Slate</label>
                  <input
                    type="text"
                    required
                    placeholder="Nørse Thread"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Taxonomy Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium"
                  >
                    <option value="Sweaters & Knitwear">Sweaters & Knitwear</option>
                    <option value="Pants & Trousers">Pants & Trousers</option>
                    <option value="T-Shirts & Tops">T-Shirts & Tops</option>
                    <option value="Outerwear & Jackets">Outerwear & Jackets</option>
                    <option value="Activewear & Loungewear">Activewear & Loungewear</option>
                    <option value="Accessories & Hats">Accessories & Hats</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Ideal Gender Target</label>
                  <select
                    value={newProdGender}
                    onChange={(e) => setNewProdGender(e.target.value as any)}
                    className="w-full text-xs px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden font-medium"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Primary Fabric Material</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Selvedge Indigo"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Collection Season</label>
                  <input
                    type="text"
                    placeholder="Fall/Winter 2026"
                    value={newProdSeason}
                    onChange={(e) => setNewProdSeason(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Image Display URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/etc"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Extended Description</label>
                <textarea
                  placeholder="Apparel craftsmanship logs, yarn counts, pocket details..."
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 resize-none font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Right box: Variant Matrices attributes */}
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-100 dark:border-slate-800 pb-1.5">2. Attributes Vector Arrays</span>
              
              {/* SIZE CREATOR CHIPS */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Include Sizes ({matrixSizes.length})</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="XS, M, One Size"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSizeToMatrix())}
                    className="text-xs px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-32 uppercase text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={addSizeToMatrix}
                    className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {matrixSizes.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40 font-bold text-[10px] rounded-lg inline-flex items-center gap-1.5">
                      {s}
                      <button type="button" onClick={() => removeSizeFromMatrix(s)} className="hover:text-rose-600 font-bold">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* COLORS MATRIX CHIPS */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Include Colors ({matrixColors.length})</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Midnight Black"
                    value={colorNameInput}
                    onChange={(e) => setColorNameInput(e.target.value)}
                    className="text-xs px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <input
                    type="color"
                    value={colorHexInput}
                    onChange={(e) => setColorHexInput(e.target.value)}
                    className="w-10 h-8 p-0 rounded-lg cursor-pointer bg-transparent border-0 self-center"
                  />
                  <button
                    type="button"
                    onClick={addColorToMatrix}
                    className="px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    Add Color
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1.5">
                  {matrixColors.map(c => (
                    <span key={c.name} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold inline-flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-200/50 inline-block" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button type="button" onClick={() => removeColorFromMatrix(c.name)} className="hover:text-rose-600 font-bold">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block border-b border-slate-100 dark:border-slate-800 pt-3 pb-1.5">3. Matrix Pricing & Global Allocation</span>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Initial Stock per Variant</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={initialStock}
                    onChange={(e) => setInitialStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Min Alarms Threshold</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Vendor Wholesale Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0.00))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">MSRP Store Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0.00))}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-teal-600 dark:text-teal-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Default Manufacturer</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden font-medium text-slate-900 dark:text-slate-100"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Warehouse Slat Grid Location</label>
                  <input
                    type="text"
                    placeholder="Aisle 1, Rack B-3"
                    value={storageLoc}
                    onChange={(e) => setStorageLoc(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">
              Output Matrix Tally: <strong className="text-slate-700 dark:text-slate-300 font-black">{matrixSizes.length * matrixColors.length} unique variants</strong> will be created.
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveSubView('grid')}
                className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Abort
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Assemble SKU Variants & Save Catalog 💾
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUBVIEW 3: CSV IMPORT WIZARD */}
      {activeSubView === 'import' && (
        <div className="bg-white dark:bg-gray-901 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xs text-left space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-950">CSV Spreadsheet Catalog Loader</h3>
              <p className="text-xs text-gray-400">Perform bulk additions. Enter comma-separated rows matching the layout scheme below.</p>
            </div>
            <button onClick={() => { setActiveSubView('grid'); setCsvUploadResult(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-gray-850/40 rounded-2xl border border-gray-100 dark:border-gray-800/80">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-600">Dynamic Scheme Columns</span>
            <code className="text-[10px] font-mono font-semibold block text-gray-700 select-all leading-relaxed">
              Product Name, Category, Brand, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Stock Alert, Purchase Price, SellingPrice
            </code>
            <p className="text-[11px] text-gray-500">
              *Example line:* <code className="bg-white px-1 py-0.5 rounded border">"Fine Knit Vest", Tops, Nørse, S, Cream White, #eeecd5, 918230981, NT-FKV-CW-S, 15, 2, 8.50, 24.00</code>
            </p>

            {/* DEMO PRESETS */}
            <div className="pt-2.5 border-t border-gray-200/50 dark:border-gray-850">
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">⚡️ Preset Fashion Line Quick-Injections (One-Click Real Data)</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const DEMO_DENIM = `Product Name, Category, Brand, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Stock Alert, Purchase Price, SellingPrice
"Artisan Indigo Overcoat",Outerwear & Jackets,Nørse Denim,M,Indigo Blue,#1e293b,890213010,ND-AIO-IB-M,18,4,45.00,120.00
"Artisan Indigo Overcoat",Outerwear & Jackets,Nørse Denim,L,Indigo Blue,#1e293b,890213011,ND-AIO-IB-L,12,4,45.00,120.00
"Classic Selvedge 501",Pants & Trousers,Nørse Denim,32,Vintage Blue,#3b82f6,890213020,ND-CS5-VB-32,25,5,30.00,85.00
"Classic Selvedge 501",Pants & Trousers,Nørse Denim,34,Vintage Blue,#3b82f6,890213021,ND-CS5-VB-34,20,5,30.00,85.00
"Chore Vintage Vest",Outerwear & Jackets,Nørse Denim,S,Raw Ochre,#b45309,890213030,ND-CVV-RO-S,15,3,24.00,68.00
"Chore Vintage Vest",Outerwear & Jackets,Nørse Denim,L,Raw Ochre,#b45309,890213032,ND-CVV-RO-L,10,3,24.00,68.00`;
                    setCsvRaw(DEMO_DENIM.trim());
                    setCsvUploadResult(null);
                    playScannerSound('click');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-teal-600 text-[10px] font-bold rounded-lg border border-gray-200/60 dark:border-gray-700 shadow-3xs transition-all cursor-pointer"
                >
                  👖 Artisan Denim Collection (6 SKUs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const DEMO_SPORT = `Product Name, Category, Brand, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Stock Alert, Purchase Price, SellingPrice
"Aura Athletic Shell",Activewear & Loungewear,Aura Wear,S,Slate Sage,#57534e,890314010,AW-AAS-SS-S,30,6,20.00,55.00
"Aura Athletic Shell",Activewear & Loungewear,Aura Wear,XL,Slate Sage,#57534e,890314013,AW-AAS-SS-XL,15,6,20.00,55.00
"Flex Compression Pants",Activewear & Loungewear,Aura Wear,S,Charcoal Gray,#4b5563,890314020,AW-FCP-CG-S,45,8,18.00,48.00
"Flex Compression Pants",Activewear & Loungewear,Aura Wear,M,Charcoal Gray,#4b5563,890314021,AW-FCP-CG-M,50,8,18.00,48.00
"Grid Vent Racer Tee",T-Shirts & Tops,Aura Wear,XS,Onyx Black,#09090b,890314030,AW-GVR-OB-XS,25,4,12.00,32.00
"Grid Vent Racer Tee",T-Shirts & Tops,Aura Wear,L,Onyx Black,#09090b,890314033,AW-GVR-OB-L,30,4,12.00,32.00`;
                    setCsvRaw(DEMO_SPORT.trim());
                    setCsvUploadResult(null);
                    playScannerSound('click');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-teal-600 text-[10px] font-bold rounded-lg border border-gray-200/60 dark:border-gray-700 shadow-3xs transition-all cursor-pointer"
                >
                  ⚡️ Aura Sportswear Line (6 SKUs)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const DEMO_KNIT = `Product Name, Category, Brand, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Stock Alert, Purchase Price, SellingPrice
"Alpine Chunky Cardigan",Sweaters & Knitwear,High Peak,S,Oatmeal Cream,#f5f5f4,890415010,HP-ACC-OC-S,12,3,40.00,98.00
"Alpine Chunky Cardigan",Sweaters & Knitwear,High Peak,XL,Oatmeal Cream,#f5f5f4,890415013,HP-ACC-OC-XL,8,3,40.00,98.00
"Cable Pattern Crewneck",Sweaters & Knitwear,High Peak,M,Forest Pine,#14532d,890415021,HP-CPC-FP-M,22,5,28.00,75.00
"Cable Pattern Crewneck",Sweaters & Knitwear,High Peak,L,Forest Pine,#14532d,890415022,HP-CPC-FP-L,18,5,28.00,75.00
"Thermal Merino Sox",Accessories & Hats,High Peak,O/S,Arctic Crimson,#b91c1c,890415030,HP-TMS-AC-OS,60,10,6.00,18.00`;
                    setCsvRaw(DEMO_KNIT.trim());
                    setCsvUploadResult(null);
                    playScannerSound('click');
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-teal-600 text-[10px] font-bold rounded-lg border border-gray-200/60 dark:border-gray-700 shadow-3xs transition-all cursor-pointer"
                >
                  🧶 Alpine Peak Knitwear (5 SKUs)
                </button>
              </div>
            </div>
          </div>

          {csvUploadResult && (
            <div className={`p-4 rounded-2xl border ${
              csvUploadResult.errors.length === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
            } text-xs font-medium space-y-2`}>
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4" />
                Parsed {csvUploadResult.success} products variants successfully!
              </div>
              {csvUploadResult.errors.length > 0 && (
                <div className="pt-2 border-t border-amber-200/50 space-y-1">
                  <span className="font-semibold text-[10px] uppercase block">Parser Error Report:</span>
                  <div className="max-h-24 overflow-y-auto font-mono text-[10px] text-rose-600 space-y-1">
                    {csvUploadResult.errors.map((e, idx) => <span className="block" key={idx}>• {e}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-gray-550 uppercase tracking-widest">Paste Raw Spreadsheet Lines</label>
            <textarea
              placeholder="Paste raw csv lines starting with data lines..."
              rows={10}
              value={csvRaw}
              onChange={(e) => setCsvRaw(e.target.value)}
              className="w-full p-4 text-xs font-mono bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3.5">
            <button
              onClick={() => { setCsvRaw(''); setCsvUploadResult(null); }}
              className="px-4 py-2 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Flush Box
            </button>
            <button
              onClick={handleCSVBatchCommit}
              disabled={!csvRaw.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Parse & Launch Catalog Addition 🚀
            </button>
          </div>
        </div>
      )}

      {/* --- INLINE EDIT DIALOG FOR METADATA/Variant Details --- */}
      {editingVariant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-901 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full text-left space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900 block flex items-center gap-1.5">
                <Box className="w-4 h-4 text-teal-600" />
                Modify Apparel Parameters
              </span>
              <button onClick={() => setEditingVariant(null)} className="text-gray-400 hover:text-gray-600 p-0.5 font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Quantities On Hand</label>
                <input
                  type="number"
                  min="0"
                  value={editingVariant.currentStock}
                  onChange={(e) => setEditingVariant({ ...editingVariant, currentStock: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Minimum Alert Limit</label>
                <input
                  type="number"
                  min="0"
                  value={editingVariant.minimumStockAlert}
                  onChange={(e) => setEditingVariant({ ...editingVariant, minimumStockAlert: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Wholesale Material Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingVariant.purchasePrice}
                  onChange={(e) => setEditingVariant({ ...editingVariant, purchasePrice: Math.max(0, parseFloat(e.target.value) || 0.00) })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Retail MSRP Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingVariant.sellingPrice}
                  onChange={(e) => setEditingVariant({ ...editingVariant, sellingPrice: Math.max(0, parseFloat(e.target.value) || 0.00) })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Barcode Tag ID</label>
                <input
                  type="text"
                  value={editingVariant.barcode}
                  onChange={(e) => setEditingVariant({ ...editingVariant, barcode: e.target.value })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">SKU Reference</label>
                <input
                  type="text"
                  value={editingVariant.sku}
                  onChange={(e) => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Loc Grid Coordinate</label>
                <input
                  type="text"
                  value={editingVariant.storageLocation}
                  onChange={(e) => setEditingVariant({ ...editingVariant, storageLocation: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-950"
                />
              </div>
              
              {/* Manufacturer selection dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Assigned Supplier</label>
                <select
                  value={editingVariant.supplierId}
                  onChange={(e) => setEditingVariant({ ...editingVariant, supplierId: e.target.value })}
                  className="w-full text-xs px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden"
                >
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setEditingVariant(null)}
                className="px-4 py-2 border border-gray-150 rounded-xl text-xs font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingVariant) {
                    onUpdateVariant(editingVariant);
                    setEditingVariant(null);
                  }
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase rounded-xl transition-all font-sans"
              >
                Apply Parameters 💾
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- PRINT LABELS DIALOG POPUP --- */}
      {labelQueue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl max-w-2xl w-full text-left space-y-5 select-none print:bg-white print:p-0 print:shadow-none print:border-0">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 print:hidden">
              <span className="text-sm font-bold text-gray-905 block flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-teal-600" />
                Sheet Adhesive Printer Buffer
              </span>
              <button onClick={() => setLabelQueue(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            <div className="flex items-center gap-4 print:hidden">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tags to print (Count)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={labelQueue.quantity}
                    onChange={(e) => setLabelQueue({ ...labelQueue, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-20 px-2 py-1 bg-gray-50 border border-gray-150 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[11px] text-gray-400">Prints in sheet sticker matrices.</span>
                </div>
              </div>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Printer className="w-3.5 h-3.5" />
                Trigger Print Screen
              </button>
            </div>

            {/* Simulated sticker sheets sheets layout */}
            <div className="max-h-96 overflow-y-auto bg-gray-100/50 p-4 rounded-2xl border border-gray-150 select-text print:bg-white print:p-0 print:max-h-none print:border-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-1.5">
                {Array.from({ length: labelQueue.quantity }).map((_, idx) => (
                  <div key={idx} className="bg-white border-2 border-gray-300 dark:border-gray-100 rounded-lg p-2 flex flex-col items-center justify-between text-center select-all aspect-video space-y-1 print:border print:shadow-none bg-white">
                    <span className="text-[9px] font-black text-gray-950 uppercase truncate max-w-full">
                      {labelQueue.product.brand}
                    </span>
                    <span className="text-[9px] leading-tight text-gray-700 block truncate max-w-full">
                      {labelQueue.product.name}
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 font-mono">
                      {labelQueue.variant.size} / {labelQueue.variant.colorName} • {labelQueue.variant.sku}
                    </span>
                    
                    {/* Inline code bar preview */}
                    <BarcodeRenderer value={labelQueue.variant.barcode} showText={false} height={20} width={110} />
                    
                    <div className="flex items-center justify-between w-full pt-1 border-t border-dashed border-gray-200 text-[8px] font-bold">
                      <span className="font-mono text-teal-600">${labelQueue.variant.sellingPrice.toFixed(2)}</span>
                      <span className="text-gray-400">{labelQueue.variant.storageLocation || 'A1'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setLabelQueue(null)}
              className="w-full text-center py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded-xl tracking-wider transition-all print:hidden border border-slate-200 dark:border-slate-700/50 cursor-pointer"
            >
              Flush Printer Buffer
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
