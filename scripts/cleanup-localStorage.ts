/**
 * LocalStorage Cleanup Script
 * Removes legacy localStorage data after migration to database
 * 
 * IMPORTANT: Only run this AFTER confirming all data has been migrated to database!
 * 
 * Run with: npx tsx scripts/cleanup-localStorage.ts
 * Or use the browser version below
 */

/**
 * BROWSER VERSION (Recommended - Run in browser console)
 * Copy and paste this into browser console:
 */
const browserCleanupScript = `
// Cleanup localStorage after migration
const cleanupLocalStorage = () => {
  console.log('🧹 Starting localStorage cleanup...');
  
  // List of keys to remove
  const keysToRemove = [
    'invoices_', // Invoice storage (user-specific)
    'company_defaults', // Company defaults
    'deleted_invoices_', // Deleted invoices (user-specific)
  ];
  
  // Get all localStorage keys
  const allKeys = Object.keys(localStorage);
  
  // Find keys to remove
  const keysFound = [];
  allKeys.forEach(key => {
    keysToRemove.forEach(pattern => {
      if (key.startsWith(pattern)) {
        keysFound.push(key);
      }
    });
  });
  
  if (keysFound.length === 0) {
    console.log('✅ No legacy data found in localStorage');
    return;
  }
  
  console.log('📋 Found keys to remove:');
  keysFound.forEach(key => console.log(`   - ${key}`));
  
  // Ask for confirmation
  const confirmed = confirm(
    'Found ' + keysFound.length + ' localStorage keys with legacy data.\\n\\n' +
    'Are you sure you want to remove them?\\n\\n' +
    'Make sure all data has been migrated to database first!'
  );
  
  if (!confirmed) {
    console.log('❌ Cleanup cancelled');
    return;
  }
  
  // Remove keys
  let removedCount = 0;
  keysFound.forEach(key => {
    try {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  });
  
  console.log(`\\n✅ Cleanup complete! Removed ${removedCount} keys.`);
  console.log('💡 Your data is now stored in the database.');
};

// Run cleanup
cleanupLocalStorage();
`;

/**
 * NODE.JS VERSION (For automated cleanup)
 * Note: This requires access to localStorage, which is typically only available in browser
 * The browser version above is recommended for manual cleanup
 */
function nodeCleanupInstructions() {
  console.log('🧹 LocalStorage Cleanup Instructions\n');
  console.log('⚠️  Note: localStorage is browser-only. Use the browser script above.\n');
  console.log('📝 Browser Cleanup Steps:');
  console.log('   1. Make sure all data has been migrated to database');
  console.log('   2. Verify you can access all your data via the application');
  console.log('   3. Open browser console (F12)');
  console.log('   4. Copy and paste the browser cleanup script');
  console.log('   5. Confirm removal when prompted\n');
  console.log('📋 Keys that will be removed:');
  console.log('   - invoices_* (invoice storage)');
  console.log('   - company_defaults (company defaults)');
  console.log('   - deleted_invoices_* (deleted invoices)\n');
}

// Export for use in other scripts
export { browserCleanupScript, nodeCleanupInstructions };

// Show instructions if run directly
if (require.main === module) {
  nodeCleanupInstructions();
}

