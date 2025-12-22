import type { EncryptedContainer } from '../types/auth';

const ALGORITHM = 'AES-GCM';
const KDF_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const ITERATIONS = 600000;
const KEY_LENGTH = 256;

export class EncryptionService {
  /**
   * Derive a CryptoKey from a 4-digit PIN and a salt.
   */
  async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(pin),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: KDF_ALGORITHM,
        salt: salt as BufferSource,
        iterations: ITERATIONS,
        hash: HASH_ALGORITHM,
      },
      baseKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a string (data) using a key.
   * returns { iv, salt, ct } as base64 strings.
   */
  async encrypt(data: string, key: CryptoKey, saltOverride?: Uint8Array): Promise<EncryptedContainer> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = saltOverride || crypto.getRandomValues(new Uint8Array(16));

    const encrypted = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoder.encode(data)
    );

    return {
      v: 1,
      iv: btoa(String.fromCharCode(...iv)),
      salt: btoa(String.fromCharCode(...salt)),
      ct: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    };
  }

  /**
   * Decrypt ciphertext using a key, IV, and salt.
   */
  async decrypt(container: EncryptedContainer, key: CryptoKey): Promise<string> {
    const iv = new Uint8Array(atob(container.iv).split('').map(c => c.charCodeAt(0)));
    const ct = new Uint8Array(atob(container.ct).split('').map(c => c.charCodeAt(0)));

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ct
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Re-encrypt data from an old key to a new key.
   */
  async reEncrypt(container: EncryptedContainer, oldKey: CryptoKey, newKey: CryptoKey): Promise<EncryptedContainer> {
    const decryptedData = await this.decrypt(container, oldKey);
    // Reuse the same salt or generate a new one?
    // Usually a new salt is better on PIN change.
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    // We need to re-derive the key with the new salt if we want to change it.
    // BUT the newKey passed here should already be derived with its own salt.
    // So we just need to encrypt the data with the newKey.
    return this.encrypt(decryptedData, newKey, newSalt);
  }

  /**
   * Helper to convert base64 to Uint8Array
   */
  base64ToUint8Array(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
  }
}

export const encryptionService = new EncryptionService();
