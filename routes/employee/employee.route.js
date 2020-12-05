const express = require('express');
const useraccountModel = require('../../models/useraccount.model');
const userprofileModel = require('../../models/userprofile.model');
const checkingaccountModel = require('../../models/checkingaccount.model');
const savingaccountModel = require('../../models/savingaccount.model');
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
        DateCreate: req.body.datecreate
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

module.exports = router;