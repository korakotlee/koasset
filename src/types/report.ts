/**
 * @file report.ts
 * @description Type definitions for the Consolidated Estate Report.
 */

import type { Asset } from './Asset';
import type { Beneficiary } from './Beneficiary';

export interface ReportData {
  /** Total value of all assets in cents */
  totalValue: number;

  /** Assets grouped by their category */
  assetsByCategory: Record<string, Asset[]>;

  /** Sum of values for each category in cents */
  categorySubtotals: Record<string, number>;

  /** All beneficiaries recorded in the system */
  beneficiaries: Beneficiary[];

  /** Mapping of Asset ID to beneficiary names string */
  beneficiaryMap: Record<string, string>;

  /** Date and time the report was generated */
  generatedAt: string;
}

export interface ReportComponentProps {
  data: ReportData;
}
