const express = require('express');
const checkingaccountModel = require('../../models/checkingaccount.model');
const nodemailer = require('nodemailer');
const userprofileModel = require('../../models/userprofile.model');
const otpcodeModel = require('../../models/otpcode.model');
const moment = require('moment');
const transactionModel = require('../../models/transactionhistory.model');
const receiverlistModel = require('../../models/receiverlist.model');

const router = express.Router();


router.post('/send-money', async(req, res) => {

    const receiverAccount = await checkingaccountModel.getByAccountNumber(req.body.ReceiverNumber);
    const senderAccount = await checkingaccountModel.getByAccountNumber(req.body.SenderNumber);

    const senderOTP = await otpcodeModel.getByID(senderAccount[0].ID);
    const headerOTP = req.headers['x-otp-code'];
    console.log(`${senderOTP[0].Code} ---- ${headerOTP}`);

    if (senderOTP[0].Code !== headerOTP) {
        return res.json({
            success: false,
            message: 'Mã OTP không đúng'
        })
    }

    if (+req.body.Money <= 0) {
        return res.json({
            success: false,
            message: 'Số tiền gửi không hợp lệ'
        })
    }

    if (receiverAccount.length === 0) {
        return res.json({
            success: false,
            message: 'Số tài khoản người nhận không hợp lệ'
        })
    }

    //kiểm tra số dư tài khoản người gửi có đủ thực hiện giao dịch
    if (+senderAccount[0].Money < (+req.body.Money + 1000)) {
        return res.json({
            success: false,
            message: 'Số dư tài khoản không đủ thực hiện giao dịch'
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
        DateSend: moment().format('DD-MM-YYYY hh:mm:ss')
    }
    await transactionModel.add(transactionInfo);

    return res.json({
        success: true,
        transactionInfo,
        message: 'giao dịch thành công'
    })

})


//xem lịch sử giao dịch
//giao dịch nhận tiền
router.post('/receive-history', async(req, res) => {
    const receiveHistory = await transactionModel.getReceiveTransaction(req.body.ID);

    return res.send(receiveHistory);
})

//giao dịch gửi tiền
router.post('/send-history', async(req, res) => {
    const sendHistory = await transactionModel.getSendTransaction(req.body.ID);

    return res.send(sendHistory);
})


//lấy danh sách người nhận
router.post('/receiver-list', async(req, res) => {
    const list = await receiverlistModel.getByUserID(req.body.UserID);

    return res.json({
        success: true,
        list
    })
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
            message: 'Số tài khoản không hợp lệ'
        })
    }

    const receiverObject = {
        UserID: req.body.UserID,
        ReceiverID: receiverAccount[0].ID,
        NickName: req.body.NickName
    }

    const addReceiver = await receiverlistModel.add(receiverObject);

    return res.json({
        success: true,
        addReceiver,
        message: 'Thêm người nhận thành công'
    })
})

//đổi nickname người nhận
router.post('/update-nickname', async(req, res) => {
    // req.body = {
    //     ID,
    //     NewNickName
    // }
    await receiverlistModel.updateNickName(req.body.ID, req.body.NickName);
    return res.json({
        success: true,
        message: 'Đổi nickname thành công'
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
        text: `Xin chào khách hàng ${senderInfo[0].FullName}
         Đây là mã OTP để xác thực giao dịch: ${OTP}
         Vui lòng xác thực trong vòng 2 giờ trước khi mã hết hạn
         Thân chào!`
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