// Asset storage service using localStorage
import type { Asset } from '../types/Asset';
import { historyStorage } from './historyStorage';

const STORAGE_KEY = 'kofi_assets';

/**
 * Asset storage service providing CRUD operations for localStorage
 */
export const assetStorage = {
  /**
   * Load all assets from localStorage
   * @returns Array of assets, empty array if no data or on error
   */
  load(): Asset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      return parsed.map((asset: Asset) => ({
        ...asset,
        createdAt: new Date(asset.createdAt),
        updatedAt: new Date(asset.updatedAt),
        lastReviewed: asset.lastReviewed ? new Date(asset.lastReviewed) : undefined,
        maturityDate: asset.maturityDate ? new Date(asset.maturityDate) : undefined,
      }));
    } catch (error) {
      console.error('Failed to load assets from localStorage:', error);
      // Return empty array on corrupt data
      return [];
    }
  },

  /**
   * Save assets array to localStorage
   * @param assets - Array of assets to save
   */
  save(assets: Asset[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets, null, 2));
    } catch (error) {
      console.error('Failed to save assets to localStorage:', error);
      throw new Error('Failed to save assets. Storage quota may be exceeded.');
    }
  },

  /**
   * Find a single asset by ID
   * @param id - Asset ID to find
   * @returns Asset if found, undefined otherwise
   */
  find(id: string): Asset | undefined {
    const assets = this.load();
    return assets.find(asset => asset.id === id);
  },

  /**
   * Create a new asset
   * @param asset - Asset to create (id, createdAt, updatedAt will be set automatically)
   * @returns Created asset with generated metadata
   */
  create(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset {
    const assets = this.load();

    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assets.push(newAsset);
    this.save(assets);

    // Record initial history
    historyStorage.addRecord(newAsset.id, newAsset.value, 'Initial value');

    return newAsset;
  },

  /**
   * Update an existing asset
   * @param id - ID of asset to update
   * @param updates - Partial asset data to update
   * @returns Updated asset if found, undefined otherwise
   */
  update(id: string, updates: Partial<Asset>): Asset | undefined {
    const assets = this.load();
    const index = assets.findIndex(asset => asset.id === id);

    if (index === -1) {
      return undefined;
    }

    const currentAsset = assets[index];
    const updatedAsset: Asset = {
      ...currentAsset,
      ...updates,
      id: currentAsset.id, // Preserve original ID
      createdAt: currentAsset.createdAt, // Preserve creation timestamp
      updatedAt: new Date(), // Update modification timestamp
    };

    assets[index] = updatedAsset;
    this.save(assets);

    // Record history if value changed
    if (updates.value !== undefined && updates.value !== currentAsset.value) {
      historyStorage.addRecord(updatedAsset.id, updatedAsset.value, 'Value updated');
    }

    return updatedAsset;
  },

  /**
   * Delete an asset by ID
   * @param id - ID of asset to delete
   * @returns true if deleted, false if not found
   */
  delete(id: string): boolean {
    const assets = this.load();
    const filtered = assets.filter(asset => asset.id !== id);

    if (filtered.length === assets.length) {
      return false; // Asset not found
    }

    this.save(filtered);

    // Cascade delete history
    historyStorage.deleteByAssetId(id);

    return true;
  },

  /**
   * Filter assets by category
   * @param category - Asset category to filter by
   * @returns Array of assets matching the category
   */
  filterByCategory(category: string): Asset[] {
    const assets = this.load();
    return assets.filter(asset => asset.category === category);
  },

  /**
   * Search assets by text query across name, institution, accountNumber, and notes
   * @param query - Search query string
   * @returns Array of matching assets
   */
  search(query: string): Asset[] {
    const assets = this.load();
    const lowercaseQuery = query.toLowerCase();

    return assets.filter(asset => {
      return (
        asset.name.toLowerCase().includes(lowercaseQuery) ||
        (asset.institution?.toLowerCase().includes(lowercaseQuery) || false) ||
        (asset.accountNumber?.toLowerCase().includes(lowercaseQuery) || false) ||
        (asset.notes?.toLowerCase().includes(lowercaseQuery) || false)
      );
    });
  },

  /**
   * Get assets that need review (not reviewed in X days or never reviewed)
   * @param daysThreshold - Number of days since last review (default: 90)
   * @returns Array of assets needing review
   */
  getAssetsNeedingReview(daysThreshold: number = 90): Asset[] {
    const assets = this.load();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    return assets.filter(asset => {
      if (!asset.lastReviewed) {
        return true; // Never reviewed
      }
      return asset.lastReviewed < thresholdDate;
    });
  },

  /**
   * Mark an asset as reviewed
   * @param id - ID of asset to mark as reviewed
   * @returns Updated asset if found, undefined otherwise
   */
  markAsReviewed(id: string): Asset | undefined {
    return this.update(id, { lastReviewed: new Date() });
  },

  /**
   * Get total value of all assets
   * @returns Sum of all asset values
   */
  getTotalValue(): number {
    const assets = this.load();
    return assets.reduce((total, asset) => total + asset.value, 0);
  },

  /**
   * Get assets by beneficiary ID
   * @param beneficiaryId - ID of beneficiary
   * @returns Array of assets assigned to the beneficiary
   */
  getAssetsByBeneficiary(beneficiaryId: string): Asset[] {
    const assets = this.load();
    return assets.filter(asset =>
      asset.primaryBeneficiaryId === beneficiaryId ||
      (asset.contingentBeneficiaryIds?.includes(beneficiaryId) || false)
    );
  },
  /**
   * Replace all assets with a new set (destructive)
   * @param assets - New array of assets
   */
  replaceAllAssets(assets: Asset[]): void {
    this.save(assets);
  },
};
