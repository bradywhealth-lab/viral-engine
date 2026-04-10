// One-time script to clear all seeded profiles from the database.
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  // Check what exists
  const before = await pool.query('SELECT id, name, niche FROM "Profile"');
  console.log(`Found ${before.rows.length} profiles:`, before.rows.map(r => r.name));

  // Delete all - cascade handles content, trends, giveaways
  // But we need to delete children first if no cascade at DB level
  await pool.query('DELETE FROM "GiveawayCampaign"');
  await pool.query('DELETE FROM "TrendAlert"');
  await pool.query('DELETE FROM "ContentItem"');
  const result = await pool.query('DELETE FROM "Profile"');
  console.log(`Deleted ${result.rowCount} profiles and all associated data.`);

  // Verify
  const after = await pool.query('SELECT count(*) FROM "Profile"');
  console.log(`Profiles remaining: ${after.rows[0].count}`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
