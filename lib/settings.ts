/**
 * System Settings Helper
 * Reads/writes configuration settings from the database (SystemSetting table).
 * Falls back to process.env for backwards compatibility.
 */
import { prisma } from './db';

/**
 * Get a system setting value.
 * Checks database first, then falls back to process.env.
 */
export async function getSystemSetting(key: string): Promise<string | null> {
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });
        if (setting?.value) {
            return setting.value;
        }
    } catch (error) {
        console.error(`[Settings] Error reading ${key} from database:`, error);
    }

    // Fallback to environment variable
    return process.env[key] || null;
}

/**
 * Get multiple system settings at once.
 * Returns an object with key-value pairs.
 */
export async function getSystemSettings(keys: string[]): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};

    try {
        const settings = await prisma.systemSetting.findMany({
            where: { key: { in: keys } },
        });

        const dbMap = new Map(settings.map(s => [s.key, s.value]));

        for (const key of keys) {
            result[key] = dbMap.get(key) || process.env[key] || null;
        }
    } catch (error) {
        console.error('[Settings] Error reading settings from database:', error);
        // Fallback to env for all keys
        for (const key of keys) {
            result[key] = process.env[key] || null;
        }
    }

    return result;
}

/**
 * Save a system setting to the database.
 */
export async function saveSystemSetting(key: string, value: string, description?: string): Promise<void> {
    await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, description: description || key },
    });
}

/**
 * Save multiple system settings at once.
 */
export async function saveSystemSettings(settings: Array<{ key: string; value: string; description?: string }>): Promise<void> {
    await prisma.$transaction(
        settings.map(s =>
            prisma.systemSetting.upsert({
                where: { key: s.key },
                update: { value: s.value },
                create: { key: s.key, value: s.value, description: s.description || s.key },
            })
        )
    );
}
