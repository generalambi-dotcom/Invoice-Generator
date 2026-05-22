import { prisma } from '@/lib/db';

export type InvoiceEventType =
    | 'created'
    | 'status_changed'
    | 'total_changed'
    | 'due_date_changed'
    | 'sent'
    | 'viewed'
    | 'payment_received'
    | 'payment_refunded'
    | 'edited';

interface LogEventParams {
    invoiceId: string;
    userId: string;
    eventType: InvoiceEventType;
    description: string;
    oldValue?: string;
    newValue?: string;
    actor?: 'owner' | 'system' | 'client';
}

/**
 * Fire-and-forget invoice event logger.
 * Never throws — errors are swallowed so they never block the main request.
 */
export function logInvoiceEvent(params: LogEventParams): void {
    prisma.invoiceEvent
        .create({
            data: {
                invoiceId: params.invoiceId,
                userId: params.userId,
                eventType: params.eventType,
                description: params.description,
                oldValue: params.oldValue ?? null,
                newValue: params.newValue ?? null,
                actor: params.actor ?? 'owner',
            },
        })
        .catch((err) => {
            console.error('[invoice-events] Failed to log event:', err?.message || err);
        });
}

/** Detect changes between old and new invoice states and log relevant events. */
export function logInvoicePatchEvents(params: {
    invoiceId: string;
    userId: string;
    before: Record<string, any>;
    after: Record<string, any>;
}): void {
    const { invoiceId, userId, before, after } = params;

    // Track which specific fields changed
    let hadSpecificChange = false;

    // 1. Payment status changed
    if (after.paymentStatus && after.paymentStatus !== before.paymentStatus) {
        hadSpecificChange = true;
        const statusLabels: Record<string, string> = {
            pending: 'Pending',
            paid: 'Paid',
            overdue: 'Overdue',
            cancelled: 'Cancelled',
        };
        logInvoiceEvent({
            invoiceId,
            userId,
            eventType: 'status_changed',
            description: `Status changed from ${statusLabels[before.paymentStatus] || before.paymentStatus} to ${statusLabels[after.paymentStatus] || after.paymentStatus}`,
            oldValue: before.paymentStatus,
            newValue: after.paymentStatus,
        });
    }

    // 2. Total changed
    if (after.total !== undefined && after.total !== before.total) {
        hadSpecificChange = true;
        const sym = before.currency === 'NGN' ? '₦' : before.currency === 'GBP' ? '£' : before.currency === 'EUR' ? '€' : '$';
        logInvoiceEvent({
            invoiceId,
            userId,
            eventType: 'total_changed',
            description: `Total updated from ${sym}${Number(before.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to ${sym}${Number(after.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            oldValue: String(before.total),
            newValue: String(after.total),
        });
    }

    // 3. Due date changed
    if (after.dueDate && String(after.dueDate) !== String(before.dueDate)) {
        hadSpecificChange = true;
        const fmt = (d: any) => {
            try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
            catch { return String(d); }
        };
        logInvoiceEvent({
            invoiceId,
            userId,
            eventType: 'due_date_changed',
            description: `Due date changed from ${fmt(before.dueDate)} to ${fmt(after.dueDate)}`,
            oldValue: String(before.dueDate),
            newValue: String(after.dueDate),
        });
    }

    // 4. Generic edit (any other field changed, but no specific event above)
    if (!hadSpecificChange) {
        logInvoiceEvent({
            invoiceId,
            userId,
            eventType: 'edited',
            description: 'Invoice details updated',
        });
    }
}
