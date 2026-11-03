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

// Initialize DB and test connection
export const initDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database ping successful at:", res.rows[0].now);

    const query = `CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("Tables initialized ✅");
  } catch (error) {
    console.error(
      "❌ Database connection failed:",
      error.message,
      "\n👉 Make sure your Docker container is running: docker compose up -d"
    );
  }
};

initDB();

export default pool;
