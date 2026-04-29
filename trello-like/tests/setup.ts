// Polyfill for crypto.randomUUID in test environment
import crypto from 'crypto';

if (typeof global.crypto === 'undefined') {
  (global as unknown as { crypto: typeof crypto }).crypto = {
    randomUUID: crypto.randomUUID,
  };
}

// Suppress console.error in tests to avoid noise from intentional error tests
globalThis.console.error = () => {};
