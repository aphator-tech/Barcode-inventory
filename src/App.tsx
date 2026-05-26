/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Barcode, 
  LayoutDashboard, 
  ShoppingCart, 
  Shirt, 
  Database, 
  Moon, 
  Sun, 
  HelpCircle,
  Truck,
  Sparkles,
  Info
} from 'lucide-react';
import { useInventoryState } from './store';
import { DashboardView } from './components/DashboardView';
import { ScannerWidget } from './components/ScannerWidget';
import { POSModule } from './components/POSModule';
import { ProductManagement } from './components/ProductManagement';
import { InteractiveGuide } from './components/InteractiveGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scanner' | 'pos' | 'products'>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showStatusHelp, setShowStatusHelp] = useState<boolean>(false);

  // Load state and operations from our unified store hook
  const {
    products,
    variants,
    suppliers,
    transactions,
    scanLogs,
    stats,
    serverStatus,
    excelStatus,
    manualRefresh,
    importLocalExcelCatalog,
    exportLocalExcelCatalog,
    downloadTemplate,
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
  } = useInventoryState();

  // Load user's theme selection on boot and maintain document element class List
  useEffect(() => {
    const cachedTheme = localStorage.getItem('barinv_darkmode');
    if (cachedTheme === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    localStorage.setItem('barinv_darkmode', String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Automated sync handler for other modules adding scans
  const handleScanInMainScanner = (barcode: string) => {
    return recordBarcodeScan(barcode);
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-all duration-200 ${
      darkMode ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-gray-950 to-black text-white' : 'bg-slate-50/60 text-slate-900'
    }`}>
      
      {/* GLOBAL BANNER HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all ${
        darkMode ? 'bg-gray-950/80 border-slate-800/80 shadow-md' : 'bg-white/80 border-gray-150 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* LEFT: TITLE & LOGOS */}
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-500/10">
              <Barcode className="w-5 h-5 stroke-[2.5]" />
              {/* Core orbit logo */}
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border border-teal-600 animate-pulse" />
            </div>
            
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight uppercase">
                  Nørse Thread Retail Engine
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 text-[9px] text-teal-700 dark:text-teal-400 font-extrabold uppercase rounded-md tracking-wider border border-teal-100 dark:border-teal-900/60">
                  LTS v3.2
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">Internal Barcode & Apparel Logistics Pipeline</p>
            </div>
          </div>

          {/* CENTRE-RIGHT: TAB NAVIGATION */}
          <nav className="hidden md:flex items-center space-x-1.5 p-1 bg-gray-100/60 dark:bg-gray-900/60 rounded-xl border border-gray-200/40 dark:border-gray-800/40">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? (darkMode ? 'bg-slate-800 text-teal-450 shadow-xs' : 'bg-white text-teal-700 shadow-md shadow-slate-100')
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? (darkMode ? 'bg-slate-800 text-teal-450 shadow-xs' : 'bg-white text-teal-700 shadow-md shadow-slate-100')
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              Laser Scanner HUD
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'pos'
                  ? (darkMode ? 'bg-slate-800 text-teal-450 shadow-xs' : 'bg-white text-teal-700 shadow-md shadow-slate-100')
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Sales POS Terminal
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'products'
                  ? (darkMode ? 'bg-slate-800 text-teal-450 shadow-xs' : 'bg-white text-teal-700 shadow-md shadow-slate-100')
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Product Ledger
            </button>
          </nav>

          {/* RIGHT-MOST: THEME SWITCHER & UTILITIES */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-yellow-400' : 'bg-white border-gray-150 text-gray-500 hover:text-teal-600'
              }`}
              title={darkMode ? 'Flip to bright styling' : 'Flip to low-strain twilight shading'}
            >
              {darkMode ? <Sun className="w-4 h-4 stroke-[2.5]" /> : <Moon className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <button
              onClick={() => setShowStatusHelp(!showStatusHelp)}
              className={`hidden sm:inline-flex p-2.5 rounded-xl border transition-all cursor-pointer ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-gray-150 text-gray-400 hover:text-teal-600'
              }`}
              title="Operational documentation & instructions"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE NAV BOTTOM CAROUSEL */}
      <div className={`md:hidden fixed bottom-0 inset-x-0 z-40 border-t p-2.5 flex items-center justify-around transition-all ${
        darkMode ? 'bg-gray-950/95 border-slate-850 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]'
      }`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-teal-600' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-4.5 h-4.5 mb-1" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'scanner' ? 'text-teal-600' : 'text-gray-400'
          }`}
        >
          <Barcode className="w-4.5 h-4.5 mb-1" />
          Scanner HUD
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'pos' ? 'text-teal-600' : 'text-gray-400'
          }`}
        >
          <ShoppingCart className="w-4.5 h-4.5 mb-1" />
          POS Cart
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-bold ${
            activeTab === 'products' ? 'text-teal-600' : 'text-gray-400'
          }`}
        >
          <Database className="w-4.5 h-4.5 mb-1" />
          Ledger
        </button>
      </div>

      {/* WORKSPACE CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-24 md:pb-12">
        
        {/* OPERATIONAL HELP CAROUSEL BANNER */}
        {showStatusHelp && (
          <div className="mb-6">
            <InteractiveGuide onClose={() => setShowStatusHelp(false)} darkMode={darkMode} />
          </div>
        )}

        {/* COMPONENT ROUTER DISPLAY */}
        <div className="transition-all duration-200">
          {activeTab === 'dashboard' && (
            <DashboardView
              id="view-dashboard"
              products={products}
              variants={variants}
              suppliers={suppliers}
              transactions={transactions}
              scanLogs={scanLogs}
              stats={stats}
              serverStatus={serverStatus}
              excelStatus={excelStatus}
              onImportExcel={importLocalExcelCatalog}
              onExportExcel={exportLocalExcelCatalog}
              onDownloadTemplate={downloadTemplate}
              manualRefresh={manualRefresh}
              onAdjustStock={adjustStockDirectly}
              onUndoTransaction={undoTransaction}
              onResetDatabase={resetDatabaseToDefaults}
            />
          )}

          {activeTab === 'scanner' && (
            <ScannerWidget
              id="view-scanner"
              variants={variants}
              products={products}
              onScan={handleScanInMainScanner}
              onAdjustStock={adjustStockDirectly}
              onAddToCart={(v, p) => {
                setActiveTab('pos');
                // Auto focus is handled in POS component mount
              }}
            />
          )}

          {activeTab === 'pos' && (
            <POSModule
              id="view-pos"
              products={products}
              variants={variants}
              onCheckout={executePOSCheckout}
            />
          )}

          {activeTab === 'products' && (
            <ProductManagement
              id="view-products"
              products={products}
              variants={variants}
              suppliers={suppliers}
              onAddProduct={addProduct}
              onUpdateProductMeta={updateProductMeta}
              onUpdateVariant={updateVariant}
              onDeleteProduct={deleteProductAndVariants}
              onImportCSV={importCatalogFromCSV}
            />
          )}
        </div>

      </main>

      {/* FOOTER SECTION */}
      <footer className={`py-6 border-t font-mono text-[10px] text-gray-400 dark:text-gray-600 transition-all ${
        darkMode ? 'bg-black border-slate-900' : 'bg-slate-50 border-gray-150'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>Enterprise Barcode Terminal system • 100% Client-Authoritative State</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
              Active DB: LocalStorage Sync
            </span>
            <span>Ref: 2026-05-23T11:46:26Z</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
