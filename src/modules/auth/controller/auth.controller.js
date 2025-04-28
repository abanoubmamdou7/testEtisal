import sql from 'mssql';
import { asyncHandler } from '../../../utils/errorHandling.js';

const masterDBConfig = {
    user: "sa",             // => sa
    password: "123@123qw",     // => 123@123qw
    server: "192.168.1.47",            // => 192.168.1.47
    database: "CLIENT_LICNESE",          // => ORFANIDES
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

const masterDB = new sql.ConnectionPool(masterDBConfig);


const connectToMasterDB = async () => {
    try {
        await masterDB.connect();
    } catch (error) {
        throw new Error('Unable to connect to the master database');
    }
};
const findClientIdByEmail = async (email) => {
    const request = masterDB.request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
    SELECT CLIENT_ID FROM USERS WHERE Email = @email
  `);

    if (result.recordset.length === 0) throw new Error('Email not found.');

    return result.recordset[0].CLIENT_ID;
};

// Find database connection info by client ID
const findConnectionInfoByClientId = async (clientId) => {
    const request = masterDB.request();
    request.input('clientId', sql.NVarChar, clientId);

    const result = await request.query(`
      SELECT SQL_USER, SQL_USR_PASS, SQL_DB_NAME, SQL_SRV_IP
      FROM CLIENT_LICENSE_DATA
      WHERE CLIENT_ID = @clientId
    `);

    if (result.recordset.length === 0) throw new Error('Client info not found.');

    return result.recordset[0];
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





const baseDBConfig = {
    user: "sa",             // => sa
    password: "123@123qw",   // => 123@123qw
    server: "192.168.1.47",  // => 192.168.1.47
    port: Number(process.env.DB_PORT) || 1433,  // => 1433
    options: {
        encrypt: false,  // Correct, since your server isn't Azure
        trustServerCertificate: true,  // Correct, matches TrustServerCertificate=True
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

// Function to connect to any database dynamically
const connectToDatabase = async (databaseName) => {
    const customDBConfig = { ...baseDBConfig, database: databaseName }; // Dynamically set the database name
    const dbConnection = new sql.ConnectionPool(customDBConfig);

    try {
        await dbConnection.connect(); // Connect to the specified database
        console.log(`Successfully connected to the ${databaseName} database.`);
        return dbConnection; // Return the connection instance
    } catch (error) {
        throw new Error(`Unable to connect to the ${databaseName} database: ${error.message}`);
    }
};




// Login controller
export const login = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    await connectToMasterDB();

    const clientId = await findClientIdByEmail(email);

    const connInfo = await findConnectionInfoByClientId(clientId);

    const clientDB = await createClientConnection(connInfo);
    const databaseName = clientDB.config.database
    res.json({ message: "success", databaseName });
    await connectToDatabase(databaseName)
})

