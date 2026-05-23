/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), 'db_store.json');

// Default backup mock database so it initializes smoothly
const INITIAL_SUPPLIERS = [
  { id: 'sup1', name: 'Elite Apparel Manufacturing', contactName: 'Sarah Jenkins', email: 's.jenkins@eliteapparel.com', phone: '+1 (555) 382-9102', address: 'Building 14, garment District, New York, NY' },
  { id: 'sup2', name: 'Zenith Textiles & Weaving', contactName: 'Kenji Sato', email: 'orders@zenithtextiles.jp', phone: '+81 3-5555-0143', address: '2-11 Shibakoen, Minato-ku, Tokyo, Japan' },
  { id: 'sup3', name: 'Patagonia Eco-Weaves Group', contactName: 'Mateo Ross', email: 'm.ross@ecoweave.cl', phone: '+56 2 2555 8192', address: 'Av. Libertador 4830, Santiago, Chile' }
];

const INITIAL_PRODUCTS = [
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
  }
];

const INITIAL_VARIANTS = [
  { id: 'var1_1', productId: 'prod1', size: 'S', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019011', sku: 'NT-NWS-CO-S', currentStock: 18, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-3' },
  { id: 'var1_2', productId: 'prod1', size: 'M', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019012', sku: 'NT-NWS-CO-M', currentStock: 22, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-3' },
  { id: 'var1_3', productId: 'prod1', size: 'L', color: '#eae5d9', colorName: 'Chalk Oatmeal', barcode: '1019013', sku: 'NT-NWS-CO-L', currentStock: 4, minimumStockAlert: 5, purchasePrice: 42.00, sellingPrice: 95.00, supplierId: 'sup2', storageLocation: 'Aisle 2, Bin A-4' },
  { id: 'var2_1', productId: 'prod2', size: 'M', color: '#3c352a', colorName: 'Raw Umber', barcode: '2023012', sku: 'MS-CCC-RU-M', currentStock: 25, minimumStockAlert: 8, purchasePrice: 20.00, sellingPrice: 59.00, supplierId: 'sup1', storageLocation: 'Aisle 1, Bin D-12' },
  { id: 'var3_1', productId: 'prod3', size: 'S', color: '#fcf8f2', colorName: 'Natural Eggshell', barcode: '3045011', sku: 'ZW-MBT-NE-S', currentStock: 40, minimumStockAlert: 10, purchasePrice: 11.50, sellingPrice: 32.00, supplierId: 'sup3', storageLocation: 'Aisle 3, Shelf A' }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tr_10928',
    timestamp: '2026-05-22T09:40:00Z',
    type: 'SALE',
    items: [
      { variantId: 'var1_2', productName: 'Nordic Heritage Wool Sweater', variantDetails: 'M / Chalk Oatmeal', quantity: 1, unitPrice: 95.00, totalPrice: 95.00 }
    ],
    discount: 0,
    tax: 7.60,
    subtotal: 95.00,
    grandTotal: 102.60,
    paymentMethod: 'Card',
    scannedCode: '1019012',
    notes: 'Standard sale item'
  }
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // API - Get server-side stock store data
  app.get('/api/db/load', (req, res) => {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return res.json(parsed);
      } else {
        // Initialize with core seeds
        const defaultState = {
          products: INITIAL_PRODUCTS,
          variants: INITIAL_VARIANTS,
          suppliers: INITIAL_SUPPLIERS,
          transactions: INITIAL_TRANSACTIONS,
          scanLogs: []
        };
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultState, null, 2));
        return res.json(defaultState);
      }
    } catch (err: any) {
      console.error('Failed to load DB file:', err);
      res.status(500).json({ error: 'Failed to access database', details: err.message });
    }
  });

  // API - Set server-side stock store data
  app.post('/api/db/save', (req, res) => {
    try {
      const dataToSave = req.body;
      if (!dataToSave || typeof dataToSave !== 'object') {
        return res.status(400).json({ error: 'Invalid database payload' });
      }

      // Check essential schemas to avoid writing zero corruption
      if (!Array.isArray(dataToSave.products) || !Array.isArray(dataToSave.variants)) {
        return res.status(400).json({ error: 'Database body is missing products list or variants list structure' });
      }

      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2));
      return res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error('Failed to save DB file:', err);
      res.status(500).json({ error: 'Failed to save database state to disk', details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ONLINE SERVER RUNNING] - Listening on http://localhost:${PORT}`);
  });
}

startServer();
