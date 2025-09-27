import { Pool } from "pg";

let pool: Pool | null = null;

const connectDB = (connectionString: string) => {
  try {
    // Parse the connection string to check if it's a Render URL
    const isRenderDB = connectionString.includes('render.com');
    
    pool = new Pool({
      connectionString: connectionString,
      ssl:
        process.env.NODE_ENV === "production" || isRenderDB
          ? { rejectUnauthorized: false }
          : false,
      // Optimized connection pool configuration for Render
      max: isRenderDB ? 10 : 20, // Render has connection limits
      min: 1, // Keep at least one connection
      idleTimeoutMillis: 20000, // Close idle clients after 20 seconds (Render closes idle connections)
      connectionTimeoutMillis: 15000, // Increase timeout for Render
      maxUses: 5000, // Lower for Render to prevent stale connections
      allowExitOnIdle: false,
      // Connection keep-alive settings for Render
      keepAlive: true,
      keepAliveInitialDelayMillis: 0,
      // Add application name for debugging
      application_name: 'social_app_backend',
    });

    // Handle connection errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't exit the process, just log the error
    });

    // Test the connection with retry logic
    return retryConnection(pool, 3);
  } catch (err) {
    console.error("Error creating PostgreSQL pool:", err);
    throw err;
  }
};

// Helper function to retry connections
const retryConnection = async (pool: Pool, retries: number): Promise<Pool> => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log("PostgreSQL database connected successfully");
      client.release();
      return pool;
    } catch (err) {
      console.error(`PostgreSQL connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) {
        throw err;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Failed to connect after all retries");
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

// Health check function to test database connectivity
const healthCheck = async (): Promise<boolean> => {
  try {
    if (!pool) {
      return false;
    }
    
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

// Function to get connection pool stats
const getPoolStats = () => {
  if (!pool) {
    return null;
  }
  
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
};

// Utility function for safe queries with error handling and retry logic
const query = async (text: string, params?: any[], retries: number = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await getDB().query(text, params);
      return result;
    } catch (error: any) {
      console.error(`Database query error (attempt ${i + 1}):`, error);
      
      // If it's a connection reset error and we have retries left, try again
      if ((error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') && i < retries) {
        console.log(`Retrying query in ${(i + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
        continue;
      }
      
      throw error;
    }
  }
};

export default connectDB;
export { getDB, closeDB, query, healthCheck, getPoolStats };
