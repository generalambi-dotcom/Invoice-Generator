const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" });
async function main() {
  await client.connect();
  const res = await client.query("SELECT message, metadata, \"createdAt\" FROM \"SystemLog\" WHERE message ILIKE '%Stripe%' ORDER BY \"createdAt\" DESC LIMIT 10");
  console.log("=== STRIPE ERRORS ===");
  res.rows.forEach(row => {
      console.log(`[${row.createdAt}] ${row.message}`);
      console.log(`Metadata: ${JSON.stringify(row.metadata)}\n`);
  });
  await client.end();
}
main().catch(console.error);
