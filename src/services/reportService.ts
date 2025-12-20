import { assetStorage } from './assetStorage';
import { beneficiaryStorage } from './beneficiaryStorage';
import type { ReportData } from '../types/report';
import type { Asset } from '../types/Asset';

/**
 * Service to aggregate data for the Consolidated Estate Report.
 */
export const reportService = {
  /**
   * Generates aggregated report data from local storage.
   * @returns ReportData structure
   */
  generateReportData(): ReportData {
    const assets = assetStorage.load();
    const beneficiaries = beneficiaryStorage.load();

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    const assetsByCategory: Record<string, Asset[]> = {};
    const categorySubtotals: Record<string, number> = {};

    const beneficiaryMap: Record<string, string> = {};

    assets.forEach((asset) => {
      const category = asset.category || 'Other';
      if (!assetsByCategory[category]) {
        assetsByCategory[category] = [];
        categorySubtotals[category] = 0;
      }
      assetsByCategory[category].push(asset);
      categorySubtotals[category] += asset.value;

      // Map beneficiaries
      const primary = asset.primaryBeneficiaryId
        ? beneficiaries.find(b => b.id === asset.primaryBeneficiaryId)?.name
        : null;
      const contingent = (asset.contingentBeneficiaryIds || [])
        .map(id => beneficiaries.find(b => b.id === id)?.name)
        .filter(Boolean);

      const allNames = [primary, ...contingent].filter(Boolean).join(', ');
      beneficiaryMap[asset.id] = allNames || '—';
    });

    return {
      totalValue,
      assetsByCategory,
      categorySubtotals,
      beneficiaries,
      beneficiaryMap,
      generatedAt: new Date().toISOString(),
    };
  },
};
