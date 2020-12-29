const useraccountModel = require('../../models/useraccount.model');
const checkingAccountModel = require('../../models/checkingaccount.model');
const savingAccountModel = require('../../models/savingaccount.model');
const moment = require('moment');
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
    checkingAccountInfo[0].DateCreate = moment(checkingAccountInfo[0].DateCreate).format('DD-MM-YYYY');
    let savingAccountInfo = await savingAccountModel.getByUserID(userId);


    if (savingAccountInfo.length === 0) {
        savingAccountInfo = [{ AccountNumber: '' }]
    } else {
        for (let index = 0; index < savingAccountInfo.length; index++) {
            savingAccountInfo[index].DateCreate = moment(savingAccountInfo[index].DateCreate).format('DD-MM-YYYY');
        }
    }

    return res.json({
        authenticated: true,
        accessToken: accessToken,
        userInfo: result,
        checkingAccountInfo: checkingAccountInfo[0],
        savingAccountInfo: savingAccountInfo,
        message: 'Login successfully'
    })
})


const generateAccessToken = userId => {
    const payload = { userId };
    return accessToken = jwt.sign(payload, "secretkey");
}

module.exports = router;