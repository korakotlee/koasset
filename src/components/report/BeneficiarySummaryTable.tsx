import React from 'react';
import type { Beneficiary } from '../../types/Beneficiary';

interface BeneficiarySummaryTableProps {
  beneficiaries: Beneficiary[];
}

/**
 * Table displaying a list of beneficiaries and their relationships.
 */
export const BeneficiarySummaryTable: React.FC<BeneficiarySummaryTableProps> = ({ beneficiaries }) => {
  if (beneficiaries.length === 0) {
    return (
      <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 italic">
        No beneficiaries recorded.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wider border-b border-slate-200 pb-1">
        Designated Beneficiaries
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-300 text-slate-600 text-sm uppercase">
            <th className="py-2 font-bold">Full Name</th>
            <th className="py-2 font-bold">Relationship</th>
            <th className="py-2 font-bold">Details</th>
          </tr>
        </thead>
        <tbody>
          {beneficiaries.map((beneficiary) => (
            <tr key={beneficiary.id} className="border-b border-slate-100 break-inside-avoid">
              <td className="py-2 font-medium">{beneficiary.name}</td>
              <td className="py-2 text-slate-700">{beneficiary.relationship}</td>
              <td className="py-2 text-slate-500 text-sm">
                {beneficiary.email ? beneficiary.email : (beneficiary.phoneNumber || '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
