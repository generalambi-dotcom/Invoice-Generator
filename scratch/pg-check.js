const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" });
async function main() {
  await client.connect();
  const res1 = await client.query("SELECT id, name, email, \"subscriptionStatus\" FROM \"User\" WHERE \"subscriptionPlan\" = 'premium'");
  console.log("=== PREMIUM USERS ===");
  console.table(res1.rows);
  const res2 = await client.query("SELECT message, \"createdAt\" FROM \"SystemLog\" WHERE category = 'payment' AND message ILIKE '%premium%' ORDER BY \"createdAt\" DESC LIMIT 5");
  console.log("=== PAYMENT LOGS ===");
  console.table(res2.rows);
  await client.end();
}
main().catch(console.error);
