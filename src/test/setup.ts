import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto for jsdom/Node environment
if (!globalThis.crypto) {
  // @ts-expect-error - webcrypto matches Web Crypto
  globalThis.crypto = webcrypto;
}
