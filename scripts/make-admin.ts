import { prisma } from '../lib/db';

async function makeUserAdmin(email: string) {
  try {
    const lowerEmail = email.toLowerCase();
    
    console.log(`🔍 Looking for user: ${lowerEmail}...`);
    
    // First check if user exists using Prisma raw query
    const existingUser = await prisma.$queryRaw<Array<{id: string, email: string, name: string, isAdmin: boolean}>>`
      SELECT id, email, name, "isAdmin" FROM "User" WHERE email = ${lowerEmail}
    `;

    if (existingUser.length === 0) {
      console.error(`\n❌ User with email ${email} not found in database.`);
      console.log('\n💡 Please make sure you have signed up first at /signup');
      return false;
    }

    const user = existingUser[0];
    
    if (user.isAdmin) {
      console.log(`\n✅ User ${email} is already an admin!`);
      return true;
    }

    console.log(`📝 Found user: ${user.name} (${user.email})`);
    console.log(`   Current isAdmin: ${user.isAdmin}`);
    console.log(`\n🔄 Updating user to admin...`);

    // Update user to admin using raw SQL
    const updateResult = await prisma.$executeRaw`
      UPDATE "User" SET "isAdmin" = true WHERE email = ${lowerEmail}
    `;
    
    if (updateResult === 0) {
      console.error(`\n❌ Failed to update user. No rows affected.`);
      return false;
    }
    
    // Get updated user
    const updatedUser = await prisma.$queryRaw<Array<{id: string, email: string, name: string, isAdmin: boolean}>>`
      SELECT id, email, name, "isAdmin" FROM "User" WHERE email = ${lowerEmail}
    `;
    
    console.log(`\n✅ Successfully made ${updatedUser[0].email} an admin!`);
    console.log(`   Name: ${updatedUser[0].name}`);
    console.log(`   Email: ${updatedUser[0].email}`);
    console.log(`   isAdmin: ${updatedUser[0].isAdmin}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Sign out (if you're logged in)`);
    console.log(`   2. Sign in again at /signin`);
    console.log(`   3. Access admin dashboard at /admin`);
    return true;
  } catch (error: any) {
    console.error('\n❌ Error making user admin:');
    console.error('   Message:', error.message || 'Unknown error');
    console.error('   Code:', error.code || 'N/A');
    if (error.meta) {
      console.error('   Meta:', error.meta);
    }
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
const email = 'sokanpete@gmail.com';
makeUserAdmin(email).catch(console.error);
