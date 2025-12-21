/**
 * Encryption utility for sensitive data
 * Uses AES-256 encryption for payment credentials
 */

import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-encryption-key-change-in-production';

/**
 * Encrypt sensitive data (e.g., payment API keys)
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string is encrypted (basic check)
 */
export function isEncrypted(text: string): boolean {
  // Encrypted strings from CryptoJS typically start with specific patterns
  // This is a basic check - encrypted strings are base64-like and longer
  return !!(text && text.length > 20 && /^[A-Za-z0-9+/=]+$/.test(text));
}

/**
 * Encrypt payment credential fields
 */
export function encryptPaymentCredential(credential: {
  publicKey?: string | null;
  secretKey?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
}): {
  publicKey?: string | null;
  secretKey?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
} {
  return {
    publicKey: credential.publicKey ? encrypt(credential.publicKey) : null,
    secretKey: credential.secretKey ? encrypt(credential.secretKey) : null,
    clientId: credential.clientId ? encrypt(credential.clientId) : null,
    clientSecret: credential.clientSecret ? encrypt(credential.clientSecret) : null,
  };
}

/**
 * Decrypt payment credential fields
 */
export function decryptPaymentCredential(credential: {
  publicKey?: string | null;
  secretKey?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
}): {
  publicKey?: string | null;
  secretKey?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
} {
  try {
    return {
      publicKey: credential.publicKey ? decrypt(credential.publicKey) : null,
      secretKey: credential.secretKey ? decrypt(credential.secretKey) : null,
      clientId: credential.clientId ? decrypt(credential.clientId) : null,
      clientSecret: credential.clientSecret ? decrypt(credential.clientSecret) : null,
    };
  } catch (error) {
    console.error('Error decrypting payment credential:', error);
    // Return null values if decryption fails
    return {
      publicKey: null,
      secretKey: null,
      clientId: null,
      clientSecret: null,
    };
  }
}

