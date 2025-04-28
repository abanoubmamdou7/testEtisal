import sql from 'mssql';

const connectDB = async () => {
    try {
        if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
            throw new Error("Database connection details are missing in environment variables.");
        }

    const dbConfig = {
      user: process.env.DB_USER,             // => sa
      password: process.env.DB_PASSWORD,     // => 123@123qw
      server: process.env.DB_HOST,            // => 192.168.1.47
      database: process.env.DB_NAME,          // => ORFANIDES
      port: Number(process.env.DB_PORT) || 1433,  // => 1433
      options: {
        encrypt: false,  // Correct, since your server isn't Azure
        trustServerCertificate: true,  // Correct, matches TrustServerCertificate=True
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      }
    };

    const pool = new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log(`Database connected successfully to ${process.env.DB_NAME} at ${process.env.DB_HOST}`);

    return pool;
  } catch (error) {
    console.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;