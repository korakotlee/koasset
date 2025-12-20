import React from 'react';
import type { Asset } from '../../types/Asset';
import { formatCurrency } from '../../services/currencyUtils';

interface AssetSummaryTableProps {
  assetsByCategory: Record<string, Asset[]>;
  categorySubtotals: Record<string, number>;
  totalValue: number;
  beneficiaryMap: Record<string, string>;
}

/**
 * Table displaying grouped assets with subtotals and grand total.
 */
export const AssetSummaryTable: React.FC<AssetSummaryTableProps> = ({
  assetsByCategory,
  categorySubtotals,
  totalValue,
  beneficiaryMap,
}) => {
  const categories = Object.keys(assetsByCategory).sort();

  if (categories.length === 0) {
    return (
      <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-500 italic">
        No assets recorded.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wider border-b border-slate-200 pb-1">
        Asset Portfolio Summary
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-300 text-slate-600 text-sm uppercase">
            <th className="py-2 font-bold">Asset Name</th>
            <th className="py-2 font-bold">Institution</th>
            <th className="py-2 font-bold">Beneficiaries</th>
            <th className="py-2 font-bold text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <React.Fragment key={category}>
              <tr className="bg-slate-100">
                <td colSpan={4} className="py-2 px-2 font-bold text-slate-700">
                  {category}
                </td>
              </tr>
              {assetsByCategory[category].map((asset) => (
                <tr key={asset.id} className="border-b border-slate-100 break-inside-avoid">
                  <td className="py-2 pl-4">{asset.name}</td>
                  <td className="py-2 text-slate-500">{asset.institution || '—'}</td>
                  <td className="py-2 text-slate-500 text-sm">{beneficiaryMap[asset.id]}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(asset.value)}</td>
                </tr>
              ))}
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <td colSpan={3} className="py-2 pl-4 text-sm font-semibold text-slate-600 italic">
                  Subtotal: {category}
                </td>
                <td className="py-2 text-right font-bold text-slate-700">
                  {formatCurrency(categorySubtotals[category])}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-900 bg-slate-900 text-white">
            <td colSpan={3} className="py-3 px-4 font-bold text-lg">
              Total Portfolio Value
            </td>
            <td className="py-3 px-4 text-right font-bold text-xl">
              {formatCurrency(totalValue)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
