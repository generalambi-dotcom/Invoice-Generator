/**
 * Data Migration Script
 * Migrates data from localStorage to database
 * 
 * Run with: npx tsx scripts/migrate-localStorage-to-db.ts
 * Or: node --loader ts-node/esm scripts/migrate-localStorage-to-db.ts
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Initialize Prisma with adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

/**
 * Sample localStorage data structure (for reference)
 * This script assumes data is exported from localStorage
 */
interface LocalStorageUser {
  id: string;
  email: string;
  name: string;
  password?: string; // Hashed password
  createdAt: string;
  isAdmin?: boolean;
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
  };
}

interface LocalStorageInvoice {
  id: string;
  userId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  purchaseOrder?: string;
  companyInfo: any;
  clientInfo: any;
  shipToInfo?: any;
  lineItems: any[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  shipping?: number;
  total: number;
  currency: string;
  theme?: string;
  notes?: string;
  bankDetails?: string;
  terms?: string;
  paymentStatus?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  paymentLink?: string;
  paymentProvider?: 'paypal' | 'paystack' | 'stripe';
  paidAmount?: number;
  createdAt?: string;
  deletedAt?: string;
}

/**
 * Export localStorage data (run this in browser console first)
 */
const exportLocalStorageScript = `
// Run this in browser console to export localStorage data
const exportData = {
  users: [],
  invoices: [],
  companyDefaults: {},
};

// Export users
const usersKey = 'invoice_users';
const usersData = localStorage.getItem(usersKey);
if (usersData) {
  exportData.users = JSON.parse(usersData);
}

// Export invoices (for each user)
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('invoices_')) {
    const userId = key.replace('invoices_', '');
    const invoices = JSON.parse(localStorage.getItem(key) || '[]');
    exportData.invoices.push(...invoices.map((inv: any) => ({ ...inv, userId })));
  }
});

// Export company defaults
const defaultsKey = 'company_defaults';
const defaultsData = localStorage.getItem(defaultsKey);
if (defaultsData) {
  exportData.companyDefaults = JSON.parse(defaultsData);
}

// Download as JSON
const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'localStorage-export.json';
a.click();
`;

/**
 * Migrate users from localStorage to database
 */
async function migrateUsers(users: LocalStorageUser[]): Promise<Map<string, string>> {
  const userIdMap = new Map<string, string>(); // oldId -> newId
  
  console.log(`\n📦 Migrating ${users.length} users...`);
  
  for (const user of users) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });
      
      if (existing) {
        console.log(`  ⚠️  User ${user.email} already exists, skipping...`);
        userIdMap.set(user.id, existing.id);
        continue;
      }
      
      // Hash password if provided (if not, generate a random one)
      let hashedPassword = user.password;
      if (!hashedPassword) {
        // Generate a random password (user will need to reset)
        hashedPassword = bcrypt.hashSync(Math.random().toString(36), 10);
        console.log(`  ⚠️  User ${user.email} has no password, generated random password`);
      } else if (!hashedPassword.startsWith('$2')) {
        // If password is not hashed, hash it
        hashedPassword = bcrypt.hashSync(hashedPassword, 10);
      }
      
      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
          subscriptionPlan: user.subscription?.plan || 'free',
          subscriptionStatus: user.subscription?.status || 'active',
          isAdmin: user.subscription?.plan === 'premium' || user.isAdmin || false,
        },
      });
      
      userIdMap.set(user.id, newUser.id);
      console.log(`  ✅ Migrated user: ${user.email} (${user.id} -> ${newUser.id})`);
    } catch (error: any) {
      console.error(`  ❌ Error migrating user ${user.email}:`, error.message);
    }
  }
  
  return userIdMap;
}

/**
 * Migrate invoices from localStorage to database
 */
async function migrateInvoices(
  invoices: LocalStorageInvoice[],
  userIdMap: Map<string, string>
): Promise<void> {
  console.log(`\n📦 Migrating ${invoices.length} invoices...`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const invoice of invoices) {
    try {
      // Map old userId to new userId
      let newUserId: string | undefined;
      if (invoice.userId) {
        newUserId = userIdMap.get(invoice.userId);
        if (!newUserId) {
          console.log(`  ⚠️  Invoice ${invoice.invoiceNumber} has unknown userId, skipping...`);
          skipCount++;
          continue;
        }
      }
      
      // Check if invoice already exists
      if (newUserId) {
        const existing = await prisma.invoice.findFirst({
          where: {
            userId: newUserId,
            invoiceNumber: invoice.invoiceNumber,
          },
        });
        
        if (existing) {
          console.log(`  ⚠️  Invoice ${invoice.invoiceNumber} already exists, skipping...`);
          skipCount++;
          continue;
        }
      }
      
      // Create invoice
      await prisma.invoice.create({
        data: {
          userId: newUserId || 'unknown', // Will need to handle this case
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: new Date(invoice.invoiceDate),
          dueDate: new Date(invoice.dueDate),
          purchaseOrder: invoice.purchaseOrder || null,
          companyInfo: invoice.companyInfo,
          clientInfo: invoice.clientInfo,
          shipToInfo: invoice.shipToInfo || null,
          lineItems: invoice.lineItems,
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate || 0,
          taxAmount: invoice.taxAmount || 0,
          discountRate: invoice.discountRate || 0,
          discountAmount: invoice.discountAmount || 0,
          shipping: invoice.shipping || 0,
          total: invoice.total,
          currency: invoice.currency || 'USD',
          theme: invoice.theme || 'default',
          notes: invoice.notes || null,
          bankDetails: invoice.bankDetails || null,
          terms: invoice.terms || null,
          paymentStatus: invoice.paymentStatus || 'pending',
          paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : null,
          paymentLink: invoice.paymentLink || null,
          paymentProvider: invoice.paymentProvider || null,
          // Note: deletedAt is not in the schema - deleted invoices are handled differently
        },
      });
      
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`  ✅ Migrated ${successCount} invoices...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error migrating invoice ${invoice.invoiceNumber}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Migration complete:`);
  console.log(`   - Success: ${successCount}`);
  console.log(`   - Skipped: ${skipCount}`);
  console.log(`   - Errors: ${errorCount}`);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting data migration from localStorage to database...\n');
  
  try {
    // Load exported data (you need to provide this file)
    // For now, we'll use a placeholder structure
    const exportedData = {
      users: [] as LocalStorageUser[],
      invoices: [] as LocalStorageInvoice[],
    };
    
    // In production, load from file:
    // const fs = require('fs');
    // const exportedData = JSON.parse(fs.readFileSync('localStorage-export.json', 'utf-8'));
    
    console.log('📋 Migration plan:');
    console.log(`   - Users: ${exportedData.users.length}`);
    console.log(`   - Invoices: ${exportedData.invoices.length}`);
    console.log('\n⚠️  To use this script:');
    console.log('   1. Run the export script in browser console');
    console.log('   2. Save the exported JSON file');
    console.log('   3. Update this script to load from that file');
    console.log('   4. Run: npx tsx scripts/migrate-localStorage-to-db.ts\n');
    
    if (exportedData.users.length === 0 && exportedData.invoices.length === 0) {
      console.log('⚠️  No data to migrate. Please export localStorage data first.');
      return;
    }
    
    // Migrate users first
    const userIdMap = await migrateUsers(exportedData.users);
    
    // Migrate invoices
    await migrateInvoices(exportedData.invoices, userIdMap);
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate().catch(console.error);
}

export { migrate, migrateUsers, migrateInvoices };

