/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Trash, 
  Barcode, 
  Plus, 
  Minus, 
  Search, 
  DollarSign, 
  Percent, 
  CheckCircle, 
  Printer, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Shirt
} from 'lucide-react';
import { Product, Variant, CartItem, Transaction } from '../types';
import { playScannerSound } from '../store';

interface POSProps {
  id: string;
  products: Product[];
  variants: Variant[];
  onCheckout: (
    cartItems: CartItem[], 
    discount: number, 
    taxRate: number, 
    paymentMethod: Transaction['paymentMethod'],
    notes?: string
  ) => Transaction | null;
}

export const POSModule: React.FC<POSProps> = ({
  id,
  products,
  variants,
  onCheckout
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [flatDiscount, setFlatDiscount] = useState<number>(0); // absolute dollar discount
  const [taxRate, setTaxRate] = useState<number>(0.08); // 8% default sales tax
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Card');
  const [sessionNotes, setSessionNotes] = useState('');
  
  // Scans history during current terminal session
  const [terminalScans, setTerminalScans] = useState<string[]>([]);
  
  // Last processed Receipt for printing
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);

  // Focus reference for search
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Intercept scans directly inside POS and append to cart
  useEffect(() => {
    let rawBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeydown = (e: KeyboardEvent) => {
      // Direct keyboard wedge simulation 
      if (e.key === 'Escape') {
        setSearchText('');
        searchInputRef.current?.focus();
        return;
      }
      
      if (e.key.length !== 1 && e.key !== 'Enter') return;
      
      const now = Date.now();
      const diff = now - lastKeyTime;
      lastKeyTime = now;

      // Real USB/Bluetooth laser devices send sequential keystrokes extremely rapidly (< 35ms)
      if (diff > 45) {
        rawBuffer = ''; // Reset if slow human typing
      }

      if (e.key === 'Enter') {
        if (rawBuffer.trim().length > 2) {
          handleBarcodeScannedInPOS(rawBuffer.trim());
        }
        rawBuffer = '';
      } else {
        rawBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [variants, cart]);

  const handleBarcodeScannedInPOS = (barcode: string) => {
    const v = variants.find(item => item.barcode === barcode || item.sku.toLowerCase() === barcode.toLowerCase());
    if (v) {
      const p = products.find(prod => prod.id === v.productId);
      if (p) {
        addItemToCart(v, p);
        setTerminalScans(prev => [barcode, ...prev].slice(0, 5));
        setSearchText('');
        playScannerSound('success');
      }
    } else {
      playScannerSound('error');
    }
  };

  const addItemToCart = (variant: Variant, product: Product) => {
    // Check if variant is already in cart
    const existingIndex = cart.findIndex(item => item.variant.id === variant.id);
    
    // Check stock boundaries
    const maxAllowed = variant.currentStock;
    if (maxAllowed < 1) {
      playScannerSound('error');
      alert(`Cannot add ${product.name} (${variant.size} / ${variant.colorName}). Current inventory is 0.`);
      return;
    }

    if (existingIndex !== -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= maxAllowed) {
        playScannerSound('error');
        alert(`Cannot add more. Retail stock limit reached (${maxAllowed} remaining in warehouse).`);
        return;
      }
      
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart(prev => [...prev, { variant, product, quantity: 1, discountPercentage: 0 }]);
    }
    playScannerSound('click');
  };

  const removeCartItem = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
    playScannerSound('error');
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    const index = cart.findIndex(item => item.variant.id === variantId);
    if (index === -1) return;

    const maxStock = cart[index].variant.currentStock;
    if (quantity > maxStock) {
      alert(`Insufficient stock. Only ${maxStock} available.`);
      return;
    }
    if (quantity <= 0) {
      removeCartItem(variantId);
      return;
    }

    const updated = [...cart];
    updated[index].quantity = quantity;
    setCart(updated);
    playScannerSound('click');
  };

  const updateItemDiscount = (variantId: string, discPercent: number) => {
    const updated = cart.map(item => {
      if (item.variant.id === variantId) {
        return { ...item, discountPercentage: Math.max(0, Math.min(100, discPercent)) };
      }
      return item;
    });
    setCart(updated);
  };

  // Calculations
  const calculateCartSubtotal = () => {
    return cart.reduce((sum, item) => {
      const itemPrice = item.variant.sellingPrice * (1 - item.discountPercentage / 100);
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateCartSubtotal();
  const netSubtotal = Math.max(0, subtotal - flatDiscount);
  const calculatedTax = netSubtotal * taxRate;
  const grandTotal = netSubtotal + calculatedTax;

  const handleCheckoutCommit = () => {
    if (cart.length === 0) return;
    
    const receipt = onCheckout(
      cart,
      flatDiscount,
      taxRate,
      paymentMethod,
      sessionNotes || 'In-store front register check'
    );

    if (receipt) {
      setCurrentReceipt(receipt);
      setCart([]); // Clear Cart upon successful sales transaction
      setFlatDiscount(0);
      setSessionNotes('');
      playScannerSound('success');
    }
  };

  // Filter products for POS quick search picker
  const filteredSearchList = searchText.trim() === ''
    ? []
    : variants.filter(v => {
        const prod = products.find(p => p.id === v.productId);
        const searchString = `${v.sku} ${v.barcode} ${v.colorName} ${v.size} ${prod?.name} ${prod?.brand} ${prod?.category}`.toLowerCase();
        return searchString.includes(searchText.toLowerCase());
      }).slice(0, 6);

  const printReceiptLayout = () => {
    window.print();
  };

  return (
    <div id={id} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      
      {/* LEFT COLUMN: ACTIVE CART & TERMINAL (70%) */}
      <div className="xl:col-span-8 flex flex-col justify-between space-y-6">
        
        {/* UPPER ROW: INTERCEPT BAR & PRODUCT DIRECT SEARCH */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5" />
                Frontend Sales Register
              </span>
              <p className="text-[11px] text-gray-500">Scan clothing barcodes or use the live picker to queue checkout lists.</p>
            </div>

            {/* Simulated POS auto scanner listener state */}
            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800 text-left flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-teal-700 dark:text-teal-400 font-bold">
                Wedge listener online
              </span>
            </div>
          </div>

          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by SKU, Barcode, Name, Category, or Brand [Esc to clear]"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full text-sm py-3.5 pl-11 pr-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 dark:text-slate-100 transition-all font-medium"
            />
            <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
            {searchText && (
              <button 
                onClick={() => setSearchText('')}
                className="absolute right-4 top-3.5 text-xs text-rose-500 hover:underline font-bold"
              >
                Clear
              </button>
            )}

            {/* Quick Picker Dropdown Menu */}
            {filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 top-14 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-2xl shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 text-left">
                {filteredSearchList.map(v => {
                  const prod = products.find(p => p.id === v.productId);
                  if (!prod) return null;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        addItemToCart(v, prod);
                        setSearchText('');
                      }}
                      disabled={v.currentStock < 1}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl transition-all cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod.image} 
                          alt="" 
                          className="w-9 h-9 object-cover rounded-lg bg-gray-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-gray-900 dark:text-white block truncate max-w-sm">
                            {prod.name}
                          </span>
                          <span className="text-[10px] font-mono text-gray-500 block">
                            SKU: {v.sku} • {v.size} / {v.colorName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                          ${v.sellingPrice.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-bold ${v.currentStock <= v.minimumStockAlert ? 'text-rose-500' : 'text-gray-400'}`}>
                          {v.currentStock} in stock
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CART LIST OR EMPTY METRICS */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex-1 min-h-96 flex flex-col justify-between text-left">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-800/80">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-500" />
                Line Items ({cart.length})
              </h4>
              {cart.length > 0 && (
                <button
                  onClick={() => { setCart([]); playScannerSound('error'); }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Empty Session Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 space-y-4 text-gray-400 dark:text-gray-500">
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-gray-300 dark:text-gray-700" />
                </div>
                <div className="space-y-0.5 max-w-xs">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Terminal Cart is Empty</p>
                  <p className="text-[11px] leading-relaxed text-gray-400">
                    Use a laser gun or key-in variants above to process custom clothing retail orders.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div 
                    key={item.variant.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-gray-50/50 dark:bg-gray-800/35 border border-gray-100 dark:border-gray-800/70 rounded-2xl gap-4 hover:border-gray-200 transition-all text-left"
                  >
                    
                    {/* Item Information */}
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.product.image} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded-xl bg-gray-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white block truncate max-w-xs">
                          {item.product.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-semibold">{item.variant.sku}</span>
                          <span className="w-1.5 h-1.5 bg-gray-350 dark:bg-gray-750 rounded-full" />
                          <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-gray-200 inline-block" style={{ backgroundColor: item.variant.color }} />
                            {item.variant.colorName} • {item.variant.size}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Adjustment + Individual Discount */}
                    <div className="flex flex-wrap items-center gap-4">
                      
                      {/* Quantity Selectors */}
                      <div className="flex items-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-850 p-1">
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-gray-850 rounded text-gray-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-50 dark:hover:bg-gray-850 rounded text-gray-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Disc controller */}
                      <div className="flex items-center relative max-w-[84px]">
                        <input
                          type="number"
                          placeholder="Disc"
                          min="0"
                          max="100"
                          value={item.discountPercentage || ''}
                          onChange={(e) => updateItemDiscount(item.variant.id, parseInt(e.target.value) || 0)}
                          className="w-full text-right pr-5 pl-2 py-1 bg-white border border-gray-100 rounded-xl text-xs font-mono font-bold"
                        />
                        <Percent className="w-3 h-3 text-gray-400 absolute right-2" />
                      </div>

                      {/* Subtotal line */}
                      <div className="min-w-[80px] text-right space-y-0.5">
                        <span className="text-xs font-bold text-gray-950 dark:text-white block">
                          ${(item.variant.sellingPrice * (1 - item.discountPercentage / 100) * item.quantity).toFixed(2)}
                        </span>
                        {item.discountPercentage > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold line-through">
                            ${(item.variant.sellingPrice * item.quantity).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Trash action */}
                      <button
                        onClick={() => removeCartItem(item.variant.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50/20 rounded-lg cursor-pointer transition-all"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Terminal Live Log Bar */}
          {terminalScans.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>Fast scans detected:</span>
              <div className="flex gap-2">
                {terminalScans.map((sc, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 text-emerald-700 rounded text-[9px] font-bold">
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: REVENUE CALCULATOR & BILL PANEL (30%) */}
      <div className="xl:col-span-4 flex flex-col justify-between space-y-6">
        
        {/* BILL MATS */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs text-left space-y-6">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Transaction Calculations</h4>

          {/* Discounts Flat & Tax Rate adjusting selectors */}
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Flat Campaign Discount ($)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  placeholder="0.00"
                  value={flatDiscount || ''}
                  onChange={(e) => setFlatDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <DollarSign className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sales Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="8"
                    value={taxRate * 100}
                    onChange={(e) => setTaxRate((parseFloat(e.target.value) || 0) / 100)}
                    className="w-full pl-3 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                  <Percent className="absolute right-3 top-3 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">POS Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="Card">💳 Credit Card</option>
                  <option value="Cash">💵 Cash In Hand</option>
                  <option value="Mobile Pay">📱 Mobile Wallet</option>
                  <option value="Store Credit">🎟️ Store Credit</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Receipt Memo (Optional)</label>
              <textarea
                placeholder="Walk-in checkout note..."
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-950 dark:text-slate-100 resize-none placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Grand totals tally line */}
          <div className="pt-4 border-t border-gray-50 dark:border-gray-800 space-y-2.5 text-xs font-medium text-gray-500">
            <div className="flex justify-between">
              <span>Catalog Subtotal</span>
              <span className="font-mono font-bold text-gray-800">${subtotal.toFixed(2)}</span>
            </div>
            {flatDiscount > 0 && (
              <div className="flex justify-between text-rose-500 font-semibold">
                <span>Flat Coupon Deduction</span>
                <span className="font-mono font-bold">-${flatDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Sales Tax ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="font-mono font-bold text-gray-800">${calculatedTax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-3.5 border-t border-gray-150 border-dashed text-gray-900 dark:text-white">
              <span className="text-sm font-bold uppercase">Total Bill Due</span>
              <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckoutCommit}
            disabled={cart.length === 0}
            className="w-full text-center py-4 bg-teal-600 hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Process Sales Checkout 🚀
          </button>
        </div>

        {/* PRINTABLE RECEIPT DRAWER IF COMPlETED IN LAST SESSION */}
        {currentReceipt && (
          <div className="p-6 bg-slate-50 dark:bg-gray-850/60 rounded-3xl border border-gray-150 dark:border-gray-800/80 text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Receipt Generated
              </span>
              <button 
                onClick={printReceiptLayout}
                className="p-1 hover:bg-gray-100 rounded text-gray-600 flex items-center gap-1.5 text-xs font-bold uppercase transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / PDF
              </button>
            </div>

            {/* Simulated thermal receipt paper print preview */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs text-xs font-mono text-black space-y-3 p-5 text-left select-all">
              <div className="text-center pb-2.5 border-b border-dashed border-gray-300">
                <h5 className="font-bold text-sm uppercase">NØRSE THREAD RETAIL</h5>
                <p className="text-[10px] text-gray-500">Warehouse Flagship Outlet #3</p>
                <p className="text-[9px] text-gray-400">Order Ref: {currentReceipt.id}</p>
                <p className="text-[9px] text-gray-400">{new Date(currentReceipt.timestamp).toLocaleDateString()} {new Date(currentReceipt.timestamp).toLocaleTimeString()}</p>
              </div>

              <div className="space-y-1.5 pb-2.5 border-b border-dashed border-gray-300">
                {currentReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[150px]">{it.productName} ({it.variantDetails}) x{it.quantity}</span>
                    <span className="font-bold shrink-0">${it.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[10px] pb-2 border-b border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${currentReceipt.subtotal.toFixed(2)}</span>
                </div>
                {currentReceipt.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount Card:</span>
                    <span>-${currentReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax Rate:</span>
                  <span>${currentReceipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>Grand Net:</span>
                  <span>${currentReceipt.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-1.5 text-[9px] text-gray-400">
                <span>Method: {currentReceipt.paymentMethod}</span>
                <p className="mt-1 font-sans">Thank you for supporting sustainable fashion!</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentReceipt(null)}
              className="w-full py-2 bg-gray-150 hover:bg-gray-200 text-gray-700 text-[10px] font-bold uppercase rounded-lg tracking-wider text-center transition-all cursor-pointer"
            >
              Clear Print Buffer
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
