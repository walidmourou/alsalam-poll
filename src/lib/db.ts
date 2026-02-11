import mysql from "mysql2/promise";

// MySQL connection configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "alsalam",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Singleton pattern to ensure only one connection pool
let pool: mysql.Pool | null = null;

function getDatabase(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);

    // Initialize database on first connection
    initializeDatabase();
  }
  return pool;
}

async function initializeDatabase() {
  const connection = await pool!.getConnection();

  try {
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'volunteers'");

    if ((tables as any[]).length > 0) {
      // Table exists, check its structure
      const [columns] = (await connection.query(
        "SHOW COLUMNS FROM volunteers",
      )) as any[];

      const hasFullName = columns.some((col: any) => col.Field === "full_name");
      const hasFirstName = columns.some(
        (col: any) => col.Field === "first_name",
      );
      const hasLastName = columns.some((col: any) => col.Field === "last_name");

      if (hasFullName && !hasFirstName) {
        // Old schema: migrate from full_name to first_name and last_name
        console.log("Migrating from full_name to first_name/last_name...");

        await connection.query(
          "ALTER TABLE volunteers ADD COLUMN first_name VARCHAR(255)",
        );
        await connection.query(
          "ALTER TABLE volunteers ADD COLUMN last_name VARCHAR(255)",
        );

        await connection.query(`
          UPDATE volunteers 
          SET first_name = CASE 
            WHEN LOCATE(' ', full_name) > 0 
            THEN SUBSTRING(full_name, 1, LOCATE(' ', full_name) - 1)
            ELSE full_name
          END,
          last_name = CASE 
            WHEN LOCATE(' ', full_name) > 0 
            THEN SUBSTRING(full_name, LOCATE(' ', full_name) + 1)
            ELSE ''
          END
        `);

        console.log("Migration completed successfully");
      }
    } else {
      // Table doesn't exist, create with new schema
      await connection.query(`
        CREATE TABLE volunteers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          date VARCHAR(10) NOT NULL,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_date (date),
          INDEX idx_phone_date (phone_number, date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      console.log("Created volunteers table with new schema");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

// Graceful shutdown
if (typeof process !== "undefined") {
  const cleanup = async () => {
    if (pool) {
      try {
        await pool.end();
        console.log("Database connection pool closed");
      } catch (error) {
        console.error("Error closing database pool:", error);
      }
    }
  };

  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
  process.on("exit", cleanup);
}

// Export the pool instance
export default getDatabase();
