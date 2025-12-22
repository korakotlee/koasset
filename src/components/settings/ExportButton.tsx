import React, { useState } from 'react';
import { Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { storageService } from '../../services/StorageService';

export const ExportButton: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    try {
      const container = storageService.getEncryptedData();
      if (!container) {
        throw new Error('No data found to export');
      }

      const blob = new Blob([JSON.stringify(container, null, 2)], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `koasset-backup-${date}.enc`);
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      // Small delay before cleanup to ensure Chrome initiates the download with the filename
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center justify-between px-6 py-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group shadow-sm"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Download size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-slate-800">Export Encrypted Backup</div>
            <div className="text-xs text-slate-500 italic">Downloads a secure .enc file protected by your PIN</div>
          </div>
        </div>

        {showSuccess ? (
          <CheckCircle2 className="text-green-500 animate-in zoom-in duration-300" size={24} />
        ) : (
          <ShieldCheck className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={24} />
        )}
      </button>

      {showSuccess && (
        <div className="text-center text-xs font-medium text-green-600 animate-in fade-in slide-in-from-top-1 duration-300">
          Backup file downloaded successfully!
        </div>
      )}
    </div>
  );
};
