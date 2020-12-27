const express = require('express');
const useraccountModel = require('../../models/useraccount.model');
const userprofileModel = require('../../models/userprofile.model');
const checkingaccountModel = require('../../models/checkingaccount.model');
const savingaccountModel = require('../../models/savingaccount.model');
const transactionHistoryModel = require('../../models/transactionhistory.model');
const moment = require('moment');

const router = express.Router();

//tạo tài khoản khách hàng
router.post('/create-customer-account', async(req, res) => {

    const useraccountObject = {
        UserLogin: req.body.username,
        Password: req.body.password,
        Permission: req.body.permission
    }

    const isUsernameExist = await useraccountModel.getByUserName(req.body.username);
    if (isUsernameExist.length !== 0) {
        return res.json({
            success: false,
            message: 'Tên đăng nhập đã được sử dụng'
        })
    }

    //thêm vào bảng useraccount
    const useraccountAddResult = await useraccountModel.add(useraccountObject);

    if (useraccountAddResult.length === 0) {
        return res.json({
            success: false,
            message: 'Thêm khách hàng thất bại'
        })
    }

    const userprofileObject = {
        ID: useraccountAddResult.insertId,
        FullName: req.body.fullname,
        BirthDay: req.body.birthday,
        Gender: req.body.gender,
        Address: req.body.gender,
        Phone: req.body.phone,
        Email: req.body.email,
        IdentificationCardID: req.body.identificationcardid
    }

    //thêm vào bảng useprofile
    const userprofileAddResult = await userprofileModel.add(userprofileObject);
    if (userprofileAddResult.length === 0) {
        return res.json({
            success: false,
            message: 'Thêm khách hàng thất bại'
        })
    }

    //random account number
    let checkingAccountNumber = '';
    for (var i = 0; i < 10; i++) {
        checkingAccountNumber += Math.floor(Math.random() * (9 - 0) + 0);
    }
    const checkingAccountObject = {
        ID: useraccountAddResult.insertId,
        AccountNumber: checkingAccountNumber,
        DateCreate: moment().format('YYYY-MM-DD')
    }

    //thêm vào bảng checkingaccount
    const checkingaccountAddResult = await checkingaccountModel.add(checkingAccountObject);
    if (checkingaccountAddResult.length === 0) {
        return res.json({
            success: false,
            message: 'Thêm khách hàng thất bại'
        })
    }

    return res.json({
        success: true,
        checkingAccountNumber: checkingAccountNumber,
        message: 'thêm khách hàng thành công'
    })
})

//tạo tài khoản tiết kiệm
router.post('/create-saving-account', async(req, res) => {

    //random  number
    let savingAccountNumber = '';
    for (var i = 0; i < 10; i++) {
        savingAccountNumber += Math.floor(Math.random() * (9 - 0) + 0);
    }
    const savingAccountObject = {
        UserID: req.body.UserID,
        AccountNumber: savingAccountNumber,
        Money: 0,
        DateCreate: moment().format('YYYY-MM-DD hh:mm')
    }

    //thêm vào bảng savingaccount
    const savingaccountAddResult = await savingaccountModel.add(savingAccountObject);
    if (savingaccountAddResult.length === 0) {
        return res.json({
            success: false,
            message: 'Tạo tài khoản thất bại'
        })
    }

    return res.json({
        success: true,
        savingAccountNumber,
        message: 'Tạo tài khoản thành công'
    });
})

// tìm khách hàng bằng số cmnd
router.post('/get-customers', async (req, res) => {
    /*
        body = {
            name: "abc",
            phone: "012345",
            cmnd: "2244"
        }
     */
    let entity = req.body;
    if(typeof entity.name == "undefined") {
        entity = {...req.body, name: ""}
    }
    if(typeof entity.phone == "undefined") {
        entity = {...req.body, phone: ""}
    }
    if(typeof entity.cmnd == "undefined") {
        entity = {...req.body, cmnd: ""}
    }

    let result = await userprofileModel.getList(entity);
    if(result.length <= 0) {
        return res.json({
            success: false,
            listCustomer: null,
            message: "Cant find anyone"
        });
    }

    res.json({
        success: true,
        listCustomer: result,
        message: "Success"
    });
});

router.post('/get-customer', async (req, res) => {
    var entity = req.body;
    if(typeof entity.ID == 'undefined') {
        return res.json({
            success: false,
            message: "Need ID to get Customer"
        });
    }

    var result = await userprofileModel.getByID(entity.ID);
    if(result.length <= 0) {
        return res.json({
            success: false,
            message: "Cant find anyone"
        });
    }
    res.json({
        success: true,
        customer: result[0],
        message: "Success"
    });
});

router.post('/tranmoney-to-another-customer', async (req, res) => {
    /*
        {
            "ID" : 1,
            "accountNumber" : "111111111",
            "accountNumberReceiver" : "12345432"
            "money" : 1000,
            "content" : "abc" 
        }
    */

   let entity = req.body;
   if(typeof entity.ID == 'undefined') {
       return res.json({
           success: false,
           message: "Need ID"
       })
   }
   if(typeof entity.accountNumber == 'undefined') {
        return res.json({
            success: false,
            message: "Need Account Number"
        });
    }
    if(typeof entity.accountNumberReceiver == 'undefined') {
        return res.json({
            success: false,
            message: "Need account Number Receiver"
        });
    }
    if(typeof entity.money == 'undefined') {
        return res.json({
            success: false,
            message: "Need money"
        });
    }
    if(typeof entity.content == 'undefined') {
        return res.json({
            success: false,
            message: "Need content"
        });
    }
    let sender = await checkingaccountModel.getByAccountNumber(entity.accountNumber);
    if(sender.length <= 0) {
        return res.json({
            success: false,
            message: "Cant find Sender Account"
        });
    }
    let receiver = await checkingaccountModel.getByAccountNumber(entity.accountNumberReceiver);
    if(receiver.length <= 0) {
        return res.json({
            success: false,
            message: "Cant find receiver Account"
        });
    }
    let senderMoney = +sender[0].Money - +entity.money;
    let receiverMoney = +receiver[0].Money + +entity.money;
    console.log(sender);
    console.log(entity.money);
    console.log(senderMoney);
    await checkingaccountModel.updateBalance(sender[0].ID, senderMoney);
    await checkingaccountModel.updateBalance(receiver[0].ID, receiverMoney);

    let transactionhistory = {
        SenderID : sender[0].ID,
        SenderNumber : sender[0].AccountNumber,
        ReceiverID : receiver[0].ID,
        ReceiverNumber : receiver[0].AccountNumber,
        Money : entity.money,
        Content : entity.content,
        DateSend : new Date().getDate()
    }
    console.log(transactionhistory);
    await transactionHistoryModel.add(transactionhistory);

    res.json({
        success: true,
        message: "Transfer complete!"
    });
});

module.exports = router;