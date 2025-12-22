import { encryptionService } from './EncryptionService';
import { storageService } from './StorageService';
import { authService } from './AuthService';

/**
 * PersistenceService manages the decrypted state in memory
 * and handles the asynchronous encryption cycle to localStorage.
 */
class PersistenceService {
  private data: Record<string, unknown[]> | null = null;
  private isHydrated = false;

  async hydrate(): Promise<void> {
    const key = authService.getSessionKey();
    if (!key) throw new Error('Not authenticated');

    const container = storageService.getEncryptedData();
    if (!container) {
      // Initialize empty if nothing exists
      this.data = { assets: [], beneficiaries: [], history: [], settings: [] };
    } else {
      try {
        const decrypted = await encryptionService.decrypt(container, key);
        this.data = JSON.parse(decrypted);
      } catch (err) {
        console.error('PersistenceService: Hydration failed', err);
        throw err;
      }
    }

    this.isHydrated = true;
  }

  getData<T>(key: string): T[] {
    if (!this.isHydrated || !this.data) {
      return [];
    }
    return (this.data[key] || []) as T[];
  }

  async setData(key: string, value: unknown[]): Promise<void> {
    if (!this.isHydrated || !this.data) return;

    this.data[key] = value;
    await this.persist();
  }

  private async persist(): Promise<void> {
    const key = authService.getSessionKey();
    const salt = authService.getCurrentSalt();
    if (!key || !salt) return;

    if (!this.data) return;

    const jsonString = JSON.stringify(this.data);
    const container = await encryptionService.encrypt(jsonString, key, salt);
    storageService.saveEncryptedData(container);
  }

  clear(): void {
    this.data = null;
    this.isHydrated = false;
  }
}

export const persistenceService = new PersistenceService();
