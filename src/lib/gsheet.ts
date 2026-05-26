/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Variant, Transaction } from '../types';

export interface GSheetConnectionState {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  isSyncing: boolean;
  lastSynced: string | null;
  error: string | null;
  liveSyncEnabled: boolean;
}

// Unified helper to route Google API calls through a local server-side proxy when running
// in development/Cloud Run to prevent CORS preflight blocks in nested sandboxed/iframe previews.
async function googleFetch(url: string, options: any = {}): Promise<Response> {
  const isLocalOrCloudRun = typeof window !== 'undefined' && (
    window.location.hostname.includes('localhost') || 
    window.location.hostname.includes('.run.app')
  );

  if (isLocalOrCloudRun) {
    try {
      const proxyUrl = `/api/google-proxy?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': options.headers?.['Authorization'] || options.headers?.['authorization'] || ''
        },
        body: options.body
      });
      
      if (proxyResponse.status !== 404) {
        return proxyResponse;
      }
    } catch (e) {
      console.warn('Google Sheets API Proxy unavailable, falling back to direct fetch:', e);
    }
  }

  return fetch(url, options);
}

// Helper to look up a spreadsheet by name in Google Drive
export async function findNorseThreadSpreadsheet(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent("name = 'Norse Thread Boutique Inventory & Logistics Control' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
  
  try {
    const res = await googleFetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Google Drive access error (${res.status})`);
    }
    
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (err) {
    console.error('findNorseThreadSpreadsheet failed:', err);
    throw err;
  }
}

// Helper to create a new spreadsheet and initialize the 3 custom styled sheets
export async function createNorseThreadSpreadsheet(accessToken: string): Promise<string> {
  const url = 'https://www.googleapis.com/sheets/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Norse Thread Boutique Inventory & Logistics Control'
    },
    sheets: [
      { properties: { title: 'Products Catalog', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Variants Inventory', gridProperties: { frozenRowCount: 1 } } },
      { properties: { title: 'Transaction History', gridProperties: { frozenRowCount: 1 } } }
    ]
  };

  try {
    const res = await googleFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Failed to create Google Sheet (${res.status})`);
    }

    const data = await res.json();
    return data.spreadsheetId;
  } catch (err) {
    console.error('createNorseThreadSpreadsheet failed:', err);
    throw err;
  }
}

// Push all state to Google Sheets (clearing existing records and writing current sets)
export async function pushDataToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  products: Product[],
  variants: Variant[],
  transactions: Transaction[]
): Promise<void> {
  const cleanAndWrite = async (sheetName: string, headers: string[], rows: any[][]) => {
    // 1. Clear the sheet first
    const clearUrl = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z1000:clear`;
    await googleFetch(clearUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // 2. Write new headers + values
    const writeUrl = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`;
    const body = {
      range: `${sheetName}!A1`,
      majorDimension: 'ROWS',
      values: [headers, ...rows]
    };

    const writeRes = await googleFetch(writeUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!writeRes.ok) {
      const err = await writeRes.json().catch(() => ({}));
      throw new Error(`Failed writing to ${sheetName}: ${err.error?.message || writeRes.statusText}`);
    }
  };

  try {
    // A. Format Products
    const productHeaders = ['Product ID', 'Name', 'Category', 'Brand', 'Gender', 'Material', 'Season', 'Created At'];
    const productRows = products.map(p => [
      p.id,
      p.name,
      p.category,
      p.brand,
      p.gender,
      p.material,
      p.season,
      p.createdAt
    ]);

    // B. Format Variants
    const variantHeaders = [
      'Variant ID', 'Product ID', 'Size', 'Color Name', 'Color Hex', 
      'Barcode', 'SKU', 'Current Stock', 'Min Alert Level', 
      'Purchase Cost', 'Selling Price MSRP', 'Storage Location'
    ];
    const variantRows = variants.map(v => [
      v.id,
      v.productId,
      v.size,
      v.colorName,
      v.color,
      v.barcode,
      v.sku,
      v.currentStock,
      v.minimumStockAlert,
      v.purchasePrice,
      v.sellingPrice,
      v.storageLocation
    ]);

    // C. Format Transactions
    const transactionHeaders = [
      'Timestamp', 'Transaction ID', 'Type', 'Subtotal', 'Discount', 
      'Tax', 'Grand Total', 'Payment Method', 'Items Summary', 'Notes'
    ];
    const transactionRows = transactions.map(t => {
      const itemsText = t.items.map(item => `${item.productName} (${item.variantDetails}) x${item.quantity}`).join('; ');
      return [
        t.timestamp,
        t.id,
        t.type,
        t.subtotal,
        t.discount,
        t.tax,
        t.grandTotal,
        t.paymentMethod || 'N/A',
        itemsText,
        t.notes || ''
      ];
    });

    // Run sheet updates
    await cleanAndWrite('Products Catalog', productHeaders, productRows);
    await cleanAndWrite('Variants Inventory', variantHeaders, variantRows);
    await cleanAndWrite('Transaction History', transactionHeaders, transactionRows);

    // Apply premium styling (teal header backgrounds, bold text, clean grid filters) via batchUpdate
    const styleUrl = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const styleBody = {
      requests: [
        // Style Product Catalog Header (Teal green block)
        {
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.05, green: 0.45, blue: 0.45 },
                textFormat: { bold: true, fontSize: 10, color: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
          }
        },
        // Style Variants Row Style
        {
          repeatCell: {
            range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 12 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.05, green: 0.45, blue: 0.45 },
                textFormat: { bold: true, fontSize: 10, color: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
          }
        },
        // Style Transactions Headers
        {
          repeatCell: {
            range: { sheetId: 2, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.05, green: 0.45, blue: 0.45 },
                textFormat: { bold: true, fontSize: 10, color: { red: 1, green: 1, blue: 1 } },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
          }
        }
      ]
    };

    // Attempt styling requests silently or log blockages (we won't crash if styling has non-matching sheet indices)
    await googleFetch(styleUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(styleBody)
    }).catch(err => console.warn('Spreadsheet formatting request failed (harmless):', err));

  } catch (err) {
    console.error('pushDataToGoogleSheets failed:', err);
    throw err;
  }
}

// Pull products & variants data from Google Sheets to merge locally/on server
export async function pullDataFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  existingSuppliers: any[]
): Promise<{ products: Product[]; variants: Variant[] }> {
  const getValues = async (sheetName: string, range: string): Promise<any[][]> => {
    const url = `https://www.googleapis.com/sheets/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!${range}`;
    const res = await googleFetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      throw new Error(`Failed to load data for ${sheetName} ranges.`);
    }

    const data = await res.json();
    return data.values || [];
  };

  try {
    const productValues = await getValues('Products Catalog', 'A2:H1000');
    const variantValues = await getValues('Variants Inventory', 'A2:L2000');

    // Parse products
    const parsedProducts: Product[] = productValues.map(row => ({
      id: row[0] || `prod_${Date.now()}_sheet`,
      name: row[1] || 'Unknown Import Product',
      description: `${row[1] || 'Unknown Import Product'} - Premium addition from Norse Thread collection.`,
      category: row[2] || 'Clothes',
      brand: row[3] || 'Co Brand',
      gender: (row[4] as any) || 'Unisex',
      material: row[5] || 'Cotton',
      season: row[6] || 'All-Season',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600',
      createdAt: row[7] || new Date().toISOString()
    }));

    // Parse variants
    const parsedVariants: Variant[] = variantValues.map((row, index) => ({
      id: row[0] || `var_${Date.now()}_${index}`,
      productId: row[1] || '',
      size: row[2] || 'M',
      colorName: row[3] || 'Black',
      color: row[4] || '#000000',
      barcode: row[5] || `B${Date.now()}_${index}`,
      sku: row[6] || `SKU_${index}`,
      currentStock: isNaN(parseInt(row[7])) ? 0 : parseInt(row[7]),
      minimumStockAlert: isNaN(parseInt(row[8])) ? 5 : parseInt(row[8]),
      purchasePrice: isNaN(parseFloat(row[9])) ? 10 : parseFloat(row[9]),
      sellingPrice: isNaN(parseFloat(row[10])) ? 25 : parseFloat(row[10]),
      supplierId: existingSuppliers[0]?.id || 'sup1',
      storageLocation: row[11] || 'Aisle 1'
    }));

    return {
      products: parsedProducts.filter(p => p.id && p.name),
      variants: parsedVariants.filter(v => v.productId && v.barcode)
    };
  } catch (err) {
    console.error('pullDataFromGoogleSheets failed:', err);
    throw err;
  }
}
