/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  RotateCcw, 
  CheckCircle,
  Clock, 
  SlidersHorizontal,
  Barcode, 
  ChevronRight, 
  Truck, 
  PlusCircle,
  Percent,
  FileSpreadsheet,
  Trash
} from 'lucide-react';
import { Product, Variant, Supplier, Transaction, ScanLog } from '../types';
import { MetricCard } from './MetricCard';

interface DashboardProps {
  id: string;
  products: Product[];
  variants: Variant[];
  suppliers: Supplier[];
  transactions: Transaction[];
  scanLogs: ScanLog[];
  stats: any;
  onAdjustStock: (variantId: string, diff: number, type: 'RESTOCK' | 'DAMAGED' | 'RETURN', note?: string) => void;
  onUndoTransaction: (id: string) => void;
  onResetDatabase: () => void;
}

export const DashboardView: React.FC<DashboardProps> = ({
  id,
  products,
  variants,
  suppliers,
  transactions,
  scanLogs,
  stats,
  onAdjustStock,
  onUndoTransaction,
  onResetDatabase
}) => {
  const [showLowStockOverlay, setShowLowStockOverlay] = useState(false);

  // --- EXPORT LOGISTICS LOGS TO EXCEL CSV ---
  const exportTransactionsCSV = () => {
    const headers = ['Timestamp', 'Transaction Ref ID', 'Type', 'Grand Total ($)', 'Items Details Breakdown'];
    const lines = [headers.join(',')];

    transactions.forEach(t => {
      const itemsDetail = t.items.map(item => `${item.productName} (${item.variantDetails}) x${item.quantity}`).join('; ');
      const row = [
        `"${new Date(t.timestamp).toISOString()}"`,
        `"${t.id}"`,
        `"${t.type}"`,
        t.grandTotal.toFixed(2),
        `"${itemsDetail.replace(/"/g, '""')}"`
      ];
      lines.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `retail_logistics_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ANALYTICS GEOMETRY CHARTS ---
  // Let's draw an elegant pure SVG Line Chart for Sales progress
  // We can plot the grandTotals of the last 6 orders
  const lastSalesTX = transactions.filter(t => t.type === 'SALE').slice(0, 7).reverse();
  const graphWidth = 500;
  const graphHeight = 160;
  const padding = 24;

  const points = lastSalesTX.map((tx, idx) => {
    const x = padding + (idx * (graphWidth - padding * 2)) / Math.max(1, lastSalesTX.length - 1);
    // scale relative to max sale
    const maxVal = Math.max(...lastSalesTX.map(t => t.grandTotal), 100);
    const y = graphHeight - padding - (tx.grandTotal * (graphHeight - padding * 2)) / maxVal;
    return { x, y, value: tx.grandTotal, id: tx.id };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${graphHeight - padding} L ${points[0].x} ${graphHeight - padding} Z`
    : '';

  // Calculate top categories metrics
  const categoryCounts: { [key: string]: number } = {};
  variants.forEach(v => {
    const p = products.find(prod => prod.id === v.productId);
    if (p) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + v.currentStock;
    }
  });

  const categoriesData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  const maxCategoryCount = Math.max(...categoriesData.map(c => c.count), 1);

  // Identify lowest inventory items (variants)
  const lowStockItems = variants
    .filter(v => v.currentStock <= v.minimumStockAlert)
    .map(v => {
      const p = products.find(prod => prod.id === v.productId);
      return { variant: v, product: p };
    })
    .slice(0, 5);

  return (
    <div id={id} className="space-y-6 text-left">
      
      {/* 1. TOP STATS ROW BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          id="stat-products"
          title="Garment Catalog SKU Count"
          value={stats.totalVariants}
          subtext={`${stats.totalProducts} clothing base items`}
          icon={Package}
          badgeText="Operational"
          badgeType="success"
        />
        <MetricCard
          id="stat-stock"
          title="Warehouse Logistics"
          value={`${stats.totalItems} Units`}
          subtext={`Inventory MSRP: $${stats.totalStockValue.toLocaleString()}`}
          icon={Truck}
          badgeText="In Stock"
          badgeType="info"
        />
        <MetricCard
          id="stat-low"
          title="Low Stock Warning Triggers"
          value={`${stats.lowStockCount} Variants`}
          subtext="Actionable threshold markers"
          icon={AlertTriangle}
          badgeText={stats.lowStockCount > 0 ? "⚠️ REPLENISH" : "SECURE"}
          badgeType={stats.lowStockCount > 0 ? "warning" : "success"}
        />
        <MetricCard
          id="stat-revenue"
          title="Weekly Revenue Flow"
          value={`$${stats.weeklySales.toFixed(2)}`}
          subtext={`${stats.recentSalesCount} orders checked out`}
          icon={TrendingUp}
          badgeText="Live POS"
          badgeType="success"
        />
      </div>

      {/* 2. DUAL CHART & CATEGORIES SPLIT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH COLUMN (70%) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block">Core Revenue Metrics</span>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Recent POS Transaction Checkout Curve</h4>
            </div>
            <div className="text-[10px] bg-slate-50 dark:bg-gray-800 font-mono text-gray-400 font-bold px-2.5 py-1 rounded-lg">
              Live updates
            </div>
          </div>

          {/* Pure Vector SVG plot */}
          <div className="relative pt-4 w-full flex items-center justify-center">
            {points.length > 1 ? (
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto max-h-[160px]">
                {/* Horizontal reference bands */}
                <line x1={padding} y1={padding} x2={graphWidth - padding} y2={padding} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                <line x1={padding} y1={graphHeight / 2} x2={graphWidth - padding} y2={graphHeight / 2} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3" />
                <line x1={padding} y1={graphHeight - padding} x2={graphWidth - padding} y2={graphHeight - padding} stroke="#e5e7eb" strokeWidth="1.5" />

                {/* AREA CHART gradient filling */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#areaGradient)" />

                {/* LINE PLOT */}
                <path d={pathD} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* COORDINATE PIN DATA LABELS */}
                {points.map((p, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                    <text
                      x={p.x}
                      y={p.y - 12}
                      textAnchor="middle"
                      className="text-[9px] font-bold font-mono fill-teal-650 filter drop-shadow-sm select-none"
                    >
                      ${p.value.toFixed(0)}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-gray-400 text-xs text-center p-4">
                <SlidersHorizontal className="w-6 h-6 text-slate-300 animate-pulse mb-1.5" />
                <span>Await more POS checkouts to map real-time statistics trends.</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-405 font-medium pt-3.5 border-t border-gray-50 mt-4">
            <span>Terminal Timeline: X-Axis represents consecutive orders index.</span>
            <span className="font-mono text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Chart compiled correctly
            </span>
          </div>
        </div>

        {/* CATEGORY BREAKOUT (30%) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-901 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-0.5 pb-4">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest block">Assortment Splits</span>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Active Warehouses Volume Breakdown</h4>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            {categoriesData.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">No catalog segments compiled.</div>
            ) : (
              categoriesData.slice(0, 4).map(cat => {
                const percentage = Math.round((cat.count / stats.totalItems) * 100) || 0;
                return (
                  <div key={cat.name} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-gray-751">
                      <span className="truncate max-w-[150px]">{cat.name}</span>
                      <span className="font-mono font-bold text-gray-900">{cat.count} Units ({percentage}%)</span>
                    </div>
                    {/* Visual Meter Bar */}
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-600 rounded-full"
                        style={{ width: `${Math.max(3, (cat.count / maxCategoryCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-gray-400 pt-3 border-t border-gray-50/50 mt-4">
            Tracking active material fabric types and outerwear levels.
          </div>
        </div>

      </div>

      {/* 3. UNDERLAY ROW: ACTIONABLE WARNING TICKER + RECENT REAL-TIME SCAN RECORDS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* REPLENISH LEVEL ACTION CORNER (45%) */}
        <div className="xl:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <h4 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 stroke-2" />
                Low Stock Urgent Alerts
              </h4>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[9px] uppercase tracking-wider rounded-full">
                {stats.lowStockCount} Pending
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto pt-2.5">
              {lowStockItems.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-2">
                  <CheckCircle className="w-7 h-7 mx-auto text-emerald-500" />
                  <p className="text-xs font-bold text-gray-700">Perfect Stock Satiation</p>
                  <p className="text-[10px] text-gray-400 leading-normal">All product variants remain above minimum alert levels.</p>
                </div>
              ) : (
                lowStockItems.map(({ variant, product }, idx) => {
                  if (!product || !variant) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between py-3.5 text-xs">
                      <div className="flex items-center gap-2.5 max-w-[60%]">
                        <img 
                          src={product.image} 
                          alt="" 
                          className="w-8 h-8 rounded-lg object-cover bg-gray-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate text-left space-y-0.5">
                          <span className="font-bold text-gray-901 block truncate leading-snug">{product.name}</span>
                          <span className="text-[10px] text-gray-450 block truncate">
                            {variant.size} / {variant.colorName} • SKU: {variant.sku}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="block font-mono font-bold text-rose-600">{variant.currentStock} Units</span>
                        <span className="block text-[9px] text-gray-400">Min level: {variant.minimumStockAlert}</span>
                      </div>

                      <button
                        onClick={() => onAdjustStock(variant.id, 15, 'RESTOCK', 'Quick threshold response replenishment.')}
                        className="px-2.5 py-1.5 bg-gray-55 hover:bg-teal-50 hover:text-teal-600 rounded-lg text-[10px] font-bold text-gray-600 uppercase border border-gray-150 tracking-wider transition-all cursor-pointer"
                      >
                        Restock +15
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          <div className="text-[10px] text-gray-400 border-t border-gray-50/50 pt-3.5 mt-4">
            Automated notifications based on custom supplier limits.
          </div>
        </div>

        {/* RECENT SCANS MONITOR (35%) */}
        <div className="xl:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-50">
              <h4 className="text-sm font-bold text-gray-950 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-teal-600" />
                Scan Monitor Activity Log
              </h4>
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">
                LAST 5 ACTIONS
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto pt-2.5">
              {scanLogs.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-xs">No scan registers recorded.</div>
              ) : (
                scanLogs.slice(0, 5).map((log, idx) => (
                  <div key={idx} className="py-3 items-start justify-between flex text-[11px] gap-2">
                    <div className="space-y-0.5 text-left max-w-[65%]">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded-md ${
                        log.status === 'FOUND' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100/60' 
                          : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {log.barcode}
                      </span>
                      <p className="text-[10px] text-gray-505 leading-snug shrink pt-1.5">{log.actionTaken}</p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 font-mono text-[9px] text-gray-400 shrink-0">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={log.status === 'FOUND' ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] text-gray-400 border-t border-gray-50/50 pt-3.5 mt-4">
            Capturing real-time local device and laser keyboard actions.
          </div>
        </div>

        {/* ACTIVE MANUFACTURERS/SUPPLIERS CARD LIST (20%) */}
        <div className="xl:col-span-3 bg-white dark:bg-gray-901 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-gray-50">
              <h4 className="text-sm font-bold text-gray-950 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-500" />
                Active Clothing Mills
              </h4>
            </div>

            <div className="pt-3.5 space-y-3">
              {suppliers.map(sup => {
                const variantsAssigned = variants.filter(v => v.supplierId === sup.id).length;
                return (
                  <div key={sup.id} className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100/80 text-xs text-left text-gray-700 space-y-0.5">
                    <strong className="block text-gray-950 font-bold truncate">{sup.name}</strong>
                    <span className="text-[10px] text-gray-450 block truncate font-medium">Contact: {sup.contactName}</span>
                    <span className="text-[9px] text-teal-650 font-bold tracking-wider uppercase block pt-1">
                      {variantsAssigned} Active variants
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Warning: This will set the clothes inventory slate back to defaults. Current variants and mock history will wipe.')) {
                onResetDatabase();
              }
            }}
            className="w-full text-center py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-5"
          >
            Reset Catalog Slate ⚡
          </button>
        </div>

      </div>

      {/* 4. BOTTOM TIER: MASTER DYNAMIC TRANSACTION LOGS W/ DIRECT REVERT/UNDO ACTIONS */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-50 gap-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-gray-951 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Complete Logistics & Sales Log
            </h4>
            <p className="text-[11px] text-gray-400">Chronological history of stock adjustments, damages, returns, and POS cashier receipt logs.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportTransactionsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-150 border border-teal-200/80 hover:text-white dark:hover:bg-teal-650 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              title="Download entire transaction stream log as Excel CSV backup"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Backup History (CSV)
            </button>
            <div className="text-[10px] font-bold text-gray-450 font-mono bg-slate-50 dark:bg-gray-850 px-2.5 py-1.5 rounded-xl border">
              PERSISTED ENTRIES: {transactions.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pt-2 max-h-80 overflow-y-auto pr-1">
          <table className="min-w-full text-xs">
            <thead className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50">
              <tr>
                <th className="py-3 text-left">Timestamp</th>
                <th className="py-3 text-left">Operation Ref</th>
                <th className="py-3 text-left">Log Type</th>
                <th className="py-3 text-left">Garments & Items Details</th>
                <th className="py-3 text-right">Value Total ($)</th>
                <th className="py-3 text-right">Emergency Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400">No transaction records logged yet.</td>
                </tr>
              ) : (
                transactions.map((tx, idx) => {
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/20">
                      
                      {/* Timestamp */}
                      <td className="py-3.5 text-gray-400 font-mono">
                        {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* ID */}
                      <td className="py-3.5 font-bold text-gray-700 select-all font-mono">
                        {tx.id}
                      </td>

                      {/* Operation Type badge */}
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          tx.type === 'SALE' 
                            ? 'bg-emerald-50 text-emerald-850 border border-emerald-200' 
                            : tx.type === 'RESTOCK'
                            ? 'bg-sky-50 text-sky-850 border border-sky-200'
                            : tx.type === 'RETURN'
                            ? 'bg-amber-50 text-amber-855 border border-amber-200'
                            : 'bg-rose-50 text-rose-850 border border-rose-200'
                        }`}>
                          {tx.type}
                        </span>
                      </td>

                      {/* Items details breakdown lists */}
                      <td className="py-3.5 max-w-sm truncate font-medium text-gray-650">
                        {tx.items.map((item, idx) => (
                          <div key={idx} className="block truncate">
                            {item.productName} ({item.variantDetails}) x{item.quantity}
                          </div>
                        ))}
                      </td>

                      {/* Total cost */}
                      <td className="py-3.5 text-right font-mono font-extrabold text-gray-900">
                        ${tx.grandTotal.toFixed(2)}
                      </td>

                      {/* Action Revert Trigger */}
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Emergency protocol: Revert other log transaction ${tx.id}? Stock changes will be calculated back.`)) {
                              onUndoTransaction(tx.id);
                            }
                          }}
                          className="px-2.5 py-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50/20 rounded-md border border-gray-150 font-bold uppercase text-[9px] tracking-wider transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Undo log
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
