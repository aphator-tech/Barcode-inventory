/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Info,
  Database,
  Eye,
  Settings,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { parseExcelFile } from '../lib/excel';
import { Product, Variant, Transaction } from '../types';

interface SheetsSyncManagerProps {
  id: string;
  serverStatus: 'loading' | 'online' | 'local_fallback';
  excelStatus: {
    lastImportedFileName: string | null;
    lastImportedTimestamp: string | null;
    successCountProducts: number;
    successCountVariants: number;
  } | null;
  products: Product[];
  variants: Variant[];
  transactions: Transaction[];
  onImportExcel: (parsedProds: Product[], parsedVars: Variant[], mode: 'merge' | 'overwrite', fileName: string) => void;
  onExportExcel: () => void;
  onDownloadTemplate: () => void;
  manualRefresh: () => void;
}

export const SheetsSyncManager: React.FC<SheetsSyncManagerProps> = ({
  id,
  serverStatus,
  excelStatus,
  products,
  variants,
  transactions,
  onImportExcel,
  onExportExcel,
  onDownloadTemplate,
  manualRefresh
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<{ products: Product[]; variants: Variant[]; sheetNames: string[] } | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showConfigDetails, setShowConfigDetails] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setParsedData(null);
    setIsParsing(true);

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExt !== 'xlsx' && fileExt !== 'xls' && fileExt !== 'csv') {
      setErrorMessage("Unsupported file type. Please upload a standard Excel (.xlsx, .xls) or Comma Separated CSV (.csv) worksheet catalog.");
      setIsParsing(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result instanceof ArrayBuffer) {
            const parsed = parseExcelFile(event.target.result);
            setParsedData(parsed);
          } else {
            throw new Error("Could not process file content.");
          }
        } catch (err: any) {
          setErrorMessage(err.message || "Failed parsing the workbook. Make sure the file is not corrupted.");
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setErrorMessage("An unexpected error occurred during import.");
      setIsParsing(false);
    }
  };

  const handleApplyImport = () => {
    if (!parsedData || !selectedFile) return;

    if (parsedData.products.length === 0 && parsedData.variants.length === 0) {
      setErrorMessage("No products or variants were found in the file. Ensure you are using the correct column structures.");
      return;
    }

    onImportExcel(parsedData.products, parsedData.variants, importMode, selectedFile.name);
    
    // Reset uploader state
    setSelectedFile(null);
    setParsedData(null);
  };

  const handleDiscardUploaded = () => {
    setSelectedFile(null);
    setParsedData(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id={id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all duration-200">
      
      {/* Premium Visual Border */}
      <div className="absolute top-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600" />

      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Local Spreadsheet Sync Console
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Offline spreadsheet workbook parsing. Manage your entire product design catalog via local Excel and CSV files.
            </p>
          </div>
        </div>

        {/* SERVER AND PERSISTENCE METADATA */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-black text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% Client Offline Secure
          </span>
          <button 
            onClick={manualRefresh}
            title="Reload from local sqlite database files"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* DETAILED DOUBLE CONTAINER PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
        
        {/* LEFT COLUMN (3/5): FILE MANAGEMENT & ACTIONS */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* DRAG-AND-DROP SELECTOR */}
          {!selectedFile ? (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                dragActive 
                  ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-900/10' 
                  : 'border-slate-200 dark:border-slate-850 hover:border-teal-400 hover:bg-slate-50/50 dark:hover:bg-slate-950/20'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileInputChange}
                accept=".xlsx,.xls,.csv"
                className="hidden" 
              />
              <UploadCloud className="w-10 h-10 text-slate-350 dark:text-slate-650 mb-3" />
              <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">
                Select or Drop Spreadsheet File
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm leading-relaxed font-semibold">
                Supports Excel workbooks (<span className="text-teal-600 font-extrabold">.xlsx</span>, <span className="text-teal-600 font-extrabold">.xls</span>) or Comma Separated (<span className="text-teal-600 font-extrabold">.csv</span>) spreadsheets.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-55/15 dark:bg-slate-950/40 p-5 space-y-4">
              
              {/* FILE BASIC INFO CARD */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-500/20">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-800 dark:text-white truncate max-w-xs">{selectedFile.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB • Local Upload</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleDiscardUploaded}
                  className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                  title="Discard file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* PARSED SUMMARY */}
              {isParsing ? (
                <div className="flex items-center gap-2 py-4">
                  <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Processing worksheets on-the-fly...</span>
                </div>
              ) : parsedData ? (
                <div className="space-y-4 pt-1">
                  
                  {/* DATA METRIC PILLS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 flex flex-col justify-center">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Products Parsed</span>
                      <span className="text-sm font-black text-slate-800 dark:text-teal-400 mt-0.5">{parsedData.products.length} catalog items</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-2.5 flex flex-col justify-center">
                      <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Inventory Variants</span>
                      <span className="text-sm font-black text-slate-800 dark:text-teal-400 mt-0.5">{parsedData.variants.length} color/sizes</span>
                    </div>
                  </div>

                  {/* IMPORT MODE PICKER */}
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-350 tracking-wider">Choose Inventory Integration Policy</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setImportMode('merge')}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          importMode === 'merge'
                            ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/10 text-slate-800 dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <h6 className="text-[11px] font-black leading-tight uppercase">Merge Mode</h6>
                        <p className="text-[9px] text-slate-450 leading-normal mt-0.5">Integrates rows into database, updating matches & appending new items.</p>
                      </button>
                      
                      <button
                        onClick={() => {
                          const confirmOver = window.confirm("Are you positive you wish to overwrite the active catalog? This replaces all existing local items inside the boutique ledger.");
                          if (confirmOver) setImportMode('overwrite');
                        }}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          importMode === 'overwrite'
                            ? 'border-teal-500 bg-teal-500/5 dark:bg-teal-950/10 text-slate-800 dark:text-white'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <h6 className="text-[11px] font-black leading-tight uppercase">Overwrite Mode</h6>
                        <p className="text-[9px] text-slate-450 leading-normal mt-0.5">Replaces current records completely with the contents of the upload.</p>
                      </button>
                    </div>
                  </div>

                  {/* APPLY BUTTON */}
                  <button
                    onClick={handleApplyImport}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply Changes to Boutique Ledger
                  </button>

                </div>
              ) : null}

            </div>
          )}

          {/* TELEMETRY FEEDBACK LOG */}
          {excelStatus && excelStatus.lastImportedFileName && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-850/80 flex items-start justify-between text-left">
              <div className="space-y-0.5">
                <span className="text-[9px] text-teal-600 uppercase font-black tracking-widest block">Last Spreadsheet Event</span>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-150 truncate max-w-[200px] sm:max-w-xs">{excelStatus.lastImportedFileName}</p>
                <div className="flex gap-3 text-[10px] text-slate-400 font-medium">
                  <span>Imported at: {excelStatus.lastImportedTimestamp}</span>
                  <span>Products: {excelStatus.successCountProducts}</span>
                  <span>Variants: {excelStatus.successCountVariants}</span>
                </div>
              </div>
              <span className="p-1 px-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-extrabold text-[8px] uppercase tracking-wider rounded">Success</span>
            </div>
          )}

          {/* MANUAL EXPORT BACKUP AND FORMAT RULES TRIGGER */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onExportExcel}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Inventory Backup (.xlsx)
            </button>
            <button
              onClick={onDownloadTemplate}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download Template (.xlsx)
            </button>
          </div>

          {/* COLUMN DETAILS ACCORDION TRIGGER */}
          <div>
            <button 
              onClick={() => setShowConfigDetails(!showConfigDetails)}
              className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 hover:text-teal-600 select-none transition-all cursor-pointer font-black uppercase tracking-wider"
            >
              <span>{showConfigDetails ? 'Hide' : 'Reveal'} Local Spreadsheet Columns Mapping</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showConfigDetails && (
              <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800/80 space-y-3.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-normal">
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">Products Catalog Tab</p>
                  <p>Defines master apparel structures. Required column headers: <span className="font-mono text-[11px] bg-white dark:bg-slate-900 border px-1 rounded-sm">Product ID, Name, Category, Brand, Gender, Material, Season, Created At</span>.</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">Variants Inventory Tab</p>
                  <p>Defines restocks and sizing details. Required column headers: <span className="font-mono text-[11px] bg-white dark:bg-slate-900 border px-1 rounded-sm">Variant ID, Product ID, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Alert Level, Purchase Cost, Selling Price MSRP, Storage Location</span>.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (2/5): PRIVATE LOCAL PERSISTENCE BEST PRACTICES */}
        <div className="lg:col-span-2 bg-slate-50/55 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Sandboxed Privacy & Best Practices
          </h4>

          <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>No Cloud Latencies:</strong> By bypassing Google Authentication, Norse Thread achieves instant local syncing that runs fully inside your browser session.
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Absolute Bank-Grade Privacy:</strong> Spreadsheets are evaluated offline on your sandbox container. No third-party servers or Google storage APIs receive your proprietary retail data.
              </span>
            </li>
            <li className="flex gap-2.5 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Persistent Database File:</strong> All imported sheets are written automatically to Node server files, preserving state safely through browser refreshes or cold reboots.
              </span>
            </li>
          </ul>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-start gap-2.5 text-[10px] text-slate-400/90 font-medium">
            <Info className="w-4 h-4 text-teal-500 shrink-0" />
            <p className="leading-relaxed">
              When configuring standard spreadsheet sheets, preserve column names exactly as outputted in the template file to ensure parsing matches database indexes correctly.
            </p>
          </div>
        </div>

      </div>

      {/* ERROR NOTICE FLOATING FOOTER */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-450 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <p className="text-left leading-normal">{errorMessage}</p>
        </div>
      )}

    </div>
  );
};
