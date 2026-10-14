import pg from "pg";
import "dotenv/config";
const { Pool } = pg;

const pool = new Pool({
    connectionString: "postgresql://admin:password@localhost:5432/mydatabase",
})

pool.on("connect", () => {
    console.log("connected to database");
})

// Create tables on startup
const initDB = async () => {
    const query = `CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;
    await pool.query(query);
    console.log("Tables initialized ✅");
}

initDB().catch(console.error);

export default pool

