import React from 'react';

/**
 * Report footer with branding and legal notice.
 */
export const ReportFooter: React.FC = () => {
  return (
    <footer className="mt-12 pt-4 border-t border-slate-300 text-center text-xs text-slate-400">
      <div className="flex justify-between items-center mb-2">
        <p>© {new Date().getFullYear()} KoFi Estate Management</p>
        <p className="print:block hidden">Page <span className="after:content-[counter(page)]" /></p>
      </div>
      <p>
        This report is for informational purposes only and does not constitute financial, legal, or tax advice.
        Ensure this physical copy is stored in a secure location.
      </p>
    </footer>
  );
};
