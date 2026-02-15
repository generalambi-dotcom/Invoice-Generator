import { prisma } from '@/lib/db';

export async function getNextInvoiceNumber(userId: string, prefix = 'INV', format = 'PREFIX-YYYY-NNNN') {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Determine reset period from format
    let resetPeriod: 'year' | 'month' | null = null;
    if (format.includes('YYYY-MM')) {
        resetPeriod = 'month';
    } else if (format.includes('YYYY')) {
        resetPeriod = 'year';
    }

    // Find existing sequence
    let sequence = await prisma.invoiceNumberSequence.findFirst({
        where: {
            userId,
            prefix,
            ...(resetPeriod === 'year' ? { year } : {}),
            ...(resetPeriod === 'month' ? { year, month } : {}),
        },
    });

    // Create if doesn't exist
    if (!sequence) {
        sequence = await prisma.invoiceNumberSequence.create({
            data: {
                userId,
                prefix,
                format,
                currentNumber: 1,
                year: resetPeriod ? year : null,
                month: resetPeriod === 'month' ? month : null,
                resetPeriod,
            },
        });
    } else {
        // Check if we need to reset (new year/month)
        let needsReset = false;
        if (resetPeriod === 'year' && sequence.year !== year) {
            needsReset = true;
        } else if (resetPeriod === 'month' && (sequence.year !== year || sequence.month !== month)) {
            needsReset = true;
        }

        if (needsReset) {
            sequence = await prisma.invoiceNumberSequence.update({
                where: { id: sequence.id },
                data: {
                    currentNumber: 1,
                    year: resetPeriod ? year : null,
                    month: resetPeriod === 'month' ? month : null,
                },
            });
        }
    }

    // Generate invoice number
    let invoiceNumber = format;
    invoiceNumber = invoiceNumber.replace('PREFIX', prefix);
    invoiceNumber = invoiceNumber.replace('YYYY', year.toString());
    invoiceNumber = invoiceNumber.replace('MM', month.toString().padStart(2, '0'));
    invoiceNumber = invoiceNumber.replace('NNNN', sequence.currentNumber.toString().padStart(4, '0'));
    invoiceNumber = invoiceNumber.replace('NNN', sequence.currentNumber.toString().padStart(3, '0'));
    invoiceNumber = invoiceNumber.replace('NN', sequence.currentNumber.toString().padStart(2, '0'));

    return {
        invoiceNumber,
        sequence,
    };
}

export async function incrementInvoiceNumber(sequenceId: string) {
    await prisma.invoiceNumberSequence.update({
        where: { id: sequenceId },
        data: {
            currentNumber: {
                increment: 1,
            },
        },
    });
}
