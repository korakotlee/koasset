import type { BackupData } from '../types/Backup';
import { assetStorage } from './assetStorage';
import { beneficiaryStorage } from './beneficiaryStorage';
import { historyStorage } from './historyStorage';

export const backupService = {
  /**
   * Export all application data to a JSON file
   */
  exportData(): void {
    const backup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      assets: assetStorage.load(),
      beneficiaries: beneficiaryStorage.load(),
      history: historyStorage.getAllHistory(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Format filename: koasset-backup-YYYY-MM-DD.json
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `koasset-backup-${date}.json`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Import application data from a JSON file
   * @param file - The backup file to import
   * @returns Promise that resolves when import is complete
   */
  importData(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);

          // Basic schema validation
          if (!this.isValidBackup(data)) {
            throw new Error('Invalid backup file format');
          }

          // Restore data (Replace strategy)
          assetStorage.replaceAllAssets(data.assets);
          beneficiaryStorage.replaceAllBeneficiaries(data.beneficiaries);
          historyStorage.replaceAllHistory(data.history);

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  },

  /**
   * Validate backup data structure
   */
  isValidBackup(data: any): data is BackupData {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.assets) &&
      Array.isArray(data.beneficiaries) &&
      Array.isArray(data.history)
      // We could add more strict checks here, but this covers the basic structure
    );
  },
};
