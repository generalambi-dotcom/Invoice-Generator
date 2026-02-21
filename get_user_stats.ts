import { config } from 'dotenv'
config({ path: '.env.local' })
import { prisma } from './lib/db'

async function main() {
    const email = 'aiadstudio@myrecovery.casa'
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            _count: {
                select: {
                    invoices: true,
                    payments: true,
                    clients: true,
                    estimates: true,
                    creditNotes: true,
                    recurringInvoices: true,
                    invoiceTemplates: true,
                    sentEmails: true,
                    posts: true,
                    notes: true,
                    tasks: true,
                    timeLogs: true
                }
            }
        }
    })

    if (!user) {
        console.log(`User with email ${email} not found.`)
        return
    }

    console.log("User Info:")
    console.log(`- ID: ${user.id}`)
    console.log(`- Name: ${user.name}`)
    console.log(`- Created At: ${user.createdAt}`)

    console.log("\nActivity Counts:")
    console.log(`- Invoices: ${user._count.invoices}`)
    console.log(`- Payments: ${user._count.payments}`)
    console.log(`- Clients: ${user._count.clients}`)
    console.log(`- Estimates: ${user._count.estimates}`)
    console.log(`- Credit Notes: ${user._count.creditNotes}`)
    console.log(`- Recurring Invoices: ${user._count.recurringInvoices}`)
    console.log(`- Invoice Templates: ${user._count.invoiceTemplates}`)
    console.log(`- Sent Emails: ${user._count.sentEmails}`)
    console.log(`- Blog Posts: ${user._count.posts}`)
    console.log(`- Notes: ${user._count.notes}`)
    console.log(`- Tasks: ${user._count.tasks}`)
    console.log(`- Time Logs: ${user._count.timeLogs}`)

    // Let's also fetch a quick summary of the invoices
    const invoices = await prisma.invoice.findMany({
        where: { userId: user.id },
        select: {
            invoiceNumber: true,
            total: true,
            currency: true,
            paymentStatus: true,
            type: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    })

    if (invoices.length > 0) {
        console.log("\nRecent Invoices:")
        for (const inv of invoices) {
            console.log(`  - ${inv.invoiceNumber}: ${inv.type} for ${inv.currency} ${inv.total} (${inv.paymentStatus}) created at ${inv.createdAt}`)
        }
    }

    // Let's also fetch clients
    const clients = await prisma.client.findMany({
        where: { userId: user.id },
        select: {
            name: true,
            email: true
        },
        take: 5
    })

    if (clients.length > 0) {
        console.log("\nClients:")
        for (const client of clients) {
            console.log(`  - ${client.name} (${client.email || 'No email'})`)
        }
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
