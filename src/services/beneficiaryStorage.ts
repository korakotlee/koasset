// Beneficiary storage service using secure persistence
import type { Beneficiary } from '../types/Beneficiary';
import { assetStorage } from './assetStorage';
import { persistenceService } from './PersistenceService';

/**
 * Beneficiary storage service providing CRUD operations with secure storage
 */
export const beneficiaryStorage = {
  /**
   * Load all beneficiaries
   */
  load(): Beneficiary[] {
    const data = persistenceService.getData<Beneficiary>('beneficiaries');
    // Convert date strings back to Date objects
    return data.map((beneficiary: Beneficiary) => ({
      ...beneficiary,
      createdAt: new Date(beneficiary.createdAt),
      updatedAt: new Date(beneficiary.updatedAt),
    }));
  },

  /**
   * Save beneficiaries array
   */
  save(beneficiaries: Beneficiary[]): void {
    persistenceService.setData('beneficiaries', beneficiaries);
  },

  /**
   * Find a single beneficiary by ID
   */
  find(id: string): Beneficiary | undefined {
    const beneficiaries = this.load();
    return beneficiaries.find(beneficiary => beneficiary.id === id);
  },

  /**
   * Create a new beneficiary
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
      id: beneficiaries[index].id,
      createdAt: beneficiaries[index].createdAt,
      updatedAt: new Date(),
    };

    beneficiaries[index] = updatedBeneficiary;
    this.save(beneficiaries);

    return updatedBeneficiary;
  },

  /**
   * Delete a beneficiary by ID with referential integrity check
   */
  delete(id: string): { success: boolean; error?: string } {
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

  filterByRelationship(relationship: string): Beneficiary[] {
    const beneficiaries = this.load();
    return beneficiaries.filter(beneficiary => beneficiary.relationship === relationship);
  },

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

  replaceAllBeneficiaries(beneficiaries: Beneficiary[]): void {
    this.save(beneficiaries);
  },
};
