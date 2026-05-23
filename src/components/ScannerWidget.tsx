/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Barcode, 
  Camera, 
  Search, 
  Plus, 
  Minus, 
  Trash, 
  AlertTriangle, 
  Sparkles, 
  Volume2, 
  RotateCcw,
  Tag, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Product, Variant } from '../types';
import { BarcodeRenderer } from './BarcodeRenderer';

interface ScannerWidgetProps {
  id: string;
  variants: Variant[];
  products: Product[];
  onScan: (barcode: string) => { status: 'FOUND' | 'NOT_FOUND'; variant?: Variant; product?: Product };
  onAdjustStock: (variantId: string, diff: number, type: 'RESTOCK' | 'DAMAGED' | 'RETURN', note?: string) => void;
  onAddToCart?: (variant: Variant, product: Product) => void;
}

export const ScannerWidget: React.FC<ScannerWidgetProps> = ({
  id,
  variants,
  products,
  onScan,
  onAdjustStock,
  onAddToCart,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'laser' | 'camera' | 'wedge'>('laser');
  
  // Last Scan Results
  const [lastScanned, setLastScanned] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    code: string;
    variant?: Variant;
    product?: Product;
    timestamp?: string;
  }>({ status: 'IDLE', code: '' });

  // Camera stream variables
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Keyboard wedge event buffers
  const [wedgeModeActive, setWedgeModeActive] = useState(true);
  const [wedgeBuffer, setWedgeBuffer] = useState('');
  const [lastWedgeTimes, setLastWedgeTimes] = useState<number[]>([]);

  // Simulation parameters for testing
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // 1. Keyboard wedge interceptor (Simulating commercial hardware)
  useEffect(() => {
    if (!wedgeModeActive) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // Filter out key combinations, modify keys, or special bindings
      if (e.key.length !== 1 && e.key !== 'Enter') return;

      // Track times to identify speed of typing (real humans write < 10 chars/s, hardware wedge does > 100 chars/s)
      setLastWedgeTimes(prev => {
        const updated = [...prev, now].slice(-10);
        return updated;
      });

      if (e.key === 'Enter') {
        if (wedgeBuffer.trim().length > 2) {
          // Check typing speed for real USB input signature. 
          // If rapid, handle! Otherwise, if user has focused inputs, let standard React forms fire.
          executeScan(wedgeBuffer.trim(), 'USB / Bluetooth Hardware Laser');
        }
        setWedgeBuffer('');
      } else {
        setWedgeBuffer(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [wedgeModeActive, wedgeBuffer]);

  // Clean-up camera feed on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera permission block/not available:', err);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Perform actual stock operation
  const executeScan = (barcode: string, sourceLabel: string = 'Manual scan core') => {
    const res = onScan(barcode);
    
    if (res.status === 'FOUND' && res.variant && res.product) {
      setLastScanned({
        status: 'SUCCESS',
        code: barcode,
        variant: res.variant,
        product: res.product,
        timestamp: new Date().toLocaleTimeString()
      });
    } else {
      setLastScanned({
        status: 'ERROR',
        code: barcode,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    setManualCode('');
  };

  // Quick Action Handler
  const handleQuickAction = (type: 'RESTOCK' | 'DAMAGED' | 'RETURN', quantity: number) => {
    if (!lastScanned.variant) return;
    onAdjustStock(lastScanned.variant.id, quantity, type, `Quick action via scanner HUD console.`);
    
    // Update local snapshot stock display instantly
    setLastScanned(prev => {
      if (prev.variant) {
        return {
          ...prev,
          variant: {
            ...prev.variant,
            currentStock: Math.max(0, prev.variant.currentStock + quantity)
          }
        };
      }
      return prev;
    });
  };

  // Trigger simulated scan for sandbox evaluation
  const triggerSimulatedScan = () => {
    if (variants.length === 0) return;
    const randomIdx = Math.floor(Math.random() * variants.length);
    const v = variants[randomIdx];
    executeScan(v.barcode);
  };

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT MODULE - CONTROLS & FEEDS */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        
        {/* HEADER / WORKFLOW tabs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex space-x-1.5 p-1 bg-gray-50 dark:bg-gray-800/80 rounded-xl">
            <button
              onClick={() => { setActiveTab('laser'); stopCamera(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'laser' 
                  ? 'bg-white dark:bg-gray-900 shadow-xs text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              Direct Console
            </button>
            <button
              onClick={() => { setActiveTab('camera'); startCamera(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'camera' 
                  ? 'bg-white dark:bg-gray-900 shadow-xs text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera Viewport
            </button>
            <button
              onClick={() => { setActiveTab('wedge'); stopCamera(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'wedge' 
                  ? 'bg-white dark:bg-gray-900 shadow-xs text-teal-600 dark:text-teal-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Auto Capture
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
              {activeTab === 'laser' ? 'Laser Engine Ready' : activeTab === 'camera' ? 'Camera Decoder Active' : 'Wedge Listening'}
            </span>
          </div>
        </div>

        {/* SCREEN AREA */}
        <div className="relative bg-gray-950 dark:bg-black rounded-3xl overflow-hidden aspect-video border-4 border-gray-900 shadow-lg flex flex-col justify-between p-4 group">
          
          {/* TAB 1: Laser console & direct manual lookup */}
          {activeTab === 'laser' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-radial from-gray-900 to-gray-950">
              <div className="w-24 h-24 mb-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center animate-pulse">
                <Barcode className="w-10 h-10 text-teal-400 stroke-1" />
              </div>the
              
              <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type barcode or SKU tag..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && manualCode.trim() && executeScan(manualCode.trim(), 'Laser Manual Entry')}
                    className="w-full text-base font-mono py-3.5 pl-12 pr-12 bg-gray-950 border border-slate-800 text-teal-400 placeholder-slate-600 rounded-xl focus:outline-hidden focus:border-teal-500 text-center uppercase tracking-widest transition-all"
                  />
                  <Search className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                  {manualCode && (
                    <button 
                      onClick={() => setManualCode('')}
                      className="absolute right-4 top-4 hover:bg-slate-800 p-0.5 rounded text-slate-400"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  type="button"
                  disabled={!manualCode.trim()}
                  onClick={() => executeScan(manualCode, 'Console Manual Commit')}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Query Barcode Record
                </button>
              </div>

              {/* Decorative scan target line */}
              <div className="absolute w-full h-[2px] bg-red-500 top-1/2 left-0 shadow-[0_0_10px_#f87171] opacity-30 animate-bounce pointer-events-none" />
            </div>
          )}

          {/* TAB 2: Camera feedback and Live view */}
          {activeTab === 'camera' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black">
              {cameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 z-10">
                  <Camera className="w-12 h-12 text-slate-600 animate-pulse" />
                  <span className="text-xs text-slate-400 font-medium">Camera Feed Suspended</span>
                </div>
              )}

              {/* Industrial overlay target HUD */}
              <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-teal-500/40 rounded-xl pointer-events-none flex flex-col justify-between p-4 bg-teal-500/[0.02]">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-teal-400 rounded-tl" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-teal-400 rounded-tr" />
                </div>
                {/* Horizontal high-intensity red laser */}
                <div className="w-full h-[1px] bg-red-400 shadow-[0_0_8px_#f87171] animate-infinite" style={{ animationDuration: '4s' }} />
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-teal-400 rounded-bl" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-teal-400 rounded-br" />
                </div>
              </div>

              {/* Controls at camera window top */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-slate-800"
                >
                  {cameraActive ? 'Kill Camera Feed' : 'Launch Camera Feed'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Global Wedge details */}
          {activeTab === 'wedge' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-radial from-slate-900 to-black text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-400/20 flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-teal-400 animate-ping" />
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="text-sm font-semibold text-white">Full-Device Keystroke Wedging</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Connect any standard **USB or Bluetooth barcode gun** (Wedge Mode). When you scan a product, the script instantly intercepts the input from anywhere on this screen!
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 max-w-xs w-full text-left space-y-2">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Auto Listen Status:</span>
                  <button 
                    onClick={() => setWedgeModeActive(!wedgeModeActive)}
                    className={`font-semibold ${wedgeModeActive ? 'text-emerald-400' : 'text-rose-400 hover:underline'}`}
                  >
                    {wedgeModeActive ? 'ACTIVE (Capturing)' : 'MUTED (Manual Only)'}
                  </button>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Live Wedge Buffer:</span>
                  <span className="text-yellow-400 font-semibold tracking-wider font-mono">
                    {wedgeBuffer || '[No Data Received]'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM QUICK INSTRUCTIONS / FOOTER */}
          <div className="z-20 w-full flex justify-between items-center bg-black/60 backdrop-blur-xs p-2 rounded-xl text-[10px] text-gray-400 dark:text-gray-500">
            <span>Terminal: #AIS-AFL-2026</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Decoder ready</span>
            </div>
          </div>
        </div>

        {/* DEMO TOOL: TRIGGER DEMO WORKFLOW */}
        {showDemoBanner && (
          <div className="bg-slate-50 dark:bg-gray-800/45 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Simulated Scanner Gun Trigger
              </span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Don't have a physical barcode scanner handy? Push the demo trigger below to simulate firing a real laser gun!
              </p>
            </div>
            <button
              onClick={triggerSimulatedScan}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap self-start md:self-center"
            >
              Simulate Code Scan 💥
            </button>
          </div>
        )}
      </div>

      {/* RIGHT MODULE - INSTANT ACTION HUD DETECTOR */}
      <div className="lg:col-span-5">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col h-full justify-between space-y-6">
          
          {/* STATE: Idle / No Scan */}
          {lastScanned.status === 'IDLE' && (
            <div className="flex flex-col items-center justify-center text-center py-20 my-auto text-gray-400 dark:text-gray-500 space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                <Barcode className="w-6 h-6 text-gray-300 dark:text-gray-700" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Awaiting Scanner Input</p>
                <p className="text-xs max-w-xs text-gray-400 leading-normal">
                  Fire your USB scanner or click "Simulate Code Scan" above to fetch detailed clothing metrics instantly.
                </p>
              </div>
            </div>
          )}

          {/* STATE: Page/Barcode scan successfully resolved */}
          {lastScanned.status === 'SUCCESS' && lastScanned.variant && lastScanned.product && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* Header card resolved */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-100 dark:border-teal-900/40">
                      Product Scanned
                    </span>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug pt-1 truncate">
                      {lastScanned.product.name}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono block">
                      SKU: {lastScanned.variant.sku}
                    </span>
                  </div>
                  
                  {lastScanned.timestamp && (
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                      {lastScanned.timestamp}
                    </span>
                  )}
                </div>

                {/* Clothing Specific Layout Details Matrix */}
                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/40 text-left">
                    <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Attributes</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-0.5 block flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: lastScanned.variant.color }} />
                      {lastScanned.variant.colorName} • {lastScanned.variant.size}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/40 text-left animate-pulse">
                    <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Live Stock</span>
                    <span className={`text-sm font-bold mt-0.5 block ${
                      lastScanned.variant.currentStock <= lastScanned.variant.minimumStockAlert 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-teal-600 dark:text-teal-400'
                    }`}>
                      {lastScanned.variant.currentStock} Units available
                      {lastScanned.variant.currentStock <= lastScanned.variant.minimumStockAlert && ' (LOW)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-left">
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/40">
                    <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Brand / Material</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 block">
                      {lastScanned.product.brand} • {lastScanned.product.material}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/40">
                    <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Location / Rack</span>
                    <span className="text-xs font-semibold text-gray-751 dark:text-gray-300 mt-0.5 block truncate">
                      {lastScanned.variant.storageLocation || 'Unassigned Catalog Section'}
                    </span>
                  </div>
                </div>

                {/* Pricing section with massive tag display */}
                <div className="flex items-center justify-between px-4 py-3 bg-teal-50/20 dark:bg-teal-950/10 rounded-xl border border-teal-100/30">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">MSRP Selling Price</span>
                  <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    ${lastScanned.variant.sellingPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ACTION HUD DOCKS */}
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 text-left uppercase tracking-widest">Immediate Warehouse Actions</p>
                
                <div className="grid grid-cols-2 gap-3 pb-3">
                  <button
                    onClick={() => handleQuickAction('RESTOCK', 10)}
                    className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl font-semibold text-xs border border-gray-200/55 dark:border-gray-800 hover:border-teal-100 dark:hover:border-teal-900 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock (+10)
                  </button>
                  <button
                    onClick={() => handleQuickAction('RESTOCK', 1)}
                    className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl font-semibold text-xs border border-gray-200/55 dark:border-gray-800 hover:border-teal-100 dark:hover:border-teal-900 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Restock (+1)
                  </button>
                  <button
                    onClick={() => handleQuickAction('DAMAGED', -1)}
                    disabled={lastScanned.variant.currentStock < 1}
                    className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-semibold text-xs border border-gray-200/55 dark:border-gray-800 hover:border-rose-100 dark:hover:border-rose-900 transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Damaged (-1)
                  </button>
                  <button
                    onClick={() => handleQuickAction('RETURN', 1)}
                    className="flex items-center justify-center gap-1.5 py-3 px-3.5 bg-gray-50 dark:bg-gray-800/80 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-xl font-semibold text-xs border border-gray-200/55 dark:border-gray-800 hover:border-yellow-100 dark:hover:border-yellow-900 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return (+1)
                  </button>
                </div>

                {onAddToCart && (
                  <button
                    onClick={() => {
                      if (lastScanned.variant && lastScanned.product) {
                        onAddToCart(lastScanned.variant, lastScanned.product);
                      }
                    }}
                    disabled={lastScanned.variant.currentStock < 1}
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    Add Scan to checkout Counter / POS cart
                  </button>
                )}
              </div>

              {/* Dynamic printed barcode output */}
              <div className="pt-2">
                <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left uppercase tracking-widest mb-1.5">Print Tag Preview</span>
                <BarcodeRenderer value={lastScanned.code} showText={true} height={50} width={200} />
              </div>
            </div>
          )}

          {/* STATE: Scanned / barcode search returned error */}
          {lastScanned.status === 'ERROR' && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6 stroke-2" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Unrecognized Barcode Tag</h4>
                <p className="text-xs text-rose-600/80 dark:text-rose-400/85 max-w-xs leading-normal">
                  No matching variant SKU found for tag **{lastScanned.code}**. Make sure the tag barcode is saved in the Product Manager.
                </p>
              </div>

              <div className="text-[10px] font-mono text-gray-400 pt-1">
                Rejected scan register clock: {lastScanned.timestamp}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
