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
  LayoutDashboard
} from 'lucide-react';

interface InteractiveGuideProps {
  onClose: () => void;
  darkMode: boolean;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ onClose, darkMode }) => {
  const [guideSubTab, setGuideSubTab] = useState<'walkthrough' | 'hardware' | 'camera' | 'excel' | 'db'>('walkthrough');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('w1');

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  return (
    <div className={`rounded-3xl border p-6 text-left transition-all ${
      darkMode 
        ? 'bg-slate-900/90 border-slate-800/80 shadow-2xl shadow-slate-950/50' 
        : 'bg-white/95 border-gray-150/90 shadow-xl shadow-slate-200/40'
    }`}>
      {/* MANUAL BANNER HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-600 rounded-xl text-white">
            <BookOpen className="w-5 h-5 stroke-2" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Interactive System Manual & Reference Guide
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">Step-By-Step Workflow Documentation & Hardware Interfacing Schematics</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 text-xs font-bold text-gray-500 hover:text-gray-950 dark:hover:text-white rounded-lg transition-all cursor-pointer border border-gray-200/50 dark:border-gray-700"
        >
          Dismiss Manual
        </button>
      </div>

      {/* MANUAL NAVIGATION TABS */}
      <div className="flex flex-wrap gap-1.5 mt-4 pb-3 border-b border-gray-50 dark:border-gray-850">
        <button
          onClick={() => setGuideSubTab('walkthrough')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'walkthrough'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Quick-Start Walkthroughs
        </button>
        <button
          onClick={() => setGuideSubTab('hardware')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'hardware'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 hover:text-gray-900'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          Hardware Wedge Guides
        </button>
        <button
          onClick={() => setGuideSubTab('camera')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'camera'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 hover:text-gray-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Camera Barcode HUD
        </button>
        <button
          onClick={() => setGuideSubTab('excel')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'excel'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          CSV Import & Matrix
        </button>
        <button
          onClick={() => setGuideSubTab('db')}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            guideSubTab === 'db'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-500 hover:text-gray-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Offline Safety & Storage
        </button>
      </div>

      {/* CONTENT DECISION */}
      <div className="pt-4 text-xs leading-relaxed text-gray-500 text-left">
        
        {/* SUBTAB 1: QUICK-START WALKTHROUGHS */}
        {guideSubTab === 'walkthrough' && (
          <div className="space-y-4">
            <p className="text-[11px] text-gray-400 block mb-2 font-medium">
              We've prepared interactive, real-world case scenarios as walk-through recipes. Click any header below to reveal the protocol.
            </p>

            {/* Recipe 1 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w1' ? 'border-teal-300 dark:border-teal-900 bg-teal-50/10' : 'border-gray-100 dark:border-gray-800'
            }`} onClick={() => toggleAccordion('w1')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">1</span>
                  Workflow: Ringing up a customers walk-in purchase
                </span>
                {activeAccordion === 'w1' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {activeAccordion === 'w1' && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-150 dark:border-gray-800 space-y-2 text-[11px]">
                  <p>Follow this standard operational sequence for rapid retail POS processing:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Navigate to the <strong>Sales POS Terminal</strong> tab.</li>
                    <li>
                      <strong>Scan Barcodes:</strong> Laser scan real barcodes or type codes into the search filter to query.
                      <em className="text-gray-400 block text-[10px]">Tips: Try copying variant barcode tags like <strong className="font-mono bg-white dark:bg-gray-850 px-1 py-0.5 rounded border">918230981</strong> ("Nordic Heritage Wool Sweater - Warm Cream / S") and paste to trigger.</em>
                    </li>
                    <li>The item immediately is loaded into the live shopping cart array.</li>
                    <li>Adjust items count if they are buying pairs. You can also specify line-item percentage discounts (e.g. 10% off).</li>
                    <li>Add customer campaign discounts in the flat <strong>Campaign Discount ($)</strong> field on the right.</li>
                    <li>Select payment type: <strong>Credit Card, Cash In Hand, or Mobile UPI</strong>.</li>
                    <li>Press <strong>Process Sales Checkout 🚀</strong>. The stock is automatically deducted in the catalog ledger, and an official printable receipt log is generated.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Recipe 2 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w2' ? 'border-teal-300 dark:border-teal-900 bg-teal-50/10' : 'border-gray-100 dark:border-gray-800'
            }`} onClick={() => toggleAccordion('w2')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">2</span>
                  Workflow: Logging warehouse replenishment restock supplies
                </span>
                {activeAccordion === 'w2' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {activeAccordion === 'w2' && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-150 dark:border-gray-800 space-y-2 text-[11px]">
                  <p>When stock loads arrive at your loading dock, execute this log process:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Navigate to the <strong>Laser Scanner HUD</strong>.</li>
                    <li>Verify the active mode is set to **Manual Laser Wedge Entry** (or fire your physical laser gun).</li>
                    <li>Scan or key-in the barcode on the clothing tag and tap **Search Code**.</li>
                    <li>Once identified, details of the Garment are pulled onto the right panel.</li>
                    <li>In the **Stock Actions Panel**, input the restock quantities (e.g. 50 packs).</li>
                    <li>Select **Restock Shipment** from the action picker, then click **Execute Stock adjustment**.</li>
                    <li>The system updates the inventory levels inside local storage, logs a transaction receipt, and plays a positive sound effect.</li>
                  </ol>
                </div>
              )}
            </div>

            {/* Recipe 3 */}
            <div className={`border rounded-xl p-3 flex flex-col transition-all cursor-pointer ${
              activeAccordion === 'w3' ? 'border-teal-300 dark:border-teal-900 bg-teal-50/10' : 'border-gray-100 dark:border-gray-800'
            }`} onClick={() => toggleAccordion('w3')}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-400 text-[10px] flex items-center justify-center font-bold">3</span>
                  Workflow: Auditing damaged items or shrinkages
                </span>
                {activeAccordion === 'w3' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {activeAccordion === 'w3' && (
                <div className="mt-3 pt-3 border-t border-dashed border-gray-150 dark:border-gray-800 space-y-2 text-[11px]">
                  <p>For damaged customer items, display returns, or wet damage write-offs:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
                    <li>Lookup the barcode in the **Laser Scanner HUD** or find the garment row in **Product Ledger**.</li>
                    <li>Enter the affected units quantity. Note: this will subtract stock from your ledger.</li>
                    <li>Select **Damaged Leakage / Write-Off** as the category action.</li>
                    <li>Commit the adjustment. A transaction record is created with a specialized red tag indicator for future auditing.</li>
                    <li>You can undo any incorrect log adjusting entry by clicking the active **Undo Log** buttons located in the transaction stream on your main Dashboard.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: HARDWARE WEDGING GUIDELINES */}
        {guideSubTab === 'hardware' && (
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              USB / Bluetooth Keyboard Wedge Interception Protocol
            </h4>

            <p className="text-gray-600 dark:text-gray-400">
              Retail and warehouse personnel heavily rely on desktop laser guns (such as Zebra, Honeywell, or Symcode scanners). 
              Our system has a dedicated <strong>global hardware wedge interceptor</strong> that listens for rapid key entries on any active viewport.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-slate-50 dark:bg-gray-850/40 rounded-2xl space-y-2 border">
                <span className="font-bold text-gray-900 dark:text-white block">How it Intercepts Keystrokes</span>
                <p className="text-[11px] leading-relaxed">
                  Most hardware scanners are pre-programmed as standard keyboards. When a code is read, the gun types out the barcode characters dynamically and appends an <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">Enter</kbd> keystroke.
                </p>
                <div className="font-mono text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-white dark:bg-gray-905 p-2 rounded-lg border border-dashed">
                  Time Signature: Event.diff &lt; 45ms
                </div>
                <p className="text-[11px]">
                  If human users type "918230", the interval between keypresses is slow (&gt;100ms). But a hardware laser types the barcode characters in less than 35 milliseconds. Our signature filter listens globally, aggregates this raw stream, and parses it without requiring cursor focus!
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-gray-850/40 rounded-2xl space-y-2 border">
                <span className="font-bold text-teal-700 dark:text-teal-400 block">Configuration Steps</span>
                <ul className="list-disc pl-5 text-[11px] space-y-1.5">
                  <li>Plug in your USB wedge laser, or pair your Bluetooth scanner in keyboard protocol.</li>
                  <li>Open the <strong>Sales POS Terminal</strong> or <strong>Laser Scanner HUD</strong>.</li>
                  <li>Point your scanner at a clothing item barcode tag and press trigger.</li>
                  <li>The item will immediately chime and append to your checkout lists or transaction tables instantly! No cursor clicks required.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: CAMERA BARCODE HUD */}
        {guideSubTab === 'camera' && (
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              Built-in smartphone camera scanner parameters
            </h4>

            <p className="text-gray-600 dark:text-gray-400">
              When hardware scanners are unavailable, Norse Thread allows loading your devises’ camera, featuring a custom viewport targeting crosshair and chime chimers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-gray-850/40 rounded-2xl border space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Targeting crosshair HUD</span>
                <p className="text-[11px] leading-relaxed">
                  Provides a high-fidelity visual viewfinder box with target crosshairs, guiding warehouse staff to align long retail barcodes accurately.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-gray-850/40 rounded-2xl border space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Chime chimers audio</span>
                <p className="text-[11px] leading-relaxed">
                  Synthesizes immediate frequency bleeps upon validation. Quick click sounds, dual-tone success alerts, or low-frequency warnings keep hands-free staff confident.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-gray-850/40 rounded-2xl border space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Camera resolution specs</span>
                <p className="text-[11px] leading-relaxed">
                  Demands standard media permission channels. Ensure camera privacy channels are open inside your standard browser settings on mobile Chrome/Safari.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: CSV IMPORT & MATRIX CREATOR */}
        {guideSubTab === 'excel' && (
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              Advanced matrix variants generation & bulk parsing guidelines
            </h4>

            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Clothing lines are distinct due to multidimensional arrays of <strong>sizes</strong> and <strong>colors</strong>. Manual SKU inputs for 20 garments in 4 sizes and 3 colors require writing 240 tedious variants. 
              Our <strong>Matrix Creator</strong> completely automates this!
            </p>

            <div className="p-4 bg-sky-50 dark:bg-gray-900 border border-sky-100 rounded-2xl space-y-3">
              <span className="font-bold text-teal-800 dark:text-teal-300 block">How Variant Matrix Multiplication Works:</span>
              <p className="text-[11px]">
                Input sizes vector (<code className="border bg-white px-1 font-mono">S, M, L</code>) and colors vector (<code className="border bg-white px-1 font-mono">Jet Black, Heather Blue</code>).
                Norse Thread executes a Cartesian Cross-Join to generate 6 deterministic SKU variants!
              </p>
              <div className="font-mono text-[10px] grid grid-cols-3 gap-2 bg-white p-2 rounded-lg text-slate-700 border border-teal-100 text-center font-bold">
                <div>[S] x [Jet Black] = NC-SWE-JB-S</div>
                <div>[M] x [Jet Black] = NC-SWE-JB-M</div>
                <div>[L] x [Heather Blue] = NC-SWE-HB-L</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-gray-900 dark:text-white block text-[11px]">CSV Spreadsheet Upload Structure:</span>
              <p className="text-[11px] leading-normal text-gray-600 dark:text-gray-400">
                You can import your entire existing database using standard Excel CSV sheets. Ensure headers align in exact sequential sorting arrays:
              </p>
              <table className="min-w-full text-[10px] font-mono border text-left divide-y divide-gray-150">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="p-2 border">Column Index</th>
                    <th className="p-2 border">Field Label</th>
                    <th className="p-2 border">Expected Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-2 border">0 • 1 • 2</td>
                    <td className="p-2 border">Product Name • Category • Brand</td>
                    <td className="p-2 border">String quotes (e.g. "Cargo Pant")</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">3 • 4 • 5</td>
                    <td className="p-2 border">Size • Color Name • Color Hex</td>
                    <td className="p-2 border">S / XL • Rose Red • Hex #f43f5e</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">6 • 7</td>
                    <td className="p-2 border">Barcode • SKU Code</td>
                    <td className="p-2 border">Numerics (tag code) • alphanumeric stock code</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">8 • 9</td>
                    <td className="p-2 border">Stock Remaining • Min Alert Alarm</td>
                    <td className="p-2 border">Int digit counts per shelf</td>
                  </tr>
                  <tr>
                    <td className="p-2 border">10 • 11</td>
                    <td className="p-2 border">Purchase Cost • Selling Price MSRP</td>
                    <td className="p-2 border">Wholesale vendor costs • Customer pricing values</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 5: OFFLINE SAFETY */}
        {guideSubTab === 'db' && (
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              100% Offline Resilience & Local Database Engine
            </h4>

            <p className="text-gray-600 dark:text-gray-400">
              This inventory engine is built for internal warehouse security. It persists all logs, collections, variants, and suppliers <strong>fully client-authoritative in LocalStorage</strong>. 
              No slow network requests, no login sessions, no remote leaks.
            </p>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 block">Offline Resiliency Status</span>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                  All adjustments, sales transactions, checkouts, and custom matrices are saved immediately to local disk slots on your terminal browser. If you close the page or lose your internet wire, the database remains completely intact! You can download your data anytime as a flat CSV spreadsheet utilizing the <strong>Export Catalog</strong> button.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
