/**
 * Company Defaults Migration Script
 * Migrates company defaults from localStorage to database
 * 
 * Run with: npx tsx scripts/migrate-company-defaults.ts
 * 
 * This script should be run in the browser console to export data,
 * then run the migration script to import into database.
 */

/**
 * EXPORT SCRIPT (Run in browser console first)
 * Copy and paste this into browser console while logged in:
 */
const exportScript = `
// Export company defaults from localStorage
const exportCompanyDefaults = () => {
  const defaultsKey = 'company_defaults';
  const data = localStorage.getItem(defaultsKey);
  
  if (!data) {
    console.log('No company defaults found in localStorage');
    return null;
  }
  
  try {
    const defaults = JSON.parse(data);
    console.log('Company defaults found:', defaults);
    
    // Download as JSON
    const blob = new Blob([JSON.stringify(defaults, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company-defaults-export.json';
    a.click();
    
    return defaults;
  } catch (error) {
    console.error('Error exporting company defaults:', error);
    return null;
  }
};

// Run the export
exportCompanyDefaults();
`;

/**
 * MIGRATION SCRIPT (Run via Node.js)
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma with adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

interface CompanyDefaultsExport {
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
  };
  defaultCurrency: string;
  defaultTheme: string;
  defaultTaxRate: number;
  defaultNotes?: string;
  defaultBankDetails?: string;
  defaultTerms?: string;
}

/**
 * Migrate company defaults for a user
 */
async function migrateCompanyDefaults(
  userId: string,
  defaults: CompanyDefaultsExport
): Promise<void> {
  try {
    // Check if defaults already exist
    const existing = await prisma.companyDefaults.findUnique({
      where: { userId },
    });

    if (existing) {
      console.log(`  ⚠️  Company defaults already exist for user ${userId}, updating...`);
      await prisma.companyDefaults.update({
        where: { userId },
        data: {
          companyInfo: defaults.company,
          defaultCurrency: defaults.defaultCurrency || 'USD',
          defaultTheme: defaults.defaultTheme || 'slate',
          defaultTaxRate: defaults.defaultTaxRate || 0,
          defaultNotes: defaults.defaultNotes || null,
          defaultBankDetails: defaults.defaultBankDetails || null,
          defaultTerms: defaults.defaultTerms || null,
        },
      });
      console.log(`  ✅ Updated company defaults for user ${userId}`);
    } else {
      await prisma.companyDefaults.create({
        data: {
          userId,
          companyInfo: defaults.company,
          defaultCurrency: defaults.defaultCurrency || 'USD',
          defaultTheme: defaults.defaultTheme || 'slate',
          defaultTaxRate: defaults.defaultTaxRate || 0,
          defaultNotes: defaults.defaultNotes || null,
          defaultBankDetails: defaults.defaultBankDetails || null,
          defaultTerms: defaults.defaultTerms || null,
        },
      });
      console.log(`  ✅ Created company defaults for user ${userId}`);
    }
  } catch (error: any) {
    console.error(`  ❌ Error migrating company defaults for user ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting company defaults migration from localStorage to database...\n');

  try {
    // Get user email from command line or prompt
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Please provide user email as argument:');
      console.error('   npx tsx scripts/migrate-company-defaults.ts user@example.com');
      console.error('\nOr provide exported JSON file:');
      console.error('   npx tsx scripts/migrate-company-defaults.ts user@example.com ./company-defaults-export.json');
      process.exit(1);
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`❌ User with email ${userEmail} not found in database.`);
      console.error('   Please make sure the user exists before migrating defaults.');
      process.exit(1);
    }

    console.log(`📋 Migrating defaults for user: ${user.email} (${user.id})\n`);

    // Load exported data from file or use defaults structure
    let defaults: CompanyDefaultsExport;

    const exportFilePath = process.argv[3];
    if (exportFilePath) {
      // Load from file
      const filePath = path.resolve(exportFilePath);
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      defaults = JSON.parse(fileContent);
    } else {
      // No file provided, skip migration but show instructions
      console.log('⚠️  No export file provided.');
      console.log('\n📝 Instructions:');
      console.log('   1. Open your browser and go to the application');
      console.log('   2. Open browser console (F12)');
      console.log('   3. Run the export script (see above)');
      console.log('   4. Save the downloaded JSON file');
      console.log('   5. Run: npx tsx scripts/migrate-company-defaults.ts <email> <file-path>');
      process.exit(0);
    }

    // Migrate defaults
    await migrateCompanyDefaults(user.id, defaults);

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

export { migrate, migrateCompanyDefaults, exportScript };

