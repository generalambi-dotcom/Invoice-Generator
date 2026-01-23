import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/api-auth';

// DELETE - Delete a payment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthenticatedUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paymentId = params.id;

        // Verify payment ownership via invoice -> user
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                invoice: true,
            },
        });

        if (!payment) {
            return NextResponse.json(
                { error: 'Payment not found' },
                { status: 404 }
            );
        }

        // Verify the invoice belongs to the authenticated user
        if (payment.invoice.userId !== user.userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete the payment
        await prisma.payment.delete({
            where: { id: paymentId },
        });

        // Recalculate invoice totals
        // Get fresh total of remaining payments
        const remainingPayments = await prisma.payment.findMany({
            where: { invoiceId: payment.invoiceId },
        });

        const newPaidAmount = remainingPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalAmount = payment.invoice.total;

        // Determine new status
        let newStatus = 'pending';
        if (newPaidAmount >= totalAmount && totalAmount > 0) {
            newStatus = 'paid';
        } else if (newPaidAmount > 0) {
            newStatus = 'pending'; // Partial
        } else {
            // If 0 paid, revert to existing status typically 'pending' unless it was overdue
            // For simplicity, if it was 'paid' and now is 0, it should be 'pending' or 'overdue' if past due date
            // We will check due date
            const isOverdue = new Date() > new Date(payment.invoice.dueDate);
            newStatus = isOverdue ? 'overdue' : 'pending';
        }

        // Update invoice
        const updatedInvoice = await prisma.invoice.update({
            where: { id: payment.invoiceId },
            data: {
                paidAmount: newPaidAmount,
                paymentStatus: newStatus,
                // Clear payment date if no payments left
                paymentDate: newPaidAmount >= totalAmount ? new Date() : (remainingPayments.length === 0 ? null : payment.invoice.paymentDate),
            },
        });

        return NextResponse.json({
            message: 'Payment deleted',
            invoice: updatedInvoice
        });

    } catch (error: any) {
        console.error('Error deleting payment:', error);
        return NextResponse.json(
            { error: 'Failed to delete payment' },
            { status: 500 }
        );
    }
}
