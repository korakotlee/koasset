import type { Asset } from './Asset';
import type { Beneficiary } from './Beneficiary';
import type { AssetHistory } from './AssetHistory';

export interface BackupData {
  version: number;
  timestamp: string;
  assets: Asset[];
  beneficiaries: Beneficiary[];
  history: AssetHistory[];
}
