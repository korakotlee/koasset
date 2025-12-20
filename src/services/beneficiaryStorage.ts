// Beneficiary storage service using localStorage
import type { Beneficiary } from '../types/Beneficiary';
import { assetStorage } from './assetStorage';

const STORAGE_KEY = 'kofi_beneficiaries';

/**
 * Beneficiary storage service providing CRUD operations with referential integrity checks
 */
export const beneficiaryStorage = {
  /**
   * Load all beneficiaries from localStorage
   * @returns Array of beneficiaries, empty array if no data or on error
   */
  load(): Beneficiary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      return parsed.map((beneficiary: Beneficiary) => ({
        ...beneficiary,
        createdAt: new Date(beneficiary.createdAt),
        updatedAt: new Date(beneficiary.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load beneficiaries from localStorage:', error);
      // Return empty array on corrupt data
      return [];
    }
  },

  /**
   * Save beneficiaries array to localStorage
   * @param beneficiaries - Array of beneficiaries to save
   */
  save(beneficiaries: Beneficiary[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(beneficiaries, null, 2));
    } catch (error) {
      console.error('Failed to save beneficiaries to localStorage:', error);
      throw new Error('Failed to save beneficiaries. Storage quota may be exceeded.');
    }
  },

  /**
   * Find a single beneficiary by ID
   * @param id - Beneficiary ID to find
   * @returns Beneficiary if found, undefined otherwise
   */
  find(id: string): Beneficiary | undefined {
    const beneficiaries = this.load();
    return beneficiaries.find(beneficiary => beneficiary.id === id);
  },

  /**
   * Create a new beneficiary
   * @param beneficiary - Beneficiary to create (id, createdAt, updatedAt will be set automatically)
   * @returns Created beneficiary with generated metadata
   */
  create(beneficiary: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt'>): Beneficiary {
    const beneficiaries = this.load();

    const newBeneficiary: Beneficiary = {
      ...beneficiary,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beneficiaries.push(newBeneficiary);
    this.save(beneficiaries);

    return newBeneficiary;
  },

  /**
   * Update an existing beneficiary
   * @param id - ID of beneficiary to update
   * @param updates - Partial beneficiary data to update
   * @returns Updated beneficiary if found, undefined otherwise
   */
  update(id: string, updates: Partial<Beneficiary>): Beneficiary | undefined {
    const beneficiaries = this.load();
    const index = beneficiaries.findIndex(beneficiary => beneficiary.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedBeneficiary: Beneficiary = {
      ...beneficiaries[index],
      ...updates,
      id: beneficiaries[index].id, // Preserve original ID
      createdAt: beneficiaries[index].createdAt, // Preserve creation timestamp
      updatedAt: new Date(), // Update modification timestamp
    };

    beneficiaries[index] = updatedBeneficiary;
    this.save(beneficiaries);

    return updatedBeneficiary;
  },

  /**
   * Delete a beneficiary by ID with referential integrity check
   * @param id - ID of beneficiary to delete
   * @returns { success: boolean, error?: string } - Success status and error message if applicable
   */
  delete(id: string): { success: boolean; error?: string } {
    // Check if beneficiary is assigned to any assets
    const assignedAssets = assetStorage.getAssetsByBeneficiary(id);

    if (assignedAssets.length > 0) {
      const assetNames = assignedAssets.map(a => a.name).join(', ');
      return {
        success: false,
        error: `Cannot delete beneficiary assigned to assets: ${assetNames}. Remove from assets first.`,
      };
    }

    const beneficiaries = this.load();
    const filtered = beneficiaries.filter(beneficiary => beneficiary.id !== id);

    if (filtered.length === beneficiaries.length) {
      return {
        success: false,
        error: 'Beneficiary not found.',
      };
    }

    this.save(filtered);
    return { success: true };
  },

  /**
   * Search beneficiaries by text query across name and relationship
   * @param query - Search query string
   * @returns Array of matching beneficiaries
   */
  search(query: string): Beneficiary[] {
    const beneficiaries = this.load();
    const lowercaseQuery = query.toLowerCase();

    return beneficiaries.filter(beneficiary => {
      return (
        beneficiary.name.toLowerCase().includes(lowercaseQuery) ||
        beneficiary.relationship.toLowerCase().includes(lowercaseQuery) ||
        (beneficiary.email?.toLowerCase().includes(lowercaseQuery) || false)
      );
    });
  },

  /**
   * Filter beneficiaries by relationship
   * @param relationship - Beneficiary relationship to filter by
   * @returns Array of beneficiaries matching the relationship
   */
  filterByRelationship(relationship: string): Beneficiary[] {
    const beneficiaries = this.load();
    return beneficiaries.filter(beneficiary => beneficiary.relationship === relationship);
  },

  /**
   * Get all beneficiaries for a specific asset
   * @param assetId - ID of the asset
   * @returns { primary: Beneficiary | null, contingent: Beneficiary[] }
   */
  getBeneficiariesForAsset(assetId: string): {
    primary: Beneficiary | null;
    contingent: Beneficiary[]
  } {
    const asset = assetStorage.find(assetId);

    if (!asset) {
      return { primary: null, contingent: [] };
    }

    const primary = asset.primaryBeneficiaryId
      ? this.find(asset.primaryBeneficiaryId) || null
      : null;

    const contingent = (asset.contingentBeneficiaryIds || [])
      .map(id => this.find(id))
      .filter((b): b is Beneficiary => b !== undefined);

    return { primary, contingent };
  },

  /**
   * Replace all beneficiaries with a new set (destructive)
   * @param beneficiaries - New array of beneficiaries
   */
  replaceAllBeneficiaries(beneficiaries: Beneficiary[]): void {
    this.save(beneficiaries);
  },
};
