import { asyncHandler } from '../../../utils/errorHandling.js';
import { connectToMasterDB, createClientConnection, connectToDatabase } from '../../../../DB/connection.js';
import { findClientIdByEmail, findConnectionInfoByClientId } from '../../../../DB/quires.js';

export const login = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    await connectToMasterDB();

    const clientId = await findClientIdByEmail(email);
    const connInfo = await findConnectionInfoByClientId(clientId);
    const clientDB = await createClientConnection(connInfo);
    const databaseName = clientDB.config.database;
    res.cookie("clientId", clientId, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });

    res.json({
        message: "success",
        databaseName,
        clientId
    });
    await connectToDatabase(databaseName)
});

