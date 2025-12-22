import type { EncryptedContainer, AuthMetadata } from '../types/auth';

const STORAGE_KEYS = {
  DATA: 'koasset_data',
  AUTH: 'koasset_auth',
};

export class StorageService {
  /**
   * Main data storage
   */
  getEncryptedData(): EncryptedContainer | null {
    const data = localStorage.getItem(STORAGE_KEYS.DATA);
    return data ? JSON.parse(data) : null;
  }

  saveEncryptedData(container: EncryptedContainer): void {
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(container));
  }

  /**
   * Auth metadata storage
   */
  getAuthMetadata(): AuthMetadata {
    const metadata = localStorage.getItem(STORAGE_KEYS.AUTH);
    return metadata ? JSON.parse(metadata) : {
      failedAttempts: 0,
      lastAttemptTimestamp: 0,
      lockoutUntil: null,
    };
  }

  saveAuthMetadata(metadata: AuthMetadata): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(metadata));
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.DATA);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
}

export const storageService = new StorageService();
