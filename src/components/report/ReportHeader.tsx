import React from 'react';

interface ReportHeaderProps {
  title: string;
  generatedAt: string;
}

/**
 * Professional report header with KoAsset logo and generation metadata.
 */
export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, generatedAt }) => {
  const formattedDate = new Date(generatedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <header className="mb-8 border-b-2 border-slate-900 pb-4 flex justify-between items-end">
      <div className="flex items-center gap-12">
        <div className="w-12 h-12 flex-shrink-0">
          <img
            src="/koasset-black.svg"
            alt="KoAsset Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">KoAsset</h1>
          <p className="text-xl text-slate-700 font-semibold">{title}</p>
        </div>
      </div>
      <div className="text-right text-sm text-slate-500">
        <p>Generated on: {formattedDate}</p>
        <p className="font-medium italic">Confidential Estate Record</p>
      </div>
    </header>
  );
};
