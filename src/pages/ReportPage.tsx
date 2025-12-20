import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import type { ReportData } from '../types/report';
import { ReportHeader } from '../components/report/ReportHeader';
import { AssetSummaryTable } from '../components/report/AssetSummaryTable';
import { BeneficiarySummaryTable } from '../components/report/BeneficiarySummaryTable';
import { ReportFooter } from '../components/report/ReportFooter';
import '../styles/print.css';

/**
 * Main Report Page component that fetches data and coordinates the report view.
 */
export const ReportPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Generate report data from storage
    const data = reportService.generateReportData();
    setReportData(data);
  }, []);

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse text-lg">Aggregating estate records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 md:p-12 lg:p-16 max-w-5xl mx-auto shadow-none">
      {/* Report Container for Print Optimization */}
      <div className="report-container">
        <ReportHeader
          title="Consolidated Estate Summary"
          generatedAt={reportData.generatedAt}
        />

        <main>
          <AssetSummaryTable
            assetsByCategory={reportData.assetsByCategory}
            categorySubtotals={reportData.categorySubtotals}
            totalValue={reportData.totalValue}
            beneficiaryMap={reportData.beneficiaryMap}
          />

          <div className="h-16" aria-hidden="true" />

          <BeneficiarySummaryTable
            beneficiaries={reportData.beneficiaries}
          />
        </main>

        <ReportFooter />
      </div>

      {/* Action Buttons - Hidden in Print */}
      <div className="fixed bottom-8 right-8 flex gap-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center font-bold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v3m4 3h.01" />
          </svg>
          Print Report
        </button>
        <button
          onClick={() => window.close()}
          className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-full shadow-lg hover:bg-slate-50 transition-all font-bold"
        >
          Close Tab
        </button>
      </div>
    </div>
  );
};
