import pg from "pg";
import "dotenv/config";
const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://admin:password@localhost:5432/PGmanagement",
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL database client ✅");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error:", err.message);
});

// Test connection on startup
const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database ping successful at:", res.rows[0].now);
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error.message,
      "\n👉 Make sure your Docker container is running: docker compose up -d"
    );
  }
};

testConnection();

export default pool;
