import sql from 'mssql';
import { masterDB } from './connection.js';

const findClientIdByEmail = async (email) => {
    const request = masterDB.request();
    request.input('email', sql.NVarChar, email);

    const result = await request.query(`
        SELECT CLIENT_ID FROM USERS WHERE Email = @email
    `);

    if (result.recordset.length === 0) throw new Error('Email not found.');

    return result.recordset[0].CLIENT_ID;
};
const findClientIdByUserName = async (username,password) => {
    const request = masterDB.request();
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);


    const result = await request.query(`
        SELECT CLIENT_ID FROM USERS WHERE UserName = @username AND password = @password
    `);

    if (result.recordset.length === 0) throw new Error('Username not found.');

    return result.recordset[0].CLIENT_ID;
};

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

export {
    findClientIdByEmail,
    findConnectionInfoByClientId,
    findClientIdByUserName    
};