import type { Asset } from './Asset';
import type { Beneficiary } from './Beneficiary';

export interface EncryptedContainer {
  v: number;      // Version tag
  iv: string;     // Base64 encoded Initialization Vector (12 bytes)
  salt: string;   // Base64 encoded Salt for KDF (16 bytes)
  ct: string;     // Base64 encoded Ciphertext
}

export interface AuthMetadata {
  failedAttempts: number;
  lastAttemptTimestamp: number;
  lockoutUntil: number | null;
}

export interface DecryptedData {
  assets: Asset[];
  beneficiaries: Beneficiary[];
  history: unknown[];
  settings: Record<string, unknown>;
}

export interface LockoutStatus {
  isLocked: boolean;
  remainingMs: number;
}
