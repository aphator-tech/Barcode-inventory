/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Product, Variant, Supplier, TransactionType, Transaction, ScanLog, CartItem, InventoryStats } from './types';

// Web Audio Synth for professional retail scanner sound effects
export const playScannerSound = (type: 'success' | 'error' | 'click') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Audio Context might be locked/blocked until user interaction, ignore
  }
};

// Initial Suppliers
const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'Elite Apparel Manufacturing', contactName: 'Sarah Jenkins', email: 's.jenkins@eliteapparel.com', phone: '+1 (555) 382-9102', address: 'Building 14, garment District, New York, NY' },
  { id: 'sup2', name: 'Zenith Textiles & Weaving', contactName: 'Kenji Sato', email: 'orders@zenithtextiles.jp', phone: '+81 3-5555-0143', address: '2-11 Shibakoen, Minato-ku, Tokyo, Japan' },
  { id: 'sup3', name: 'Patagonia Eco-Weaves Group', contactName: 'Mateo Ross', email: 'm.ross@ecoweave.cl', phone: '+56 2 2555 8192', address: 'Av. Libertador 4830, Santiago, Chile' }
];

// Initial Core Products
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    name: 'Nordic Heritage Wool Sweater',
    description: 'Heavyweight, 100% premium merino wool ribbed knit sweater with traditional fisherman stitching lines. Highly breathable, water-resistant fiber structure perfect for autumn/winter layering.',
    category: 'Sweaters & Knitwear',
    brand: 'Nørse Thread',
    gender: 'Unisex',
    material: '100% Merino Wool',
    season: 'Fall/Winter 2026',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-03-12T08:30:00Z'
  },
  {
    id: 'prod2',
    name: 'Classic Urban Slim-Fit Chinos',
    description: 'Structured cotton-twill trousers featuring a moderate double-stitch seat, angled utility side pockets, and premium YKK zippers. Washed finish for immediate comfort and soft drape.',
    category: 'Pants & Trousers',
    brand: 'Monochrome Supply',
    gender: 'Men',
    material: '98% Cotton, 2% Spandex',
    season: 'Spring/Summer 2026',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-04-01T11:22:00Z'
  },
  {
    id: 'prod3',
    name: 'Minimalist Breezy V-Neck Tee',
    description: 'Featherlight organic linen blend linen knit tee. Cut with relaxed dropshoulders, side vents and self-fabric clean neck bind.',
    category: 'T-Shirts & Tops',
    brand: 'Zenith Wardrobe',
    gender: 'Women',
    material: '70% Organic Cotton, 30% Linen',
    season: 'Spring/Summer 2026',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-02-15T15:45:00Z'
  },
  {
    id: 'prod4',
    name: 'Modular Commuter Field Shell',
    description: 'A windproof, highly water-repellent performance outer jacket designed for modern urban environments. Features quick-access hidden magnetic travel pockets and adjustable technical toggles.',
    category: 'Outerwear & Jackets',
    brand: 'Nørse Thread',
    gender: 'Unisex',
    material: '100% Recycled Nylon',
    season: 'All-Season Tech',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-01-20T09:15:00Z'
  },
  {
    id: 'prod5',
    name: 'Everyday Active Relaxed Joggers',
    description: 'A cozy everyday staple with tapered ankle cuffs, a flexible elasticized waistband with custom drawstrings, and reinforced deep side pockets.',
    category: 'Activewear & Loungewear',
    brand: 'Monochrome Supply',
    gender: 'Unisex',
    material: '80% French Terry Cotton, 20% Polyester',
    season: 'Spring/Summer 2026',
    image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&q=80&w=600',
    createdAt: '2026-05-10T14:10:00Z'
  }
];

// Initial Variants
const INITIAL_VARIANTS: Variant[] = [
  // Product 1: Nordic Heritage Wool Sweater
  { id: 'var1_1', productId: 'prod1', size: 'S', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019011', sku: 'NT-NWS-CO-S', currentStock: 18, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-3' },
  { id: 'var1_2', productId: 'prod1', size: 'M', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019012', sku: 'NT-NWS-CO-M', currentStock: 22, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-3' },
  { id: 'var1_3', productId: 'prod1', size: 'L', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019013', sku: 'NT-NWS-CO-L', currentStock: 4, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-4' },
  { id: 'var1_4', productId: 'prod1', size: 'M', color: '#1a2b3c', colorName: 'Navy Dusk', barcode: '1019022', sku: 'NT-NWS-ND-M', currentStock: 12, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin B-1' },
  { id: 'var1_5', productId: 'prod1', size: 'L', color: '#1a2b3c', colorName: 'Navy Dusk', barcode: '1019023', sku: 'NT-NWS-ND-L', currentStock: 15, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin B-1' },

  // Product 2: Classic Urban Slim Chinos
  { id: 'var2_1', productId: 'prod2', size: 'M', color: '#3c352a', colorName: 'Raw Umber', barcode: '2023012', sku: 'MS-CCC-RU-M', currentStock: 25, minimumStockAlert: 8, purchasePrice: 20.00, sellingPrice: 59.00, supplierId: 'sup1', storageLocation: 'Aisle 1, Bin D-12' },
  { id: 'var2_2', productId: 'prod2', size: 'L', color: '#3c352a', colorName: 'Raw Umber', barcode: '2023013', sku: 'MS-CCC-RU-L', currentStock: 30, minimumStockAlert: 8, purchasePrice: 20.00, sellingPrice: 59.00, supplierId: 'sup1', storageLocation: 'Aisle 1, Bin D-12' },
  { id: 'var2_3', productId: 'prod2', size: 'M', color: '#1f2937', colorName: 'Charcoal Black', barcode: '2023022', sku: 'MS-CCC-CB-M', currentStock: 2, minimumStockAlert: 8, purchasePrice: 20.00, sellingPrice: 59.00, supplierId: 'sup1', storageLocation: 'Aisle 1, Bin D-13' },
  { id: 'var2_4', productId: 'prod2', size: 'L', color: '#1f2937', colorName: 'Charcoal Black', barcode: '2023023', sku: 'MS-CCC-CB-L', currentStock: 14, minimumStockAlert: 8, purchasePrice: 20.00, sellingPrice: 59.00, supplierId: 'sup1', storageLocation: 'Aisle 1, Bin D-13' },

  // Product 3: Minimalist Breezy V-Neck Tee
  { id: 'var3_1', productId: 'prod3', size: 'S', color: '#fcf8f2', colorName: 'Natural Eggshell', barcode: '3045011', sku: 'ZW-MBT-NE-S', currentStock: 40, minimumStockAlert: 10, purchasePrice: 11.50, sellingPrice: 32.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf A' },
  { id: 'var3_2', productId: 'prod3', size: 'M', color: '#fcf8f2', colorName: 'Natural Eggshell', barcode: '3045012', sku: 'ZW-MBT-NE-M', currentStock: 45, minimumStockAlert: 10, purchasePrice: 11.50, sellingPrice: 32.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf A' },
  { id: 'var3_3', productId: 'prod3', size: 'L', color: '#fcf8f2', colorName: 'Natural Eggshell', barcode: '3045013', sku: 'ZW-MBT-NE-L', currentStock: 35, minimumStockAlert: 10, purchasePrice: 11.50, sellingPrice: 32.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf A' },
  { id: 'var3_4', productId: 'prod3', size: 'S', color: '#5a6258', colorName: 'Sage Leaf', barcode: '3045021', sku: 'ZW-MBT-SL-S', currentStock: 1, minimumStockAlert: 10, purchasePrice: 12.00, sellingPrice: 34.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf B' },
  { id: 'var3_5', productId: 'prod3', size: 'M', color: '#5a6258', colorName: 'Sage Leaf', barcode: '3045022', sku: 'ZW-MBT-SL-M', currentStock: 18, minimumStockAlert: 10, purchasePrice: 12.00, sellingPrice: 34.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf B' },

  // Product 4: Technical Field Shell
  { id: 'var4_1', productId: 'prod4', size: 'S', color: '#273c33', colorName: 'Forest Forest', barcode: '4081011', sku: 'NT-MFS-FF-S', currentStock: 10, minimumStockAlert: 3, purchasePrice: 65.00, sellingPrice: 149.00, supplierId: 'sup2', storageLocation: 'Aisle 4, Shelf C' },
  { id: 'var4_2', productId: 'prod4', size: 'M', color: '#273c33', colorName: 'Forest Forest', barcode: '4081012', sku: 'NT-MFS-FF-M', currentStock: 12, minimumStockAlert: 3, purchasePrice: 65.00, sellingPrice: 149.00, supplierId: 'sup2', storageLocation: 'Aisle 4, Shelf C' },
  { id: 'var4_3', productId: 'prod4', size: 'L', color: '#273c33', colorName: 'Forest Forest', barcode: '4081013', sku: 'NT-MFS-FF-L', currentStock: 3, minimumStockAlert: 3, purchasePrice: 65.00, sellingPrice: 149.00, supplierId: 'sup2', storageLocation: 'Aisle 4, Shelf C' },

  // Product 5: Everyday joggers
  { id: 'var5_1', productId: 'prod5', size: 'M', color: '#7f7f7f', colorName: 'Heather Grey', barcode: '5092012', sku: 'MS-EARJ-HG-M', currentStock: 30, minimumStockAlert: 8, purchasePrice: 15.00, sellingPrice: 45.00, supplierId: 'sup1', storageLocation: 'Aisle 5, Shelf A' },
  { id: 'var5_2', productId: 'prod5', size: 'L', color: '#7f7f7f', colorName: 'Heather Grey', barcode: '5092013', sku: 'MS-EARJ-HG-L', currentStock: 25, minimumStockAlert: 8, purchasePrice: 15.00, sellingPrice: 45.00, supplierId: 'sup1', storageLocation: 'Aisle 5, Shelf A' }
];

// Seed Historical Transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tr_10928',
    timestamp: '2026-05-22T09:40:00Z',
    type: 'SALE',
    items: [
      { variantId: 'var1_2', productName: 'Nordic Heritage Wool Sweater', variantDetails: 'M / Chalk Oatmeal', quantity: 1, unitPrice: 95.00, totalPrice: 95.00 },
      { variantId: 'var2_1', productName: 'Classic Urban Slim-Fit Chinos', variantDetails: 'M / Raw Umber', quantity: 2, unitPrice: 59.00, totalPrice: 118.00 }
    ],
    discount: 10.00,
    tax: 16.24,
    subtotal: 213.00,
    grandTotal: 219.24,
    paymentMethod: 'Card',
    scannedCode: '1019012',
    notes: 'In-store POS checkout'
  },
  {
    id: 'tr_10929',
    timestamp: '2026-05-22T14:15:00Z',
    type: 'RESTOCK',
    items: [
      { variantId: 'var1_3', productName: 'Nordic Heritage Wool Sweater', variantDetails: 'L / Chalk Oatmeal', quantity: 10, unitPrice: 42.00, totalPrice: 420.00 }
    ],
    discount: 0,
    tax: 0,
    subtotal: 420.00,
    grandTotal: 420.00,
    notes: 'Warehouse shipment receive elite cargo'
  },
  {
    id: 'tr_10930',
    timestamp: '2026-05-23T08:11:00Z',
    type: 'SALE',
    items: [
      { variantId: 'var3_2', productName: 'Minimalist Breezy V-Neck Tee', variantDetails: 'M / Natural Eggshell', quantity: 3, unitPrice: 32.00, totalPrice: 96.00 }
    ],
    discount: 0,
    tax: 7.68,
    subtotal: 96.00,
    grandTotal: 103.68,
    paymentMethod: 'Mobile Pay',
    scannedCode: '3045012'
  },
  {
    id: 'tr_10931',
    timestamp: '2026-05-23T10:05:00Z',
    type: 'DAMAGED',
    items: [
      { variantId: 'var4_3', productName: 'Modular Commuter Field Shell', variantDetails: 'L / Forest Forest', quantity: 1, unitPrice: 65.00, totalPrice: 65.00 }
    ],
    discount: 0,
    tax: 0,
    subtotal: 65.00,
    grandTotal: 65.00,
    notes: 'Water stain on hanger, written off'
  }
];

const INITIAL_SCAN_LOGS: ScanLog[] = [
  { id: 'sc_1', timestamp: '2026-05-23T10:50:00Z', barcode: '1019012', status: 'FOUND', variantId: 'var1_2', actionTaken: 'View details on dashboard' },
  { id: 'sc_2', timestamp: '2026-05-23T11:15:20Z', barcode: '3045021', status: 'FOUND', variantId: 'var3_4', actionTaken: 'Added to POS cart' },
  { id: 'sc_3', timestamp: '2026-05-23T11:22:11Z', barcode: '99999999', status: 'NOT_FOUND', actionTaken: 'Scanned tag unknown barcode search' }
];

export const useInventoryState = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalVariants: 0,
    totalStockValue: 0,
    totalPurchaseValue: 0,
    lowStockCount: 0,
    totalItems: 0,
    dailySales: 0,
    weeklySales: 0,
    recentSalesCount: 0
  });

  // Load from local storage or set defaults
  useEffect(() => {
    const rawProds = localStorage.getItem('barinv_products');
    const rawVars = localStorage.getItem('barinv_variants');
    const rawSups = localStorage.getItem('barinv_suppliers');
    const rawTrans = localStorage.getItem('barinv_transactions');
    const rawScans = localStorage.getItem('barinv_scanlogs');

    if (rawProds && rawVars && rawSups) {
      setProducts(JSON.parse(rawProds));
      setVariants(JSON.parse(rawVars));
      setSuppliers(JSON.parse(rawSups));
      setTransactions(rawTrans ? JSON.parse(rawTrans) : []);
      setScanLogs(rawScans ? JSON.parse(rawScans) : []);
    } else {
      // Seed initial data
      localStorage.setItem('barinv_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('barinv_variants', JSON.stringify(INITIAL_VARIANTS));
      localStorage.setItem('barinv_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
      localStorage.setItem('barinv_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('barinv_scanlogs', JSON.stringify(INITIAL_SCAN_LOGS));

      setProducts(INITIAL_PRODUCTS);
      setVariants(INITIAL_VARIANTS);
      setSuppliers(INITIAL_SUPPLIERS);
      setTransactions(INITIAL_TRANSACTIONS);
      setScanLogs(INITIAL_SCAN_LOGS);
    }
  }, []);

  // Recalculate statistics when core data changes
  useEffect(() => {
    if (products.length === 0 || variants.length === 0) return;

    let totalItems = 0;
    let totalStockValue = 0;
    let totalPurchaseValue = 0;
    let lowStockCount = 0;

    variants.forEach(v => {
      totalItems += v.currentStock;
      totalStockValue += (v.currentStock * v.sellingPrice);
      totalPurchaseValue += (v.currentStock * v.purchasePrice);
      if (v.currentStock <= v.minimumStockAlert) {
        lowStockCount++;
      }
    });

    // Calculate sales based on transaction logs (SALE index within last periods)
    // For safety, let's treat the date 2026-05-23 as "today" because of mock bounds
    const parseDateISO = (isoStr: string) => new Date(isoStr).getTime();
    const todayTimestamp = parseDateISO('2026-05-23T11:46:26Z');
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    let dailySales = 0;
    let weeklySales = 0;
    let salesCount = 0;

    transactions.forEach(t => {
      if (t.type === 'SALE') {
        const transTime = parseDateISO(t.timestamp);
        const age = todayTimestamp - transTime;
        
        if (age >= 0 && age <= oneDayMs) {
          dailySales += t.grandTotal;
        }
        if (age >= 0 && age <= sevenDaysMs) {
          weeklySales += t.grandTotal;
          salesCount++;
        }
      }
    });

    setStats({
      totalProducts: products.length,
      totalVariants: variants.length,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      totalPurchaseValue: Math.round(totalPurchaseValue * 100) / 100,
      lowStockCount,
      totalItems,
      dailySales: Math.round(dailySales * 100) / 100,
      weeklySales: Math.round(weeklySales * 100) / 100,
      recentSalesCount: salesCount
    });
  }, [products, variants, transactions]);

  const saveToLocalStorage = (
    prods: Product[],
    vars: Variant[],
    sups: Supplier[],
    trans: Transaction[],
    scans: ScanLog[]
  ) => {
    localStorage.setItem('barinv_products', JSON.stringify(prods));
    localStorage.setItem('barinv_variants', JSON.stringify(vars));
    localStorage.setItem('barinv_suppliers', JSON.stringify(sups));
    localStorage.setItem('barinv_transactions', JSON.stringify(trans));
    localStorage.setItem('barinv_scanlogs', JSON.stringify(scans));
  };

  // --- ACTIONS ---

  // Add a new product entirely
  const addProduct = (product: Product, productVariants: Omit<Variant, 'id' | 'productId'>[]) => {
    const newProds = [product, ...products];
    const newVarsList: Variant[] = productVariants.map((v, idx) => ({
      ...v,
      id: `var_${Date.now()}_${idx}`,
      productId: product.id,
    }));
    const newVars = [...newVarsList, ...variants];

    setProducts(newProds);
    setVariants(newVars);
    saveToLocalStorage(newProds, newVars, suppliers, transactions, scanLogs);
    playScannerSound('click');
  };

  // Update existing product meta
  const updateProductMeta = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    saveToLocalStorage(updated, variants, suppliers, transactions, scanLogs);
  };

  // Update variant information
  const updateVariant = (updatedVariant: Variant) => {
    const updated = variants.map(v => v.id === updatedVariant.id ? updatedVariant : v);
    setVariants(updated);
    saveToLocalStorage(products, updated, suppliers, transactions, scanLogs);
    playScannerSound('click');
  };

  // Quick Stock adjustment directly on variant
  const adjustStockDirectly = (variantId: string, quantityChange: number, type: 'RESTOCK' | 'DAMAGED' | 'RETURN', reasonNote?: string) => {
    let transType: TransactionType = type;
    const targetVariant = variants.find(v => v.id === variantId);
    if (!targetVariant) return;

    const prod = products.find(p => p.id === targetVariant.productId);
    const newQty = targetVariant.currentStock + quantityChange;

    if (newQty < 0) {
      playScannerSound('error');
      alert(`Cannot deduct stock below 0. Current stock is ${targetVariant.currentStock}.`);
      return;
    }

    const updatedVars = variants.map(v => {
      if (v.id === variantId) {
        return { ...v, currentStock: newQty };
      }
      return v;
    });

    // Log complete transaction
    const unitPrice = type === 'RESTOCK' ? targetVariant.purchasePrice : targetVariant.sellingPrice;
    const computedTotal = Math.abs(quantityChange) * unitPrice;
    
    const newTransaction: Transaction = {
      id: `tr_${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      type: transType,
      items: [
        {
          variantId,
          productName: prod?.name || 'Unknown Product',
          variantDetails: `${targetVariant.size} / ${targetVariant.colorName}`,
          quantity: Math.abs(quantityChange),
          unitPrice,
          totalPrice: computedTotal
        }
      ],
      discount: 0,
      tax: 0,
      subtotal: computedTotal,
      grandTotal: computedTotal,
      notes: reasonNote || `Quick adjustment: ${type.toLowerCase()} of ${Math.abs(quantityChange)} items.`
    };

    const newTrans = [newTransaction, ...transactions];

    setVariants(updatedVars);
    setTransactions(newTrans);
    saveToLocalStorage(products, updatedVars, suppliers, newTrans, scanLogs);
    playScannerSound('success');
  };

  // Delete a product and its variants
  const deleteProductAndVariants = (productId: string) => {
    const filteredProds = products.filter(p => p.id !== productId);
    const filteredVars = variants.filter(v => v.productId !== productId);

    setProducts(filteredProds);
    setVariants(filteredVars);
    saveToLocalStorage(filteredProds, filteredVars, suppliers, transactions, scanLogs);
    playScannerSound('error');
  };

  // Add Supplier
  const addSupplier = (sup: Supplier) => {
    const newSups = [sup, ...suppliers];
    setSuppliers(newSups);
    saveToLocalStorage(products, variants, newSups, transactions, scanLogs);
  };

  // Record a scanned log
  const recordBarcodeScan = (barcode: string): { status: 'FOUND' | 'NOT_FOUND'; variant?: Variant; product?: Product } => {
    const cleanCode = barcode.trim();
    if (!cleanCode) return { status: 'NOT_FOUND' };

    const associatedVariant = variants.find(v => v.barcode === cleanCode || v.sku.toLowerCase() === cleanCode.toLowerCase());
    const associatedProduct = associatedVariant ? products.find(p => p.id === associatedVariant.productId) : undefined;

    const logId = `sc_${Date.now()}`;
    const newLog: ScanLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      barcode: cleanCode,
      status: associatedVariant ? 'FOUND' : 'NOT_FOUND',
      variantId: associatedVariant?.id,
      actionTaken: associatedVariant 
        ? `Identified variant ${associatedVariant.size} / ${associatedVariant.colorName} of ${associatedProduct?.name}`
        : 'Unknown barcode tag input'
    };

    const nextLogs = [newLog, ...scanLogs.slice(0, 49)]; // Cap scan logs
    setScanLogs(nextLogs);
    
    const updatedTrans = [...transactions];
    saveToLocalStorage(products, variants, suppliers, updatedTrans, nextLogs);

    if (associatedVariant) {
      playScannerSound('success');
      return { status: 'FOUND', variant: associatedVariant, product: associatedProduct };
    } else {
      playScannerSound('error');
      return { status: 'NOT_FOUND' };
    }
  };

  // Execute POS checkout cart and deduct stock automatically
  const executePOSCheckout = (
    cartItems: CartItem[], 
    discountAmount: number, 
    taxRate: number, 
    paymentMethod: Transaction['paymentMethod'],
    receiptNotes?: string
  ): Transaction | null => {
    if (cartItems.length === 0) return null;

    // Verify stock checks first to prevent negatives
    for (const item of cartItems) {
      const liveVar = variants.find(v => v.id === item.variant.id);
      if (!liveVar || liveVar.currentStock < item.quantity) {
        playScannerSound('error');
        alert(`Insufficient stock for ${item.product.name} (${item.variant.size}/${item.variant.colorName}). Available: ${liveVar?.currentStock || 0}`);
        return null;
      }
    }

    // Deduct stock levels reactive logic
    const updatedVars = variants.map(v => {
      const cartMatch = cartItems.find(item => item.variant.id === v.id);
      if (cartMatch) {
         return {
           ...v,
           currentStock: v.currentStock - cartMatch.quantity
         };
      }
      return v;
    });

    // Build the grand sales log
    let subtotal = 0;
    const itemsSnapshot = cartItems.map(item => {
      const lineTotal = item.quantity * item.variant.sellingPrice * (1 - item.discountPercentage / 100);
      subtotal += lineTotal;
      return {
        variantId: item.variant.id,
        productName: item.product.name,
        variantDetails: `${item.variant.size} / ${item.variant.colorName}`,
        quantity: item.quantity,
        unitPrice: item.variant.sellingPrice,
        totalPrice: Math.round(lineTotal * 100) / 100
      };
    });

    const netSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Math.round(netSubtotal * taxRate * 100) / 100;
    const grandTotal = Math.round((netSubtotal + taxAmount) * 100) / 100;

    const newTransaction: Transaction = {
      id: `tr_${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      type: 'SALE',
      items: itemsSnapshot,
      discount: discountAmount,
      tax: taxAmount,
      subtotal: Math.round(subtotal * 100) / 100,
      grandTotal: grandTotal,
      paymentMethod,
      notes: receiptNotes || 'POS checkout terminal order'
    };

    const nextTrans = [newTransaction, ...transactions];
    setVariants(updatedVars);
    setTransactions(nextTrans);
    saveToLocalStorage(products, updatedVars, suppliers, nextTrans, scanLogs);
    playScannerSound('success');

    return newTransaction;
  };

  // Undo / Delete last transaction log and restore/re-adjust stock levels
  const undoTransaction = (transactionId: string) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx) return;

    // Restore stock levels based on logs
    const updatedVars = [...variants];
    tx.items.forEach(item => {
      const vIdx = updatedVars.findIndex(v => v.id === item.variantId);
      if (vIdx !== -1) {
        if (tx.type === 'SALE' || tx.type === 'DAMAGED') {
          // Add back
          updatedVars[vIdx].currentStock += item.quantity;
        } else if (tx.type === 'RESTOCK' || tx.type === 'RETURN') {
          // Deduct back
          updatedVars[vIdx].currentStock = Math.max(0, updatedVars[vIdx].currentStock - item.quantity);
        }
      }
    });

    const nextTrans = transactions.filter(t => t.id !== transactionId);
    setVariants(updatedVars);
    setTransactions(nextTrans);
    saveToLocalStorage(products, updatedVars, suppliers, nextTrans, scanLogs);
    playScannerSound('error');
  };

  // Reset database state back to master default template
  const resetDatabaseToDefaults = () => {
    localStorage.removeItem('barinv_products');
    localStorage.removeItem('barinv_variants');
    localStorage.removeItem('barinv_suppliers');
    localStorage.removeItem('barinv_transactions');
    localStorage.removeItem('barinv_scanlogs');

    setProducts(INITIAL_PRODUCTS);
    setVariants(INITIAL_VARIANTS);
    setSuppliers(INITIAL_SUPPLIERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setScanLogs(INITIAL_SCAN_LOGS);
    playScannerSound('success');
  };

  // Bulk CSV file import parser
  const importCatalogFromCSV = (csvContent: string): { successCount: number; errors: string[] } => {
    const errors: string[] = [];
    let successCount = 0;
    
    try {
      const lines = csvContent.split(/\r?\n/);
      if (lines.length < 2) return { successCount: 0, errors: ['CSV file is empty or missing headers.'] };

      const headers = lines[0].split(',').map(h => h.trim().replace(/^['"]|['"]$/g, ''));
      
      const expectedHeaders = ['Product Name', 'Category', 'Brand', 'Size', 'Color', 'Barcode', 'SKU', 'Current Stock', 'Min Stock Alert', 'Purchase Price', 'SellingPrice'];
      
      const nextProds = [...products];
      const nextVars = [...variants];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Custom parser to handle quotes and commas safely
        const cells: string[] = [];
        let inQuotes = false;
        let currentCell = '';
        
        for (let charIndex = 0; charIndex < line.length; charIndex++) {
          const char = line[charIndex];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim());

        if (cells.length < 10) {
          errors.push(`Row ${i + 1} has insufficient columns (expected at least 11, got ${cells.length}).`);
          continue;
        }

        const name = cells[0].replace(/^["']|["']$/g, '');
        const category = cells[1].replace(/^["']|["']$/g, '') || 'Apparel';
        const brand = cells[2].replace(/^["']|["']$/g, '') || 'Brand Generic';
        const size = cells[3].replace(/^["']|["']$/g, '') || 'Free Size';
        const colorName = cells[4].replace(/^["']|["']$/g, '') || 'Default Color';
        const colorHex = cells[5] || '#888888';
        const barcode = cells[6] || `B${Date.now().toString().slice(-6)}${i}`;
        const sku = cells[7] || `SKU-${brand.slice(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}-${size}`;
        const stock = parseInt(cells[8]) || 0;
        const alertLvl = parseInt(cells[9]) || 5;
        const purchase = parseFloat(cells[10]) || 10.00;
        const selling = parseFloat(cells[11]) || 25.00;

        // Check for duplicates
        const barcodeExists = nextVars.some(v => v.barcode === barcode);
        if (barcodeExists) {
          errors.push(`Row ${i + 1}: Barcode ${barcode} already in system. Skipped.`);
          continue;
        }

        // Find or create product
        let product = nextProds.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (!product) {
          product = {
            id: `prod_csv_${Date.now()}_${i}`,
            name,
            description: `${name} - imported via catalog spreadsheet.`,
            category,
            brand,
            gender: 'Unisex',
            material: 'Cotton Blend',
            season: 'General 2026',
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600',
            createdAt: new Date().toISOString()
          };
          nextProds.push(product);
        }

        const variant: Variant = {
          id: `var_csv_${Date.now()}_${i}`,
          productId: product.id,
          size,
          color: colorHex,
          colorName,
          barcode,
          sku,
          currentStock: stock,
          minimumStockAlert: alertLvl,
          purchasePrice: purchase,
          sellingPrice: selling,
          supplierId: 'sup1',
          storageLocation: 'Aisle 1'
        };

        nextVars.push(variant);
        successCount++;
      }

      if (successCount > 0) {
        setProducts(nextProds);
        setVariants(nextVars);
        saveToLocalStorage(nextProds, nextVars, suppliers, transactions, scanLogs);
        playScannerSound('success');
      }

    } catch (err: any) {
      errors.push(`CSV parse error: ${err.message || err}`);
    }

    return { successCount, errors };
  };

  return {
    products,
    variants,
    suppliers,
    transactions,
    scanLogs,
    stats,
    addProduct,
    updateProductMeta,
    updateVariant,
    adjustStockDirectly,
    deleteProductAndVariants,
    addSupplier,
    recordBarcodeScan,
    executePOSCheckout,
    undoTransaction,
    importCatalogFromCSV,
    resetDatabaseToDefaults
  };
};
