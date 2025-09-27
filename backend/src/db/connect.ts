import { Pool } from "pg";

let pool: Pool | null = null;

const connectDB = (connectionString: string) => {
  try {
    console.log(
      "Connection string format check:",
      connectionString
        ? "✓ Connection string provided"
        : "✗ No connection string"
    );

    if (!connectionString) {
      throw new Error("Database connection string is required");
    }

    pool = new Pool({
      connectionString: connectionString,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      // Add connection timeout and retry settings
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20,
    });

    return pool
      .connect()
      .then((client) => {
        console.log("PostgreSQL database connected successfully");
        client.release(); // Release the client back to the pool
        return pool;
      })
      .catch((err) => {
        console.error("PostgreSQL connection error:", err);

        throw err;
      });
  } catch (err) {
    console.error("Error creating PostgreSQL pool:", err);
    throw err;
  }
};

const getDB = (): Pool => {
  if (!pool) {
    throw new Error("Database not connected. Call connectDB first.");
  }
  return pool;
};

const closeDB = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("PostgreSQL connection closed");
  }
};

// Utility function for safe queries with error handling
const query = async (text: string, params?: any[]) => {
  try {
    const result = await getDB().query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

export default connectDB;
export { getDB, closeDB, query };
