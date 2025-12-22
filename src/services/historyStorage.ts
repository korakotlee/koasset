// History storage service using localStorage
import type { AssetHistory } from '../types/AssetHistory';
import type { Asset } from '../types/Asset';

const HISTORY_STORAGE_KEY = 'koasset_asset_history';

/**
 * History storage service providing CRUD operations for asset history
 */
export const historyStorage = {
  /**
   * Load all history records from localStorage
   * @returns Array of history records, empty array if no data or on error
   */
  load(): AssetHistory[] {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      return parsed.map((record: AssetHistory) => ({
        ...record,
        timestamp: new Date(record.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load history from localStorage:', error);
      return [];
    }
  },

  /**
   * Save history records to localStorage
   * @param history - Array of history records to save
   */
  save(history: AssetHistory[]): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
      // In a real app, we might want to handle quota exceeded errors here
    }
  },

  /**
   * Add a new history record
   * @param assetId - ID of the asset
   * @param value - Value of the asset
   * @param note - Optional note
   * @returns The created history record
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
   * Get history for a specific asset, sorted by timestamp (newest first)
   * @param assetId - ID of the asset
   * @returns Array of history records for the asset
   */
  getByAssetId(assetId: string): AssetHistory[] {
    const history = this.load();
    return history
      .filter(record => record.assetId === assetId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },

  /**
   * Delete a specific history record
   * @param id - ID of the record to delete
   * @returns true if deleted, false if not found
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
   * @param assetId - ID of the asset
   * @returns Number of records deleted
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
   * Calculate the total portfolio value at a specific date using "Last Known Value" logic.
   * For each asset, we find the most recent history record on or before the target date.
   * If no history exists before that date, we assume value is 0 (or could use initial value if we tracked it).
   *
   * @param date - The target date
   * @param assets - List of all assets to include in the calculation
   * @returns Total portfolio value
   */
  getPortfolioValueAtDate(date: Date, assets: Asset[]): number {
    const allHistory = this.load();
    let totalValue = 0;

    // Normalize target date to end of day to include all records from that day
    const targetTime = new Date(date);
    targetTime.setHours(23, 59, 59, 999);

    for (const asset of assets) {
      // Get history for this asset
      const assetHistory = allHistory
        .filter(h => h.assetId === asset.id && h.timestamp <= targetTime)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first

      if (assetHistory.length > 0) {
        // Use the most recent value (Last Known Value)
        totalValue += assetHistory[0].value;
      } else {
        // No history before this date.
        // If the asset was created after this date, its value was effectively 0 (or unknown) at that time.
        // If the asset has no history at all but exists, we might want to use its current value IF current date is close?
        // But strictly speaking, "Last Known Value" implies we need a record.
        // For now, we assume 0 if no record exists.
        totalValue += 0;
      }
    }

    return totalValue;
  },
  /**
   * Get all history records (alias for load, for consistency with backup service)
   * @returns Array of all history records
   */
  getAllHistory(): AssetHistory[] {
    return this.load();
  },

  /**
   * Replace all history records with a new set (destructive)
   * @param history - New array of history records
   */
  replaceAllHistory(history: AssetHistory[]): void {
    this.save(history);
  }
};
