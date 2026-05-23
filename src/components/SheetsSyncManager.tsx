/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cloud, 
  CloudLightning, 
  Database, 
  FileSpreadsheet, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Lock,
  User,
  PowerOff
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GSheetConnectionState } from '../lib/gsheet';

// Safe initialization of Firebase Auth
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

interface SheetsSyncManagerProps {
  id: string;
  serverStatus: 'loading' | 'online' | 'local_fallback';
  gsheetState: GSheetConnectionState;
  onConnect: (token: string) => void;
  onDisconnect: () => void;
  onPush: () => void;
  onPull: () => void;
  onToggleLiveSync: (enabled: boolean) => void;
  manualRefresh: () => void;
}

export const SheetsSyncManager: React.FC<SheetsSyncManagerProps> = ({
  id,
  serverStatus,
  gsheetState,
  onConnect,
  onDisconnect,
  onPush,
  onPull,
  onToggleLiveSync,
  manualRefresh
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  const handleSignIn = async () => {
    setIsAuthorizing(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        onConnect(credential.accessToken);
      } else {
        throw new Error('Google authorization token not received.');
      }
    } catch (err: any) {
      console.error('Popup sign-in failed:', err);
      alert(`Could not authorize Google Sheets: ${err.message || 'Please check popup settings.'}`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const isConnected = !!gsheetState.spreadsheetId;

  return (
    <div id={id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-all duration-200">
      
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-teal-500 via-indigo-500 to-indigo-600" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 mb-5 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Fully Online System & Live Backup
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Synchronize Boutique products across multiple devices with real-time Google Sheets database tracking.
            </p>
          </div>
        </div>

        {/* SERVER STATUS INDICATORS */}
        <div className="flex items-center gap-2">
          {serverStatus === 'loading' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/30 text-[10px] font-bold text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              DB Connecting
            </span>
          )}
          {serverStatus === 'online' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/40 text-[10px] font-black text-teal-700 dark:text-teal-400 rounded-lg border border-teal-100 dark:border-teal-900/40">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping" />
              Online Cloud Active
            </span>
          )}
          {serverStatus === 'local_fallback' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[10px] font-black text-orange-700 dark:text-orange-400 rounded-lg border border-orange-100 dark:border-orange-900/40">
              <CloudLightning className="w-3 h-3 text-orange-500" />
              Resilient Local Fallback
            </span>
          )}
          <button 
            onClick={manualRefresh}
            title="Reload from Cloud server"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CORE SYNC LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
        
        {/* LEFT THREE SPACES: CONTROL AND SHEETS DATA */}
        <div className="lg:col-span-3 space-y-4">
          {!isConnected ? (
            <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-5 flex flex-col items-center justify-center text-center">
              <Lock className="w-8 h-8 text-indigo-400 mb-3" />
              <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">
                Establish Google Google Account Connection
              </h4>
              <p className="text-xs text-slate-500 max-w-md my-2 leading-relaxed">
                Unlock live dual-write backup pipelines. Once authorized, Norse Thread instantly provisions a professional spreadsheet inside your Drive.
              </p>

              {/* gsi-material-button inspired style */}
              <button 
                onClick={handleSignIn}
                disabled={isAuthorizing}
                className="gsi-material-button mt-2 hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-semibold text-xs tracking-wide">
                    {isAuthorizing ? 'Connecting App...' : 'Connect Google Sheets'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* CONNECTED STATE SHEET INFO */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-linear-to-b from-indigo-50/10 to-indigo-50/30 dark:from-slate-950/20 dark:to-slate-950/40 p-4 flex items-start gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-white tracking-wide">
                      Real-time Google Sheet Live Setup
                    </h4>
                    <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-[9px] text-emerald-700 dark:text-emerald-400 font-extrabold rounded-md uppercase">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed truncate">
                    Spreadsheet Name: <span className="font-bold text-indigo-700 dark:text-indigo-400">Norse Thread Boutique Inventory & Logistics Control</span>
                  </p>
                  
                  {/* ACTIONS LINKS */}
                  <div className="flex items-center gap-4 mt-3">
                    <a 
                      href={gsheetState.spreadsheetUrl || '#'} 
                      target="_blank" 
                      rel="referrer" 
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold transition-all"
                    >
                      Open Backup Spreadsheet
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button 
                      onClick={onDisconnect}
                      className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold transition-all cursor-pointer"
                    >
                      <PowerOff className="w-3.5 h-3.5" />
                      Sign Out / Unlink
                    </button>
                  </div>
                </div>
              </div>

              {/* INTEGRATED TOGGLES & STATUS PANEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* LIVE DOCK TRACKING SWITCH */}
                <div 
                  onClick={() => onToggleLiveSync(!gsheetState.liveSyncEnabled)}
                  className={`rounded-xl p-3 border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    gsheetState.liveSyncEnabled 
                      ? 'bg-emerald-500/15 border-emerald-500 dark:bg-emerald-950/10 dark:border-emerald-900' 
                      : 'bg-slate-50/50 border-slate-200/50 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <div className="text-left">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-300">Live Auto-Backup Sync</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Push updates instantly on sale or stock alterations</p>
                  </div>
                  <button className="text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all">
                    {gsheetState.liveSyncEnabled ? (
                      <ToggleRight className="w-10 h-10 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* LAST UPDATED COMPARTMENT */}
                <div className="rounded-xl p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 text-left">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-300">Sync Telemetry Status</h5>
                  <div className="flex items-center gap-2 mt-2">
                    {gsheetState.isSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                        <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold">Uploading database...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Last backup: <span className="font-extrabold text-slate-800 dark:text-slate-100">{gsheetState.lastSynced || 'Never'}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* MANUAL ACTION BAR PUSH / PULL */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onPush}
                  disabled={gsheetState.isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gsheetState.isSyncing ? 'animate-spin' : ''}`} />
                  Push Live Backup Upstream
                </button>
                
                <button
                  onClick={() => {
                    const confirmPull = window.confirm("Are you sure you want to pull data from Google Sheets? This will overwrite your local boutique database with values formatted in Sheets.");
                    if (confirmPull) onPull();
                  }}
                  disabled={gsheetState.isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-800 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${gsheetState.isSyncing ? 'animate-spin' : ''}`} />
                  Pull Updates Downstream
                </button>
              </div>

            </div>
          )}

          {/* SPREADSHEET STRUCTURAL GUIDE ACCORDION */}
          <div>
            <button 
              onClick={() => setShowSyncInfo(!showSyncInfo)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 select-none transition-all cursor-pointer font-bold uppercase tracking-wider"
            >
              <span>{showSyncInfo ? 'Hide' : 'Reveal'} Spreadsheet Column Schema Structures</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded-sm">❔</span>
            </button>
            
            {showSyncInfo && (
               <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">Sheet 1: "Products Catalog"</p>
                  <p>Tracks primary designs and meta boundaries. Fields: <span className="font-mono text-[11px] bg-white dark:bg-slate-900 border px-1 rounded-sm">Product ID, Name, Category, Brand, Gender, Material, Season, Created At</span>.</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">Sheet 2: "Variants Inventory"</p>
                  <p>Tracks active restocks and real-time barcodes. Fields: <span className="font-mono text-[11px] bg-white dark:bg-slate-900 border px-1 rounded-sm">Variant ID, Product ID, Size, Color Name, Color Hex, Barcode, SKU, Current Stock, Min Alert Level, Purchase Cost, Selling Price MSRP, Storage Location</span>.</p>
                </div>
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase mb-1">Sheet 3: "Transaction History"</p>
                  <p>Aggregates financial logs and audits of sales, restocks, and returns. Fields: <span className="font-mono text-[11px] bg-white dark:bg-slate-900 border px-1 rounded-sm">Timestamp, Transaction ID, Type, Subtotal, Discount, Tax, Grand Total, Payment Method, Items Summary, Notes</span>.</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT TWO SPACES: SYNC POLICY AND ADVANTAGES */}
        <div className="lg:col-span-2 bg-slate-50/55 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Synchronization Rules & Best Practices
          </h4>

          <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <li className="flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Bidirectional Sync:</strong> Keep your Google Sheet browser tab open. Making modifications directly inside Sheets can be imported into Norse Thread with "Pull Updates".
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Excel Compatibility:</strong> Your backup Google Sheet can be instantly exported or downloaded as standard Excel (.xlsx) file format inside the Sheets Google interface.
              </span>
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                <strong>Cloud Resiliency:</strong> Norse Thread handles offline disruptions flawlessly. If connection degrades, it stores updates locally then uploads them when Google Sheets is refreshed.
              </span>
            </li>
          </ul>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-[10px] text-slate-500 dark:text-slate-500">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <p className="leading-relaxed">
              Ensure you do not rename the Google Spreadsheet, rename sheets tab titles, or remove primary headers to avoid spreadsheet writing failures.
            </p>
          </div>
        </div>

      </div>

      {/* ERROR OVERLAY PANEL IF ANY */}
      {gsheetState.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/35 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-semibold text-left">
            Sync Guard Alert: {gsheetState.error}
          </p>
        </div>
      )}

    </div>
  );
};
