// Asset storage service using secure persistence
import type { Asset } from '../types/Asset';
import { historyStorage } from './historyStorage';
import { persistenceService } from './PersistenceService';

/**
 * Asset storage service providing CRUD operations for secure storage
 */
export const assetStorage = {
  /**
   * Load all assets
   */
  load(): Asset[] {
    const data = persistenceService.getData<Asset>('assets');
    // Convert date strings back to Date objects
    return data.map((asset: Asset) => ({
      ...asset,
      createdAt: new Date(asset.createdAt),
      updatedAt: new Date(asset.updatedAt),
      lastReviewed: asset.lastReviewed ? new Date(asset.lastReviewed) : undefined,
      maturityDate: asset.maturityDate ? new Date(asset.maturityDate) : undefined,
    }));
  },

  /**
   * Save assets array
   */
  save(assets: Asset[]): void {
    persistenceService.setData('assets', assets);
  },

  /**
   * Find a single asset by ID
   */
  find(id: string): Asset | undefined {
    const assets = this.load();
    return assets.find(asset => asset.id === id);
  },

  /**
   * Create a new asset
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
      id: currentAsset.id,
      createdAt: currentAsset.createdAt,
      updatedAt: new Date(),
    };

    assets[index] = updatedAsset;
    this.save(assets);

    if (updates.value !== undefined && updates.value !== currentAsset.value) {
      historyStorage.addRecord(updatedAsset.id, updatedAsset.value, 'Value updated');
    }

    return updatedAsset;
  },

  /**
   * Delete an asset by ID
   */
  delete(id: string): boolean {
    const assets = this.load();
    const filtered = assets.filter(asset => asset.id !== id);

    if (filtered.length === assets.length) {
      return false;
    }

    this.save(filtered);
    historyStorage.deleteByAssetId(id);
    return true;
  },

  filterByCategory(category: string): Asset[] {
    const assets = this.load();
    return assets.filter(asset => asset.category === category);
  },

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

  getAssetsNeedingReview(daysThreshold: number = 90): Asset[] {
    const assets = this.load();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    return assets.filter(asset => {
      if (!asset.lastReviewed) {
        return true;
      }
      return asset.lastReviewed < thresholdDate;
    });
  },

  markAsReviewed(id: string): Asset | undefined {
    return this.update(id, { lastReviewed: new Date() });
  },

  getTotalValue(): number {
    const assets = this.load();
    return assets.reduce((total, asset) => total + asset.value, 0);
  },

  getAssetsByBeneficiary(beneficiaryId: string): Asset[] {
    const assets = this.load();
    return assets.filter(asset =>
      asset.primaryBeneficiaryId === beneficiaryId ||
      (asset.contingentBeneficiaryIds?.includes(beneficiaryId) || false)
    );
  },

  replaceAllAssets(assets: Asset[]): void {
    this.save(assets);
  },
};
