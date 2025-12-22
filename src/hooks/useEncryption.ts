import { useCallback } from 'react';
import { authService } from '../services/AuthService';
import { encryptionService } from '../services/EncryptionService';
import { storageService } from '../services/StorageService';

export const useEncryption = () => {
  const encryptAndSave = useCallback(async (data: unknown) => {
    const key = authService.getSessionKey();
    if (!key) {
      throw new Error('Not authenticated');
    }

    const jsonString = JSON.stringify(data);
    const container = await encryptionService.encrypt(jsonString, key);
    storageService.saveEncryptedData(container);
  }, []);

  const loadAndDecrypt = useCallback(async <T>(): Promise<T | null> => {
    const key = authService.getSessionKey();
    if (!key) {
      return null;
    }

    const container = storageService.getEncryptedData();
    if (!container) {
      return null;
    }

    const decrypted = await encryptionService.decrypt(container, key);
    return JSON.parse(decrypted) as T;
  }, []);

  return {
    encryptAndSave,
    loadAndDecrypt,
  };
};
