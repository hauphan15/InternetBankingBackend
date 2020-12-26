const useraccountModel = require('../../models/useraccount.model');
const checkingAccountModel = require('../../models/checkingaccount.model');
const savingAccountModel = require('../../models/savingaccount.model');
const jwt = require("jsonwebtoken");
const express = require('express');

const router = express.Router();

router.post('/', async(req, res) => {
    const result = await useraccountModel.login(req.body);

    if (result === null) {
        return res.json({
            authenticated: false,
            message: 'Login failed'
        });
    }

    const userId = result.ID;
    const accessToken = generateAccessToken(userId);
    const checkingAccountInfo = await checkingAccountModel.getByID(userId);
    let savingAccountInfo = await savingAccountModel.getByUserID(userId);
    if (savingAccountInfo.length === 0) {
        savingAccountInfo = [{ AccountNumber: '' }]
    }

    return res.json({
        authenticated: true,
        accessToken: accessToken,
        userInfo: result,
        checkingAccountInfo: checkingAccountInfo[0],
        savingAccountInfo: savingAccountInfo[0],
        message: 'Login successfully'
    })
})


const generateAccessToken = userId => {
    const payload = { userId };
    return accessToken = jwt.sign(payload, "secretkey");
}

module.exports = router;