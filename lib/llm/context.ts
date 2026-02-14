import { prisma } from '@/lib/db';

/**
 * Enhanced Context for LLM Prompts (RAG)
 * Fetches relevant client data and invoice history to help the AI understand context.
 */

export interface SmartContextData {
    clients: string[];
    recentItems: string[];
    businessInfo: string;
}

/**
 * Get formatted context string for the LLM system prompt
 */
export async function getSmartContext(userId: string): Promise<string> {
    try {
        const context = await fetchContextData(userId);

        if (!context) return '';

        let contextString = `\n\n[SMART CONTEXT]\n`;

        // 1. Business Info
        if (context.businessInfo) {
            contextString += `Based on the user's business profile:\n${context.businessInfo}\n\n`;
        }

        // 2. Client Registry
        if (context.clients.length > 0) {
            contextString += `KNOWN CLIENTS (Use these details if name matches):\n`;
            context.clients.forEach(client => {
                contextString += `- ${client}\n`;
            });
            contextString += `\n`;
        }

        // 3. Common Services/Products
        if (context.recentItems.length > 0) {
            contextString += `COMMON SERVICES/PRODUCTS (Use these rates if specified):\n`;
            context.recentItems.forEach(item => {
                contextString += `- ${item}\n`;
            });
            contextString += `\n`;
        }

        return contextString;
    } catch (error) {
        console.error('Error fetching smart context:', error);
        return '';
    }
}

/**
 * Fetch raw data for context
 */
async function fetchContextData(userId: string): Promise<SmartContextData | null> {
    try {
        // 1. Fetch recent clients (top 20 active)
        const clients = await prisma.client.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 20,
            select: {
                name: true,
                email: true,
                phone: true,
                address: true,
                city: true
            }
        });

        // Format clients
        const formattedClients = clients.map(c => {
            let details = c.name;
            if (c.email) details += `, ${c.email}`;
            if (c.phone) details += `, ${c.phone}`;
            if (c.address) details += `, ${c.address}`;
            if (c.city) details += `, ${c.city}`;
            return details;
        });

        // 2. Fetch recent invoice items to learn products/services
        // We'll process the last 20 invoices
        const invoices = await prisma.invoice.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { lineItems: true }
        });

        const itemSet = new Set<string>();

        invoices.forEach(inv => {
            if (Array.isArray(inv.lineItems)) {
                inv.lineItems.forEach((item: any) => {
                    if (item.description && item.rate) {
                        // "Web Design ($500.00)"
                        itemSet.add(`${item.description} @ ${item.rate}`);
                    }
                });
            }
        });

        // Take top 15 items
        const recentItems = Array.from(itemSet).slice(0, 15);

        // 3. Fetch Company Defaults (Business Info)
        const companyDefaults = await prisma.companyDefaults.findUnique({
            where: { userId },
            select: {
                companyInfo: true,
                defaultCurrency: true,
                defaultTaxRate: true
            }
        });

        let businessInfo = '';
        if (companyDefaults) {
            const info = companyDefaults.companyInfo as any;
            businessInfo = `My Business: ${info?.name || 'Unknown'}`;
            if (companyDefaults.defaultCurrency) businessInfo += `, Default Currency: ${companyDefaults.defaultCurrency}`;
            if (companyDefaults.defaultTaxRate) businessInfo += `, Default Tax: ${companyDefaults.defaultTaxRate}%`;
        }

        return {
            clients: formattedClients,
            recentItems,
            businessInfo
        };

    } catch (error) {
        console.error('Error in fetchContextData:', error);
        return null;
    }
}
