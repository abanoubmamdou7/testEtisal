import { asyncHandler } from '../../../utils/errorHandling.js';
import { connectToMasterDB, createClientConnection, connectToDatabase } from '../../../../DB/connection.js';
import { findClientIdByEmail, findClientIdByUserName, findConnectionInfoByClientId } from '../../../../DB/quires.js';

// export const login = asyncHandler(async (req, res, next) => {
//     const { email } = req.body;

//     if (!email) return res.status(400).json({ message: 'Email is required' });

//     await connectToMasterDB();

//     const clientId = await findClientIdByEmail(email);
//     const connInfo = await findConnectionInfoByClientId(clientId);
//     const clientDB = await createClientConnection(connInfo);
//     const databaseName = clientDB.config.database;
//     res.cookie("clientId", clientId, {
//         httpOnly: true,
//         sameSite: "None",
//         secure: true,
//     });    
//     res.json({
//         message: "success",
//         databaseName,
//         clientId
//     });
//     await connectToDatabase(databaseName)
// });

export const login = asyncHandler(async (req, res, next) => {
    const { userName ,password} = req.body;

    if (!userName || !password) return res.status(400).json({ message: 'userName and password is required' });

    await connectToMasterDB();

    const clientId = await findClientIdByUserName(userName,password);
    const connInfo = await findConnectionInfoByClientId(clientId);
    const clientDB = await createClientConnection(connInfo);
    const databaseName = clientDB.config.database;
    res.cookie("clientId", clientId, {
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
