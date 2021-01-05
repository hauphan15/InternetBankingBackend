const useraccountModel = require('../../models/useraccount.model');
const userprofileModel = require('../../models/userprofile.model');
const otpcodeModel = require('../../models/otpcode.model');
const nodemailer = require('nodemailer');
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

    return res.json({
        authenticated: true,
        accessToken: accessToken,
        userInfo: result,
        message: 'Login successfully'
    })
})

//verify OTP - forgot password
router.post('/forgot-password/verify-otp', async(req, res) => {
    const OTP = req.headers['x-otp-code'];
    const userAccount = await useraccountModel.getByUserName(req.body.username)
    const userOTP = await otpcodeModel.getByID(userAccount[0].ID);

    if (OTP !== userOTP[0].Code) {
        return res.send({
            success: false,
            message: 'Invalid OTP Code'
        })
    }

    return res.send({
        success: true,
        message: 'Valid OTP Code'
    })
})

//reset password - forgotpassword
router.post('/forgot-password/reset-password', async(req, res) => {
    const userAccount = await useraccountModel.getByUserName(req.body.username);

    const result = await useraccountModel.changePassword(userAccount[0].ID, req.body.newPassword);

    return res.send({
        success: true,
        message: 'Reset password successfully',
        result
    })
})

//gửi mã OTP đến email khách hàng
router.post('/forgot-password/send-otp', async(req, res) => {
    const OTP = createOTP();

    //email ngân hàng gửi otp code
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hhbank.service@gmail.com',
            pass: 'hhbank123456'
        }
    });

    const userAccount = await useraccountModel.getByUserName(req.body.username);
    if (userAccount.length === 0) {
        return res.send({
            success: false,
            message: 'Username does not exist'
        })
    }

    const senderInfo = await userprofileModel.getByID(userAccount[0].ID);

    const mailOptions = {
        from: 'hhbank.service@gmail.com',
        to: senderInfo[0].Email,
        subject: 'Xác thực mã OTP - HHBank',
        text: `Dear customer: ${senderInfo[0].FullName}
         This is OTP Code: ${OTP} from InternetBanking Service.
         Please verify within 30 minutes prior to expiration `
    };

    //gửi mã otp đến khách hàng
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            return res.send({
                success: false,
                message: error,
            })
        }
        console.log('Email sent: ' + info.response);
    });

    const otpcodeObject = {
        ID: userAccount[0].ID,
        Code: OTP
    }
    await otpcodeModel.updateOTP(otpcodeObject);

    return res.json({
        success: true
    })
})

const createOTP = () => {
    let OTPcode = '';
    for (var i = 0; i < 6; i++) {
        OTPcode += Math.floor(Math.random() * (9 - 0) + 0);
    }
    return OTPcode;
}

const generateAccessToken = userId => {
    const payload = { userId };
    return accessToken = jwt.sign(payload, "secretkey");
}

module.exports = router;