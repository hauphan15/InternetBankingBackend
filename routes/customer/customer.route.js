const express = require('express');
const checkingaccountModel = require('../../models/checkingaccount.model');
const savingaccountModel = require('../../models/savingaccount.model');
const nodemailer = require('nodemailer');
const userprofileModel = require('../../models/userprofile.model');
const otpcodeModel = require('../../models/otpcode.model');
const notificationModel = require('../../models/notification.model');
const transactionModel = require('../../models/transactionhistory.model');
const receiverlistModel = require('../../models/receiverlist.model');
const moment = require('moment');
const useraccountModel = require('../../models/useraccount.model');

const router = express.Router();


router.post('/transfer-money', async(req, res) => {

    const receiverAccount = await checkingaccountModel.getByAccountNumber(req.body.ReceiverNumber);
    const senderAccount = await checkingaccountModel.getByAccountNumber(req.body.SenderNumber);

    const senderOTP = await otpcodeModel.getByID(senderAccount[0].ID);
    const headerOTP = req.headers['x-otp-code'];

    if (senderOTP[0].Code !== headerOTP) {
        return res.json({
            success: false,
            message: 'Invalid OTP code'
        })
    }

    if (+req.body.Money <= 0) {
        return res.json({
            success: false,
            message: 'Invalid amount'
        })
    }

    if (receiverAccount.length === 0) {
        return res.json({
            success: false,
            message: 'Account number of receiver does not not exist in the  system'
        })
    }

    //kiểm tra số dư tài khoản người gửi có đủ thực hiện giao dịch
    if (+senderAccount[0].Money < (+req.body.Money + 1000)) {
        return res.json({
            success: false,
            message: 'Your balance is not enough for this transaction'
        })
    }

    //tài khoản người nhận
    //cộng với tiền nạp dô
    let newReceiverBalance = +receiverAccount[0].Money + (+req.body.Money);
    //update lại số dư tài khoản người nhận
    await checkingaccountModel.updateBalance(receiverAccount[0].ID, newReceiverBalance)

    //tài khoản người gửi
    //trừ tiền đã gửi + phí
    let newSenderBalance = +senderAccount[0].Money - (+req.body.Money) - 1000;
    //update lại số dư tài khoản người nhận
    await checkingaccountModel.updateBalance(senderAccount[0].ID, newSenderBalance)


    //lưu lại thông tin giao dịch
    const transactionInfo = {
        SenderID: senderAccount[0].ID,
        SenderNumber: senderAccount[0].AccountNumber,
        ReceiverID: receiverAccount[0].ID,
        ReceiverNumber: receiverAccount[0].AccountNumber,
        Money: req.body.Money,
        Content: req.body.Content,
        DateSend: moment().format('YYYY-MM-DD hh:mm:ss')
    }
    await transactionModel.add(transactionInfo);

    //thêm vào bảng nottify
    const notificationInfo = {
        UserID: receiverAccount[0].ID,
        SenderID: senderAccount[0].ID,
        Money: req.body.Money,
        Content: req.body.Content,
        Time: moment().format('YYYY-MM-DD hh:mm:ss'),
        Seen: 1
    }
    await notificationModel.add(notificationInfo);

    return res.json({
        success: true,
        transactionInfo,
        message: 'Successfull transaction'
    })

})

//lấy tk thanh toán và tiết kiệm
router.post('/accounts', async(req, res) => {
    const checkingAccountInfo = await checkingaccountModel.getByID(req.body.UserID);

    if (checkingAccountInfo.length === 0) {
        return res.send({
            checkingAccountInfo: [],
            savingAccountInfo: []
        })
    }

    checkingAccountInfo[0].DateCreate = moment(checkingAccountInfo[0].DateCreate).format('DD-MM-YYYY');
    checkingAccountInfo[0].Money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(checkingAccountInfo[0].Money); //format currency

    let savingAccountInfo = await savingaccountModel.getByUserID(req.body.UserID);
    if (savingAccountInfo.length === 0) {
        savingAccountInfo = []
    } else {
        for (let index = 0; index < savingAccountInfo.length; index++) {
            savingAccountInfo[index].DateCreate = moment(savingAccountInfo[index].DateCreate).format('DD-MM-YYYY');
            savingAccountInfo[0].Money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingAccountInfo[0].Money);
        }
    }

    return res.send({
        checkingAccountInfo: checkingAccountInfo[0],
        savingAccountInfo
    })
})

//lấy tất cả thông báo
router.post('/notification', async(req, res) => {
    const notification = await notificationModel.getAllUnSeenNotification(req.body.UserID);
    return res.send(notification);
})

//lấy tất cả thông báo được show
router.post('/shown-notification', async(req, res) => {
    const shownNotification = await notificationModel.getAllShownNotification(req.body.UserID);
    return res.send(shownNotification);
})

//delete notification
router.post('/delete-notification', async(req, res) => {
    const result = await notificationModel.deleteNotification(req.body.ID);
    return res.send(result);
})

//update đã xem tất cả thông báo
router.post('/seen-all-notification', async(req, res) => {
    const result = await notificationModel.updateSeenStatus(req.body.UserID);

    return res.send({
        success: true,
        result
    });
})

//get user profile
router.post('/user-profile', async(req, res) => {
    const userprofile = await userprofileModel.getByID(req.body.ID);

    userprofile[0].Birthday = moment(userprofile[0].Birthday).format('DD-MM-YYYY');

    return res.send(userprofile[0]);
})


//get sender and receiver profile
router.post('/profile', async(req, res) => {
    const senderProfile = await userprofileModel.getByID(req.body.SenderID);

    const receiverProfile = await userprofileModel.getByID(req.body.ReceiverID);

    return res.send({
        senderProfile,
        receiverProfile
    });
})

//xem lịch sử giao dịch
//giao dịch nhận tiền
router.post('/receive-history', async(req, res) => {
    const receiveHistory = await transactionModel.getReceiveTransaction(req.body.ID);

    for (let index = 0; index < receiveHistory.length; index++) {
        receiveHistory[index].DateSend = moment(receiveHistory[index].DateSend).format('DD-MM-YYYY hh:mm:ss');
    }

    return res.send(receiveHistory);
})

//giao dịch gửi tiền
router.post('/send-history', async(req, res) => {
    const sendHistory = await transactionModel.getSendTransaction(req.body.ID);

    for (let index = 0; index < sendHistory.length; index++) {
        sendHistory[index].DateSend = moment(sendHistory[index].DateSend).format('DD-MM-YYYY hh:mm:ss');
    }

    return res.send(sendHistory);
})

//5 giao dịch nhận hoặc gửi gần nhất
router.post('/last-five-history', async(req, res) => {
    const lastFiveHistory = await transactionModel.lastFiveTransaction(req.body.UserID);

    if (lastFiveHistory === null) {
        return res.send({
            lastFiveHistory: []
        })
    }

    for (let index = 0; index < lastFiveHistory.length; index++) {
        lastFiveHistory[index].DateSend = moment(lastFiveHistory[index].DateSend).format('DD-MM-YYYY hh:mm:ss');
    }

    return res.send(lastFiveHistory)
})


//lấy danh sách người nhận
router.post('/receiver-list', async(req, res) => {
    const receiverList = await receiverlistModel.getByUserID(req.body.UserID);
    return res.send(receiverList);
})

//thêm người nhận
router.post('/add-receiver', async(req, res) => {
    // req.body = {
    //     UserID,
    //     ReceiverNumber
    //     NickName
    // }
    const receiverAccount = await checkingaccountModel.getByAccountNumber(req.body.ReceiverNumber);
    if (receiverAccount.length === 0) {
        return res.json({
            success: false,
            message: 'Account number of receiver does not not exist in the  system'
        })
    }

    const receiverObject = {
        UserID: req.body.UserID,
        ReceiverID: receiverAccount[0].ID,
        AccountNumber: req.body.ReceiverNumber,
        NickName: req.body.NickName,
        IsDelete: 0
    }

    const addReceiver = await receiverlistModel.add(receiverObject);

    return res.json({
        success: true,
        addReceiver,
        message: 'Add receiver successfully'
    })
})

//đổi nickname người nhận
router.post('/edit-receiver', async(req, res) => {
    // req.body = {
    //     ID,
    //     NewNickName
    // }
    await receiverlistModel.updateNickName(req.body.ID, req.body.NickName);
    return res.json({
        success: true,
        message: 'Change nickname successfully'
    })
})


//delete receiver from list
router.post('/delete-receiver', async(req, res) => {
    await receiverlistModel.delete(req.body.ID);
    return res.json({
        success: true,
        message: 'Delete receiver successfully'
    })
})

//Change password
router.post('/change-password', async(req, res) => {

    const userOTP = await otpcodeModel.getByID(req.body.ID);
    const userAccount = await useraccountModel.getByID(req.body.ID);

    console.log(`${userOTP}----${userAccount}`);

    if (userAccount[0].Password !== req.body.oldPassword) {
        return res.send({
            success: false,
            message: 'Incorrect old password'
        })
    }

    if (userOTP[0].Code !== req.headers['x-otp-code']) {
        return res.json({
            success: false,
            message: 'Invalid OTP Code'
        })
    }

    await useraccountModel.changePassword(req.body.ID, req.body.newPassword);

    return res.json({
        success: true,
        message: 'Change password successfully'
    })
})


//reset password - forgotpassword
router.post('/reset-password', async(req, res) => {
    const result = useraccountModel.changePassword(req.body.ID, req.body.newPassword);

    return res.send({
        success: true,
        message: 'Reset password successfully',
        result
    })
})

//verify OTP - forgot password
router.post('/verify-otp', (req, res) => {
    const OTP = req.headers['x-opt-code'];
    const userAccount = useraccountModel.getByUserName(req.body.username);
    const userOTP = otpcodeModel.getByID(userAccount[0].Code);

    if (OTP !== userOTP) {
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

//gửi mã OTP đến email khách hàng
router.post('/send-otp', async(req, res) => {
    const OTP = createOTP();

    //email ngân hàng gửi otp code
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hhbank.service@gmail.com',
            pass: 'hhbank123456'
        }
    });


    const senderInfo = await userprofileModel.getByID(req.body.ID);

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
        ID: req.body.ID,
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

module.exports = router;