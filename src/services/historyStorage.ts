// History storage service using secure persistence
import type { AssetHistory } from '../types/AssetHistory';
import type { Asset } from '../types/Asset';
import { persistenceService } from './PersistenceService';

/**
 * History storage service providing CRUD operations for asset history in secure storage
 */
export const historyStorage = {
  /**
   * Load all history records
   */
  load(): AssetHistory[] {
    const data = persistenceService.getData<AssetHistory>('history');
    // Convert date strings back to Date objects
    return data.map((record: AssetHistory) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }));
  },

  /**
   * Save history records
   */
  save(history: AssetHistory[]): void {
    persistenceService.setData('history', history);
  },

  /**
   * Add a new history record
   */
  addRecord(assetId: string, value: number, note?: string): AssetHistory {
    const history = this.load();

    const newRecord: AssetHistory = {
      id: crypto.randomUUID(),
      assetId,
      value,
      timestamp: new Date(),
      note,
    };

    history.push(newRecord);
    this.save(history);

    return newRecord;
  },

  /**
   * Get history for a specific asset, newest first
   */
  getByAssetId(assetId: string): AssetHistory[] {
    const history = this.load();
    return history
      .filter(record => record.assetId === assetId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  /**
   * Delete a specific history record
   */
  deleteRecord(id: string): boolean {
    const history = this.load();
    const filtered = history.filter(record => record.id !== id);

    if (filtered.length === history.length) {
      return false;
    }

    this.save(filtered);
    return true;
  },

  /**
   * Delete all history records for a specific asset
   */
  deleteByAssetId(assetId: string): number {
    const history = this.load();
    const initialLength = history.length;
    const filtered = history.filter(record => record.assetId !== assetId);

    if (filtered.length !== initialLength) {
      this.save(filtered);
    }

    return initialLength - filtered.length;
  },

  /**
   * Calculate portfolio value at a specific date
   */
  getPortfolioValueAtDate(date: Date, assets: Asset[]): number {
    const allHistory = this.load();
    let totalValue = 0;

    const targetTime = new Date(date);
    targetTime.setHours(23, 59, 59, 999);

    for (const asset of assets) {
      const assetHistory = allHistory
        .filter(h => h.assetId === asset.id && h.timestamp <= targetTime)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (assetHistory.length > 0) {
        totalValue += assetHistory[0].value;
      } else {
        totalValue += 0;
      }
    }

    return totalValue;
  },

  /**
   * Get all history records
   */
  getAllHistory(): AssetHistory[] {
    return this.load();
  },

  /**
   * Replace all history records
   */
  replaceAllHistory(history: AssetHistory[]): void {
    this.save(history);
  }
};
