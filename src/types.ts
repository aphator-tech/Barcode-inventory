/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  gender: 'Unisex' | 'Men' | 'Women' | 'Kids';
  material: string;
  season: string; // e.g. "Spring/Summer 2026"
  image: string; // URL or base64
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'Free Size' | string;
  color: string; // Hex or Name
  colorName: string;
  barcode: string;
  sku: string;
  currentStock: number;
  minimumStockAlert: number;
  purchasePrice: number;
  sellingPrice: number;
  supplierId: string;
  storageLocation: string; // Warehouse section e.g. "Aisle 4, Shelf B"
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export type TransactionType = 'SALE' | 'RESTOCK' | 'RETURN' | 'DAMAGED';

export interface Transaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  items: {
    variantId: string;
    productName: string; // Snapshot for speed and history retention
    variantDetails: string; // e.g., "M / Midnight Black"
    quantity: number;
    unitPrice: number; // Selling or purchase price relative to action type
    totalPrice: number;
  }[];
  discount: number; // absolute dollar discount
  tax: number; // absolute tax
  subtotal: number;
  grandTotal: number;
  paymentMethod?: 'Cash' | 'Card' | 'Mobile Pay' | 'Store Credit';
  scannedCode?: string; // Barcode that initiated scanning if applicable
  notes?: string;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  barcode: string;
  status: 'FOUND' | 'NOT_FOUND';
  variantId?: string;
  actionTaken?: string;
}

// POS Cart Interface
export interface CartItem {
  variant: Variant;
  product: Product;
  quantity: number;
  discountPercentage: number; // 0 to 100
}

export interface InventoryStats {
  totalProducts: number;
  totalVariants: number;
  totalStockValue: number;
  totalPurchaseValue: number;
  lowStockCount: number;
  totalItems: number;
  dailySales: number;
  weeklySales: number;
  recentSalesCount: number;
}
