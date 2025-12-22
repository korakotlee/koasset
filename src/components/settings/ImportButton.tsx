import React, { useState, useRef } from 'react';
import { Upload, ShieldCheck, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { encryptionService } from '../../services/EncryptionService';
import { storageService } from '../../services/StorageService';
import type { EncryptedContainer } from '../../types/auth';

export const ImportButton: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingContainer, setPendingContainer] = useState<EncryptedContainer | null>(null);
  const [importPin, setImportPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError('');

    try {
      const text = await file.text();
      const container: EncryptedContainer = JSON.parse(text);

      // Basic validation
      if (!container.iv || !container.salt || !container.ct) {
        throw new Error('Invalid backup file format');
      }

      setPendingContainer(container);
      setShowPinModal(true);
    } catch {
      setError('Failed to read backup file. Make sure it is a valid .enc file.');
      setIsImporting(false);
    }

    // Reset input
    e.target.value = '';
  };

  const handleImportAttempt = async () => {
    if (!pendingContainer || importPin.length !== 4) return;

    setError('');
    try {
      const salt = encryptionService.base64ToUint8Array(pendingContainer.salt);
      const key = await encryptionService.deriveKey(importPin, salt);

      // Attempt decryption to verify PIN
      await encryptionService.decrypt(pendingContainer, key);

      // Success - Save to storage
      storageService.saveEncryptedData(pendingContainer);

      setSuccess(true);
      setShowPinModal(false);

      // Force reload to pick up new data
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      setError('Incorrect PIN for this backup or corrupted file.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Upload size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-800">Import Encrypted Backup</div>
            <div className="text-xs text-slate-500 italic">Restore your data from a .enc backup file</div>
          </div>
        </div>

        {success ? (
          <CheckCircle2 className="text-green-500 animate-pulse" size={24} />
        ) : (
          <ShieldCheck className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={24} />
        )}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".enc,.json"
        className="hidden"
      />

      {error && !showPinModal && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Unlock Backup</h3>
              <p className="text-slate-500 text-sm mt-1">Enter the PIN used when this backup was created.</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={importPin}
                onChange={(e) => setImportPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl tracking-[0.5em] py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                placeholder="••••"
                autoFocus
              />

              {error && (
                <p className="text-xs text-red-600 text-center font-medium">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setIsImporting(false);
                  }}
                  className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportAttempt}
                  disabled={importPin.length !== 4}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-xs font-medium text-green-700">
          Success! Data restored. Reloading application...
        </div>
      )}
    </div>
  );
};
