import { describe, it, expect } from 'vitest';
import { encryptionService } from '../services/EncryptionService';

describe('EncryptionService Export/Import Cycle', () => {
  it('should encrypt and decrypt correctly', async () => {
    const pin = '1234';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const data = JSON.stringify({ test: 'data', secret: '🤫' });

    const key = await encryptionService.deriveKey(pin, salt);
    const container = await encryptionService.encrypt(data, key, salt);

    // Simulate export/import by JSON stringifying/parsing (like the buttons do)
    const exported = JSON.stringify(container);
    const importedContainer = JSON.parse(exported);

    const importedSalt = encryptionService.base64ToUint8Array(importedContainer.salt);
    const importedKey = await encryptionService.deriveKey(pin, importedSalt);

    const decrypted = await encryptionService.decrypt(importedContainer, importedKey);

    expect(decrypted).toBe(data);
  });

  it('should fail to decrypt with a wrong PIN', async () => {
    const pin = '1234';
    const wrongPin = '4321';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const data = 'Secret message';

    const key = await encryptionService.deriveKey(pin, salt);
    const container = await encryptionService.encrypt(data, key, salt);

    const wrongKey = await encryptionService.deriveKey(wrongPin, salt);
    await expect(encryptionService.decrypt(container, wrongKey)).rejects.toThrow();
  });

  it('should handle large data correctly (testing stack limits)', async () => {
    const pin = '1234';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    // Create a ~1MB string to test potentially larger data
    const data = 'A'.repeat(1024 * 1024);

    const key = await encryptionService.deriveKey(pin, salt);
    const container = await encryptionService.encrypt(data, key, salt);

    const decrypted = await encryptionService.decrypt(container, key);
    expect(decrypted).toBe(data);
  });
});
