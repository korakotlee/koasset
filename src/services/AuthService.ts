import { encryptionService } from './EncryptionService';
import { storageService } from './StorageService';
import { persistenceService } from './PersistenceService';
import type { AuthMetadata, LockoutStatus } from '../types/auth';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class AuthService {
  private sessionKey: CryptoKey | null = null;
  private currentSalt: Uint8Array | null = null;

  isSetupComplete(): boolean {
    return storageService.getEncryptedData() !== null;
  }

  async setupPin(pin: string): Promise<void> {
    if (this.isSetupComplete()) {
      throw new Error('PIN already setup');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await encryptionService.deriveKey(pin, salt);

    // Create initial empty storage
    const initialData = JSON.stringify({ assets: [], beneficiaries: [], settings: {} });
    const container = await encryptionService.encrypt(initialData, key, salt);

    storageService.saveEncryptedData(container);
    this.sessionKey = key;
    this.currentSalt = salt;
    await persistenceService.hydrate();
  }

  async login(pin: string): Promise<boolean> {
    const status = this.getLockoutStatus();
    if (status.isLocked) {
      return false;
    }

    const container = storageService.getEncryptedData();
    if (!container) {
      throw new Error('No PIN setup found');
    }

    const salt = encryptionService.base64ToUint8Array(container.salt);
    const metadata = storageService.getAuthMetadata();

    try {
      const key = await encryptionService.deriveKey(pin, salt);
      // Verify key by attempting a small decryption if needed
      await encryptionService.decrypt(container, key);

      // Success
      this.sessionKey = key;
      this.currentSalt = salt;
      await persistenceService.hydrate();
      this.resetAuthMetadata();
      return true;
    } catch {
      // Failure
      this.handleFailedAttempt(metadata);
      return false;
    }
  }

  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    const container = storageService.getEncryptedData();
    if (!container) return false;

    const salt = encryptionService.base64ToUint8Array(container.salt);
    try {
      // Verify old PIN
      const oldKey = await encryptionService.deriveKey(oldPin, salt);
      await encryptionService.decrypt(container, oldKey);

      // Setup new key
      const newSalt = crypto.getRandomValues(new Uint8Array(16));
      const newKey = await encryptionService.deriveKey(newPin, newSalt);

      // Re-encrypt
      const newContainer = await encryptionService.reEncrypt(container, oldKey, newKey);
      storageService.saveEncryptedData(newContainer);

      this.sessionKey = newKey;
      this.currentSalt = newSalt;
      return true;
    } catch {
      return false;
    }
  }

  getLockoutStatus(): LockoutStatus {
    const metadata = storageService.getAuthMetadata();
    const now = Date.now();

    if (metadata.lockoutUntil && now < metadata.lockoutUntil) {
      return {
        isLocked: true,
        remainingMs: metadata.lockoutUntil - now,
      };
    }

    return { isLocked: false, remainingMs: 0 };
  }

  logout(): void {
    this.sessionKey = null;
    persistenceService.clear();
  }

  getSessionKey(): CryptoKey | null {
    return this.sessionKey;
  }

  getCurrentSalt(): Uint8Array | null {
    return this.currentSalt;
  }

  private handleFailedAttempt(metadata: AuthMetadata): void {
    metadata.failedAttempts += 1;
    metadata.lastAttemptTimestamp = Date.now();

    if (metadata.failedAttempts >= MAX_ATTEMPTS) {
      metadata.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    storageService.saveAuthMetadata(metadata);
  }

  private resetAuthMetadata(): void {
    storageService.saveAuthMetadata({
      failedAttempts: 0,
      lastAttemptTimestamp: 0,
      lockoutUntil: null,
    });
  }
}

export const authService = new AuthService();
