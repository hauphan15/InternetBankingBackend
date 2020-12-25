const useraccountModel = require('../../models/useraccount.model');
const jwt = require("jsonwebtoken");
const express = require('express');

const router = express.Router();

router.post('/', async(req, res) => {
    const result = await useraccountModel.login(req.body);

    if (result === null) {
        return res.json({
            authenticated: false,
            message: 'dang nhap that bai'
        });
    }

    const userId = result.ID;
    const accessToken = generateAccessToken(userId);

    return res.json({
        authenticated: true,
        accessToken: accessToken,
        userInfo: result,
        message: 'dang nhap thanh cong'
    })
})


const generateAccessToken = userId => {
    const payload = { userId };
    return accessToken = jwt.sign(payload, "secretkey");
}

module.exports = router;