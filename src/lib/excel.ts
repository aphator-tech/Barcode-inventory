/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Product, Variant, Transaction } from '../types';

export interface ParsedExcelData {
  products: Product[];
  variants: Variant[];
  sheetNames: string[];
}

/**
 * Downloads a highly-detailed, formatted, client-side Excel workbook containing the active database.
 */
export function exportToExcel(products: Product[], variants: Variant[], transactions: Transaction[]) {
  const wb = XLSX.utils.book_new();

  // 1. Products Catalog Format
  const productRows = products.map(p => ({
    'Product ID': p.id,
    'Name': p.name,
    'Category': p.category,
    'Brand': p.brand,
    'Gender': p.gender,
    'Material': p.material,
    'Season': p.season,
    'Created At': p.createdAt
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productRows);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products Catalog');

  // 2. Variants Inventory Format
  const variantRows = variants.map(v => ({
    'Variant ID': v.id,
    'Product ID': v.productId,
    'Size': v.size,
    'Color Name': v.colorName,
    'Color Hex': v.color,
    'Barcode': v.barcode,
    'SKU': v.sku,
    'Current Stock': v.currentStock,
    'Min Alert Level': v.minimumStockAlert,
    'Purchase Cost': v.purchasePrice,
    'Selling Price MSRP': v.sellingPrice,
    'Storage Location': v.storageLocation
  }));
  const wsVariants = XLSX.utils.json_to_sheet(variantRows);
  XLSX.utils.book_append_sheet(wb, wsVariants, 'Variants Inventory');

  // 3. Complete Transactions Stream
  const transactionRows = transactions.map(t => {
    const itemsText = t.items.map(item => `${item.productName} (${item.variantDetails}) x${item.quantity}`).join('; ');
    return {
      'Timestamp': t.timestamp,
      'Transaction ID': t.id,
      'Type': t.type,
      'Subtotal': t.subtotal,
      'Discount': t.discount,
      'Tax': t.tax,
      'Grand Total': t.grandTotal,
      'Payment Method': t.paymentMethod || 'N/A',
      'Items Summary': itemsText,
      'Notes': t.notes || ''
    };
  });
  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaction History');

  XLSX.writeFile(wb, `Norse_Thread_Inventory_Logistics_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parses user selected Excel (.xlsx, .xls) or CSV files into structural local app data.
 */
export function parseExcelFile(fileData: ArrayBuffer): ParsedExcelData {
  try {
    const workbook = XLSX.read(fileData, { type: 'array' });
    let products: Product[] = [];
    let variants: Variant[] = [];

    // Search for Products Sheet
    const prodSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('product') || name.toLowerCase().includes('catalog')
    );
    if (prodSheetName) {
      const ws = workbook.Sheets[prodSheetName];
      const rawData = XLSX.utils.sheet_to_json<any>(ws);
      products = rawData.map((row, idx) => ({
        id: String(row['Product ID'] || row['id'] || row['ProductID'] || `prod_imported_${Date.now()}_${idx}`).trim(),
        name: String(row['Name'] || row['name'] || 'Unnamed Product').trim(),
        description: String(row['Description'] || row['description'] || `${row['Name'] || 'Unnamed Product'} imported via local excel catalog.`).trim(),
        category: String(row['Category'] || row['category'] || 'Apparel').trim(),
        brand: String(row['Brand'] || row['brand'] || 'Nørse Thread').trim(),
        gender: (row['Gender'] || row['gender'] || 'Unisex') as any,
        material: String(row['Material'] || row['material'] || 'Cotton Blend').trim(),
        season: String(row['Season'] || row['season'] || 'General 2026').trim(),
        image: String(row['Image'] || row['image'] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600').trim(),
        createdAt: String(row['Created At'] || row['created_at'] || row['createdAt'] || new Date().toISOString())
      }));
    }

    // Search for Variants Sheet
    const varSheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('variant') || name.toLowerCase().includes('item') || name.toLowerCase().includes('inventory')
    );
    if (varSheetName) {
      const ws = workbook.Sheets[varSheetName];
      const rawData = XLSX.utils.sheet_to_json<any>(ws);
      variants = rawData.map((row, idx) => ({
        id: String(row['Variant ID'] || row['id'] || row['VariantID'] || `var_imported_${Date.now()}_${idx}`).trim(),
        productId: String(row['Product ID'] || row['productId'] || row['product_id'] || row['ProductID'] || '').trim(),
        size: String(row['Size'] || row['size'] || 'Free Size').trim(),
        colorName: String(row['Color Name'] || row['colorName'] || row['color_name'] || 'Default').trim(),
        color: String(row['Color Hex'] || row['color'] || row['color_hex'] || '#9ca3af').trim(),
        barcode: String(row['Barcode'] || row['barcode'] || `B${Date.now()}_${idx}`).trim(),
        sku: String(row['SKU'] || row['sku'] || `SKU-${Date.now()}-${idx}`).trim(),
        currentStock: Number(row['Current Stock'] ?? row['currentStock'] ?? row['stock'] ?? row['Stock'] ?? 0),
        minimumStockAlert: Number(row['Min Alert Level'] ?? row['minimumStockAlert'] ?? row['alert_level'] ?? row['Minimum Stock Alert'] ?? 5),
        purchasePrice: Number(row['Purchase Cost'] ?? row['purchasePrice'] ?? row['purchase_price'] ?? row['Purchase Price'] ?? 10),
        sellingPrice: Number(row['Selling Price MSRP'] ?? row['sellingPrice'] ?? row['selling_price'] ?? row['Selling Price'] ?? 25),
        supplierId: String(row['Supplier ID'] || row['supplierId'] || 'sup1').trim(),
        storageLocation: String(row['Storage Location'] || row['storageLocation'] || 'Aisle 1').trim()
      }));
    }

    // Graceful Fallback if neither was parsed explicitly but there is only one sheet (such as a CSV file)
    if (products.length === 0 && variants.length === 0 && workbook.SheetNames.length === 1) {
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<any>(ws);
      if (rawData.length > 0) {
        const sample = rawData[0];
        const isVariantSet = 'Barcode' in sample || 'barcode' in sample || 'SKU' in sample || 'sku' in sample;

        if (isVariantSet) {
          variants = rawData.map((row, idx) => ({
            id: String(row['Variant ID'] || row['id'] || row['VariantID'] || `var_imported_${Date.now()}_${idx}`).trim(),
            productId: String(row['Product ID'] || row['productId'] || row['product_id'] || row['ProductID'] || '').trim(),
            size: String(row['Size'] || row['size'] || 'Free Size').trim(),
            colorName: String(row['Color Name'] || row['colorName'] || row['color_name'] || 'Default').trim(),
            color: String(row['Color Hex'] || row['color'] || row['color_hex'] || '#9ca3af').trim(),
            barcode: String(row['Barcode'] || row['barcode'] || `B${Date.now()}_${idx}`).trim(),
            sku: String(row['SKU'] || row['sku'] || `SKU-${Date.now()}-${idx}`).trim(),
            currentStock: Number(row['Current Stock'] ?? row['currentStock'] ?? row['stock'] ?? row['Stock'] ?? 0),
            minimumStockAlert: Number(row['Min Alert Level'] ?? row['minimumStockAlert'] ?? row['alert_level'] ?? row['Minimum Stock Alert'] ?? 5),
            purchasePrice: Number(row['Purchase Cost'] ?? row['purchasePrice'] ?? row['purchase_price'] ?? row['Purchase Price'] ?? 10),
            sellingPrice: Number(row['Selling Price MSRP'] ?? row['sellingPrice'] ?? row['selling_price'] ?? row['Selling Price'] ?? 25),
            supplierId: String(row['Supplier ID'] || row['supplierId'] || 'sup1').trim(),
            storageLocation: String(row['Storage Location'] || row['storageLocation'] || 'Aisle 1').trim()
          }));
        } else {
          products = rawData.map((row, idx) => ({
            id: String(row['Product ID'] || row['id'] || row['ProductID'] || `prod_imported_${Date.now()}_${idx}`).trim(),
            name: String(row['Name'] || row['name'] || 'Unnamed Product').trim(),
            description: String(row['Description'] || row['description'] || `${row['Name'] || 'Unnamed Product'} imported via local excel catalog.`).trim(),
            category: String(row['Category'] || row['category'] || 'Apparel').trim(),
            brand: String(row['Brand'] || row['brand'] || 'Nørse Thread').trim(),
            gender: (row['Gender'] || row['gender'] || 'Unisex') as any,
            material: String(row['Material'] || row['material'] || 'Cotton Blend').trim(),
            season: String(row['Season'] || row['season'] || 'General 2026').trim(),
            image: String(row['Image'] || row['image'] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600').trim(),
            createdAt: String(row['Created At'] || row['created_at'] || row['createdAt'] || new Date().toISOString())
          }));
        }
      }
    }

    return {
      products,
      variants,
      sheetNames: workbook.SheetNames
    };
  } catch (error) {
    console.error('Error parsing excel workbook data:', error);
    throw error;
  }
}

/**
 * Creates templates to allow immediate upload testing of empty or customized data structures.
 */
export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const productCols = [{
    'Product ID': 'prod1',
    'Name': 'Example Wool Jacket',
    'Category': 'Jackets',
    'Brand': 'Nørse Thread',
    'Gender': 'Unisex',
    'Material': '100% Wool',
    'Season': 'Winter 2026',
    'Created At': new Date().toISOString()
  }];
  const wsProducts = XLSX.utils.json_to_sheet(productCols);
  XLSX.utils.book_append_sheet(wb, wsProducts, 'Products Catalog');

  const variantCols = [{
    'Variant ID': 'var1_1',
    'Product ID': 'prod1',
    'Size': 'M',
    'Color Name': 'Oatmeal Tweed',
    'Color Hex': '#eae5d9',
    'Barcode': '88801234',
    'SKU': 'NT-EWJ-OT-M',
    'Current Stock': 15,
    'Min Alert Level': 5,
    'Purchase Cost': 45.00,
    'Selling Price MSRP': 99.00,
    'Storage Location': 'Aisle 2, Bin C-1'
  }];
  const wsVariants = XLSX.utils.json_to_sheet(variantCols);
  XLSX.utils.book_append_sheet(wb, wsVariants, 'Variants Inventory');

  XLSX.writeFile(wb, 'Norse_Thread_Upload_Template.xlsx');
}
