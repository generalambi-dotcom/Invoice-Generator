import crypto from 'crypto';

// ENCRYPTION_KEY is mandatory. It protects users' payment provider secret keys
// (Paystack/Stripe/Twilio) at rest, so there is deliberately no fallback — a
// hardcoded fallback would mean anyone with repo access could decrypt them.
function getKeyBuffer(): Buffer {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY environment variable must be set to a strong secret of at ' +
      'least 32 characters. It is required to encrypt payment credentials at rest.'
    );
  }
  // Pad/truncate to exactly 32 bytes for AES-256. This matches the original
  // derivation so credentials encrypted before this change still decrypt.
  return Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32);
}

const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKeyBuffer(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return '';
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return '';

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(ALGORITHM, getKeyBuffer(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return empty string on failure instead of crashing
    return '';
  }
}

/**
 * Encrypt payment credential fields
 */
export function encryptPaymentCredential(data: any): any {
  const result: any = { ...data };

  // Encrypt sensitive fields if they exist
  if (result.secretKey) result.secretKey = encrypt(result.secretKey);
  if (result.clientSecret) result.clientSecret = encrypt(result.clientSecret);
  if (result.twilioAuthToken) result.twilioAuthToken = encrypt(result.twilioAuthToken);

  return result;
}

/**
 * Decrypt payment credential fields
 */
export function decryptPaymentCredential(data: any): any {
  const result: any = { ...data };

  if (result.secretKey) result.secretKey = decrypt(result.secretKey);
  if (result.clientSecret) result.clientSecret = decrypt(result.clientSecret);
  if (result.twilioAuthToken) result.twilioAuthToken = decrypt(result.twilioAuthToken);

  return result;
}
