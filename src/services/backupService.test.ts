import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { backupService } from './backupService';
import { assetStorage } from './assetStorage';
import { beneficiaryStorage } from './beneficiaryStorage';
import { historyStorage } from './historyStorage';
import type { Asset } from '../types/Asset';
import type { Beneficiary } from '../types/Beneficiary';
import type { AssetHistory } from '../types/AssetHistory';

// Mock storage services
vi.mock('./assetStorage', () => ({
  assetStorage: {
    load: vi.fn(),
  },
}));

vi.mock('./beneficiaryStorage', () => ({
  beneficiaryStorage: {
    load: vi.fn(),
  },
}));

vi.mock('./historyStorage', () => ({
  historyStorage: {
    getAllHistory: vi.fn(),
  },
}));

describe('backupService', () => {
  const mockAssets: Asset[] = [
    {
      id: '1',
      name: 'Test Asset',
      value: 1000,
      category: 'Cash',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  const mockBeneficiaries: Beneficiary[] = [
    {
      id: '1',
      name: 'Test Beneficiary',
      relationship: 'Spouse',
      allocationPercentage: 100,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  const mockHistory: AssetHistory[] = [
    {
      id: '1',
      assetId: '1',
      value: 1000,
      timestamp: new Date('2023-01-01'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock return values
    vi.mocked(assetStorage.load).mockReturnValue(mockAssets);
    vi.mocked(beneficiaryStorage.load).mockReturnValue(mockBeneficiaries);
    vi.mocked(historyStorage.getAllHistory).mockReturnValue(mockHistory);

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock document methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export data correctly', () => {
    backupService.exportData();

    // Verify data was loaded from storage
    expect(assetStorage.load).toHaveBeenCalled();
    expect(beneficiaryStorage.load).toHaveBeenCalled();
    expect(historyStorage.getAllHistory).toHaveBeenCalled();

    // Verify Blob creation (implicitly by checking createObjectURL call)
    expect(globalThis.URL.createObjectURL).toHaveBeenCalled();

    // Verify link creation and click
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(document.body.appendChild).toHaveBeenCalled();

    // Check if the blob content is correct (tricky with Blob, but we can check the flow)
    // In a real browser environment we could read the blob, but here we trust the flow.

    // Verify cleanup
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });

  it('should import valid data correctly', async () => {
    const mockBackupData = {
      version: 1,
      timestamp: '2023-01-01T00:00:00.000Z',
      assets: JSON.parse(JSON.stringify(mockAssets)),
      beneficiaries: JSON.parse(JSON.stringify(mockBeneficiaries)),
      history: JSON.parse(JSON.stringify(mockHistory)),
    };

    const file = new File([JSON.stringify(mockBackupData)], 'backup.json', { type: 'application/json' });

    // Mock storage replace methods
    assetStorage.replaceAllAssets = vi.fn();
    beneficiaryStorage.replaceAllBeneficiaries = vi.fn();
    historyStorage.replaceAllHistory = vi.fn();

    await backupService.importData(file);

    expect(assetStorage.replaceAllAssets).toHaveBeenCalledWith(mockBackupData.assets);
    expect(beneficiaryStorage.replaceAllBeneficiaries).toHaveBeenCalledWith(mockBackupData.beneficiaries);
    expect(historyStorage.replaceAllHistory).toHaveBeenCalledWith(mockBackupData.history);
  });

  it('should reject invalid backup file', async () => {
    const invalidData = { foo: 'bar' };
    const file = new File([JSON.stringify(invalidData)], 'invalid.json', { type: 'application/json' });

    await expect(backupService.importData(file)).rejects.toThrow('Invalid backup file format');
  });
});
