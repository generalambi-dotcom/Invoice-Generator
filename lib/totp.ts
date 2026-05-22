/**
 * TOTP (RFC 6238) implementation using Node.js built-in crypto.
 * Zero external dependencies.
 */
import { createHmac, randomBytes } from 'crypto';

// ── Base32 ────────────────────────────────────────────────────────────────────

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Buffer): string {
    let result = '';
    let bits = 0, value = 0;
    for (const byte of buf) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) result += BASE32_CHARS[(value << (5 - bits)) & 31];
    return result;
}

function base32Decode(input: string): Buffer {
    const str = input.replace(/=+$/, '').toUpperCase();
    const out: number[] = [];
    let bits = 0, value = 0;
    for (const ch of str) {
        const idx = BASE32_CHARS.indexOf(ch);
        if (idx === -1) throw new Error('Invalid base32: ' + ch);
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            out.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(out);
}

// ── TOTP core ─────────────────────────────────────────────────────────────────

function hotp(key: Buffer, counter: bigint): string {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(counter);
    const hmac = createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code =
        ((hmac[offset]     & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) <<  8) |
        ((hmac[offset + 3] & 0xff));
    return (code % 1_000_000).toString().padStart(6, '0');
}

/** Generate a 6-digit TOTP code from a base32 secret. `window` shifts the 30s step. */
export function generateTOTP(secret: string, window = 0): string {
    const key = base32Decode(secret);
    const step = BigInt(Math.floor(Date.now() / 1000 / 30)) + BigInt(window);
    return hotp(key, step);
}

/** Verify a user-supplied code against the secret. Tolerates ±1 window (~60s drift). */
export function verifyTOTP(code: string, secret: string): boolean {
    if (!/^\d{6}$/.test(code)) return false;
    return [-1, 0, 1].some((w) => generateTOTP(secret, w) === code);
}

/** Generate a random 20-byte base32 secret. */
export function generateTOTPSecret(): string {
    return base32Encode(randomBytes(20));
}

/** Build the standard otpauth:// URI for QR code scanning. */
export function buildOtpauthUri(secret: string, email: string, issuer = 'InvoiceGenerator.ng'): string {
    const label = encodeURIComponent(`${issuer}:${email}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Return a Google Charts URL that renders the QR code image. */
export function buildQRCodeUrl(otpauthUri: string): string {
    return `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpauthUri)}`;
}
