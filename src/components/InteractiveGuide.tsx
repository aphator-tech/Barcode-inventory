/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Barcode, 
  Laptop, 
  Camera, 
  Database, 
  Sparkles, 
  Play, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  FileSpreadsheet, 
  Cpu, 
  Wrench, 
  ChevronDown, 
  ChevronUp,
  ShoppingCart,
  LayoutDashboard,
  Coins,
  History,
  FileText
} from 'lucide-react';

interface InteractiveGuideProps {
  onClose: () => void;
  darkMode: boolean;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ onClose, darkMode }) => {
  const [guideSubTab, setGuideSubTab] = useState<'walkthrough' | 'add_and_details' | 'how_it_deducts' | 'bulk_add' | 'how_it_works'>('walkthrough');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('w1');

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className={`rounded-3xl border p-6 text-left transition-all ${
      darkMode 
        ? 'bg-slate-900/95 border-slate-800 shadow-2xl shadow-black/50 text-slate-100' 
        : 'bg-white border-slate-200 shadow-xl shadow-slate-250/45 text-slate-900'
    }`}>
      {/* MANUAL BANNER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600 rounded-xl text-white">
            <BookOpen className="w-5 h-5 stroke-2" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Nørse Thread Retail & Logistics Manual
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Complete Reference Guide & Operations Documentation — 100% Fully Working & Non-Simulated
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer border border-slate-250 dark:border-slate-700"
        >
          Dismiss Manual
        </button>
      </div>

      {/* MANUAL NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1.5 mt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setGuideSubTab('walkthrough')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'walkthrough'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Quick-Start Recipes
        </button>
        <button
          onClick={() => setGuideSubTab('how_it_works')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'how_it_works'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          1. How the System Works
        </button>
        <button
          onClick={() => setGuideSubTab('add_and_details')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'add_and_details'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          2. Adding Products & Details
        </button>
        <button
          onClick={() => setGuideSubTab('how_it_deducts')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'how_it_deducts'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          3. How Stock is Deducted
        </button>
        <button
          onClick={() => setGuideSubTab('bulk_add')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'bulk_add'
              ? 'bg-teal-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          4. Bulk Create & Matrix Joins
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="pt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 text-left">
        
        {/* SUBTAB 1: WALKTHROUGH SCENARIOS */}
        {guideSubTab === 'walkthrough' && (
          <div className="space-y-4">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2 font-medium">
              We've mapped out standard real-world retail workflows. Click any scenario below to view step-by-step instructions.
            </p>

            {/* Scenario 1 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w1' ? 'border-teal-400 bg-teal-500/5' : 'border-slate-200 dark:border-slate-800'
            }`} onClick={() => toggleAccordion('w1')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">1</span>
                  Scenario: Ringing up a walk-in purchase at the POS Terminal
                </span>
                {activeAccordion === 'w1' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {activeAccordion === 'w1' && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">How to execute:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>Go to the <strong>Sales POS Terminal</strong> tab.</li>
                    <li>
                      <strong>Add Items:</strong> Use the search filter to locate products or copy/paste a barcode (e.g. <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-slate-700">890415010</code>) directly into the keyboard wedge scanner.
                    </li>
                    <li>The matching variant immediately appends to the shopping cart.</li>
                    <li>Adjust counts using the <code className="font-bold px-1">+ / -</code> controls. You can also specify line-item discounts (e.g., promotional sales codes).</li>
                    <li>Adjust additional taxes or apply flat markdown discounts ($) in the calculations panel on the fast right.</li>
                    <li>Choose a payment method: <strong>Credit Card, Cash, Mobile Pay, or Store Credit</strong>.</li>
                    <li>Click <strong>Process Sales Checkout 🚀</strong>. The stock is immediately deducted in the ledger and a transaction receipt is generated.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Scenario 2 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w2' ? 'border-teal-400 bg-teal-500/5' : 'border-slate-200 dark:border-slate-800'
            }`} onClick={() => toggleAccordion('w2')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">2</span>
                  Scenario: Replenishing physical inventory or restocking shelves
                </span>
                {activeAccordion === 'w2' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {activeAccordion === 'w2' && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">How to execute:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>Navigate to the <strong>Laser Scanner HUD</strong>.</li>
                    <li>Scan the tag barcode using a physical wedge gun or type it into the <strong>Laser Manual Entry</strong> console.</li>
                    <li>Once identified, the active inventory levels appear in the right-side control pane.</li>
                    <li>Enter the replenishment counts (e.g., <code className="font-bold">50</code> units) in the adjustment field.</li>
                    <li>Choose <strong>Restock Shipment</strong> as the logged action category and click <strong>Execute Stock Adjustment</strong>.</li>
                    <li>The variant quantity is updated immediately. Changes propagate instantly to local disks, cloud servers, and Google Sheets.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Scenario 3 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w3' ? 'border-teal-400 bg-teal-500/5' : 'border-slate-200 dark:border-slate-800'
            }`} onClick={() => toggleAccordion('w3')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">3</span>
                  Scenario: Auditing damaged clothing shrinkages or customer product returns
                </span>
                {activeAccordion === 'w3' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>

              {activeAccordion === 'w3' && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">How to execute:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>Find the product in the <strong>Product Ledger</strong> or search its tag in the <strong>Laser Scanner HUD</strong>.</li>
                    <li>Specify the audit quantity.</li>
                    <li>Choose <strong>Damaged Leakage / Write-Off</strong> or <strong>Customer Returns (+ In)</strong> as the action category.</li>
                    <li>Commit the adjustment. A transaction ledger log is instantly initialized, allowing for reliable history tracing.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: HOW THE SYSTEM WORKS (ARCHITECTURE & FLOWS) */}
        {guideSubTab === 'how_it_works' && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1.5 uppercase font-sans">
              <Database className="w-4 h-4 text-teal-500" />
              1. The Fully Working Architecture & Live Data Flows
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              Nørse Thread uses a secure, real-time reactive state architecture that guarantees zero artificial simulation. All state operations maintain a high-integrity connection with client storage, local cache state, and real-time backend structures.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Local Cache Engine</span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Every product, supplier, transaction log, and design variant is persisted immediately within browser slot partitions using <code>localStorage</code>. Disconnecting from power or cellular wire will never compromise system memory.
                </p>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Unified React Store Hook</span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  A high-intelligence centralized state coordinator in <code>src/store.ts</code> manages active transactions, processes barcode validations, updates catalog ledgers, and fires hardware wedge audio alerts.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Google Sheets Sync Pipeline</span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Features a secure OAuth pipeline. Connecting a Google Account automatically provisions an active spreadsheets workbook inside Drive. Data writes are instantly synchronized over official Google Sheets API endpoints!
                </p>
              </div>
            </div>

            <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 rounded-2xl space-y-2">
              <h5 className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 uppercase text-[10px]">
                <Cpu className="w-3.5 h-3.5" />
                Live Barcode Interface Wedge Listener
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                To accommodate desktop laser guns (Honeywell, Symcode, Zebra), a global listener listens for exceptionally rapid key entry events on the browser document window. When character keystroke interval speeds drop below <code className="font-bold">45ms</code>, keyboard inputs bypass traditional cursor focus and immediately map to barcode scanner events, adding matches to active POS carts natively.
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 3: ADDING PRODUCTS & DETAILS */}
        {guideSubTab === 'add_and_details' && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1.5 uppercase font-sans">
              <Barcode className="w-4 h-4 text-teal-500" />
              2. Manual Creation & Detailed Metadata Mapping
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              Creating a product is a real database commit. A single design model consists of a base metadata card joined with multiple color and size variants.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-3.5 transition-all">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider block">How to Create and Map Product Details</span>
              <ul className="list-disc pl-5 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <li>
                  Go to the <strong>Product Ledger</strong> tab, click <strong>Create New Product Matrix</strong>.
                </li>
                <li>
                  <strong>Enter Base Metadata:</strong> Fill in the clothing title name, collection brand, fabric composition material (e.g., selvage wool blend), taxonomy catalog category, production season, and image URL. These details will be accessible on all invoices and inventory reports.
                </li>
                <li>
                  <strong>Define Product Attributes Vector:</strong> Type size codes (e.g., L, O/S) and color codes (including hex values like <code>#f43f5e</code> or name tags) and click **Add Color** / **Add Size**.
                </li>
                <li>
                  <strong>Assign Unit Economics:</strong> Specify the wholesale purchase cost, the MSRP customer selling price, the alert warning minimum stocks, and assign the warehouse location (e.g., "Aisle B, Box 40").
                </li>
                <li>
                  Click <strong>Generate Cartesian Variants Matrix 🚀</strong>. Norse Thread automatically generates unique barcodes and SKU codes for every permutation. They are saved directly to your local database!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* SUBTAB 4: HOW STOCK IS DEDUCTED */}
        {guideSubTab === 'how_it_deducts' && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1.5 uppercase font-sans">
              <ShoppingCart className="w-4 h-4 text-teal-500" />
              3. The Logic Behind Instant Inventory Stock Deduction
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              All inventory stock deductions are fully automated and live. The system enforces strict arithmetic checks to prevent overselling while generating audit-ready transaction records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs block flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  Instant Live POS Deduction
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  When a checkout completes at the Sales POS Terminal (or manual audits reduce stock), the matching variant quantity is immediately decremented in local state and `localStorage`.
                </p>
                <div className="bg-slate-100 dark:bg-black p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                  Variant.currentStock = Math.max(0, currentStock - QuantityPurchased)
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider text-xs block flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  History Logging & Real Undo Mechanics
                </span>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Every deduction initializes a new entry in the Transaction history log, complete with detailed metrics (subtotal, taxes, campaign discounts, date, and payment status). 
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
                  Clicking "Undo Log" on any transaction reverses the action instantly, adding the exact quantities back to active physical inventory!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: BULK CREATE & CSV IMPORT MATRIX JOINS */}
        {guideSubTab === 'bulk_add' && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-teal-700 dark:text-teal-400 flex items-center gap-1.5 uppercase font-sans">
              <FileSpreadsheet className="w-4 h-4 text-teal-500" />
              4. High-Throughput Bulk Import & Attributes Matrix Merges
            </h4>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Manually typing size and color variants for hundreds of products is tedious. Norse Thread provides two robust solutions to handle bulk inventory setup.
            </p>

            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl space-y-2">
              <span className="font-black text-xs text-indigo-650 dark:text-indigo-400 uppercase tracking-wider block">Bulk Method A: Cartesian Attribute Permutations</span>
              <p className="text-[11px]">
                Create a single base product (e.g. "Merino Track Jacket"), and input your size list (<code className="border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 px-1 font-mono font-bold">S, M, L, XL</code>) and color list (<code className="border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 px-1 font-mono font-bold">Charcoal Blue, Off-White</code>). 
                The Cartesian Matrix Creator automatically compiles and registers all eight permutations instantly!
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider block">Bulk Method B: Standardized Spreadsheet CSV Upload</span>
              <p className="text-[11px] leading-normal text-slate-500 dark:text-slate-400">
                Paste raw spreadsheet records or drop a CSV file containing the following columnar index layout to import catalogs immediately:
              </p>
              
              <table className="min-w-full text-[10px] font-mono border border-slate-200 dark:border-slate-800/80 text-left divide-y divide-slate-250 dark:divide-slate-850">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                  <tr>
                    <th className="p-2 border border-slate-250 dark:border-slate-800">Column Index</th>
                    <th className="p-2 border border-slate-250 dark:border-slate-800">Field Label</th>
                    <th className="p-2 border border-slate-250 dark:border-slate-800">Expected Type Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-400">
                  <tr>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">0 · 1 · 2</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">Product Name · Category · Brand</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800 font-mono text-zinc-500">"Alpine Ribbed Knit" · Sweaters & Knitwear · Nørse Thread</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">3 · 4 · 5</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">Size · Color Name · Color Hex</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800 font-mono text-zinc-500">M · Oatmeal Cream · #f5f5f4</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">6 · 7</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">Barcode · SKU Code</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800 font-mono text-zinc-500">890415011 · HP-ACC-OC-M</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">8 · 9</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">Stock Count · Alert Threshold</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800 font-mono text-zinc-500">24 · 5</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">10 · 11</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800">Purchase Cost · Retail MSRP Price</td>
                    <td className="p-2 border border-slate-250 dark:border-slate-800 font-mono text-zinc-500">40.00 · 98.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
