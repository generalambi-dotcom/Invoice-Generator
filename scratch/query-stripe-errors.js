const { Client } = require("pg");
const client = new Client({ connectionString: "postgresql://postgres:Se7jgN3dWrILXOD6@db.qilqsaqccplzqnlfrzab.supabase.co:5432/postgres" });
async function main() {
  await client.connect();
  const res = await client.query("SELECT id, name, email FROM \"User\" WHERE id = 'cmjsve5yd000004jsf916ipm2'");
  console.log("=== USER CMJSVE5YD000004JSF916IPM2 ===");
  console.table(res.rows);
  await client.end();
}
main().catch(console.error);
