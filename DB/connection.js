import sql from 'mssql';

// Base configuration that can be extended
const baseDBConfig = {
    user: "sa",
    password: "123@123qw",
    server: "192.168.1.47",
    port: Number(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

// Master DB configuration
const masterDBConfig = {
    ...baseDBConfig,
    database: "CLIENT_LICNESE"
};

// Master DB connection pool
const masterDB = new sql.ConnectionPool(masterDBConfig);

// Connect to master DB
const connectToMasterDB = async () => {
    try {
        await masterDB.connect();
        return masterDB;
    } catch (error) {
        throw new Error('Unable to connect to the master database');
    }
};

// Function to connect to any database dynamically
const connectToDatabase = async (databaseName) => {
    const customDBConfig = { ...baseDBConfig, database: databaseName };
    const dbConnection = new sql.ConnectionPool(customDBConfig);

    try {
        await dbConnection.connect();
        console.log(`Successfully connected to the ${databaseName} database.`);
        return dbConnection;
    } catch (error) {
        throw new Error(`Unable to connect to the ${databaseName} database: ${error.message}`);
    }
};

// Create a dynamic connection to client database
const createClientConnection = async (connInfo) => {
    const clientDB = new sql.ConnectionPool({
        user: connInfo.SQL_USER,
        password: connInfo.SQL_USR_PASS,
        server: connInfo.SQL_SRV_IP.trim(),
        database: connInfo.SQL_DB_NAME,
        options: { encrypt: false, trustServerCertificate: true }
    });

    await clientDB.connect();
    return clientDB;
};

export {
    masterDB,
    connectToMasterDB,
    connectToDatabase,
    createClientConnection
};