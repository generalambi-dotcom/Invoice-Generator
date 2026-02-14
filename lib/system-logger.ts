import { prisma } from './db';

type LogLevel = 'info' | 'warn' | 'error';
type LogCategory = 'whatsapp' | 'system' | 'auth' | 'payment';

/**
 * Log a system event to the database
 */
export async function logSystemEvent(
    level: LogLevel,
    category: LogCategory,
    message: string,
    metadata?: any
) {
    try {
        // In development, log to console
        if (process.env.NODE_ENV === 'development') {
            const metaStr = metadata ? JSON.stringify(metadata, null, 2) : '';
            console.log(`[${level.toUpperCase()}] [${category}] ${message}`, metaStr);
        }

        // Persist to database
        await prisma.systemLog.create({
            data: {
                level,
                category,
                message,
                metadata: metadata ? (metadata as any) : undefined,
            },
        });
    } catch (error) {
        // Fallback if DB logging fails
        console.error('Failed to write system log:', error);
    }
}

/**
 * Helper: Log Info
 */
export async function logInfo(category: LogCategory, message: string, metadata?: any) {
    return logSystemEvent('info', category, message, metadata);
}

/**
 * Helper: Log Warning
 */
export async function logWarn(category: LogCategory, message: string, metadata?: any) {
    return logSystemEvent('warn', category, message, metadata);
}

/**
 * Helper: Log Error
 */
export async function logError(category: LogCategory, message: string, error?: any) {
    const metadata = error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    return logSystemEvent('error', category, message, metadata);
}
