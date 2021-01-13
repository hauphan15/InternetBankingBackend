const express = require('express');
const userAccountModel = require('../../models/useraccount.model');
const userprofileModel = require('../../models/userprofile.model');
const userProfileModel = require('../../models/userprofile.model');
const router = express.Router();

router.post('/employee-list', async(req, res) => {
    const employeeList = await userAccountModel.getByRole('employee');

    let employeeProfile = [];

    for (let i = 0; i < employeeList.length; i++) {
        const profile = await userProfileModel.getByID(employeeList[i].ID);
        employeeProfile[i] = profile[0];
    }

    res.send(employeeProfile);

})

router.post('/add-employee', async(req, res) => {

    const accountInfo = {
        UserLogin: req.body.username,
        Password: req.body.password,
        Permission: 'employee',
        IsDelete: 0
    }

    const checkUsername = await userAccountModel.getByUserName(req.body.username);
    if (checkUsername.length > 0) {
        res.send({
            success: false,
            message: 'Username already exists'
        })
    }

    const addAccountRes = await userAccountModel.add(accountInfo);

    const profileInfo = {
        ID: addAccountRes.insertId,
        FullName: req.body.fullName,
        Birthday: req.body.birthday,
        Gender: req.body.gender,
        Address: req.body.address,
        Phone: req.body.phone,
        Email: req.body.email,
        IdentificationCardID: req.body.idCard,
        IsDelete: 0,
    }

    const addProfile = await userProfileModel.add(profileInfo);

    if (addProfile.affectedRows == 0) {
        return res.send({
            success: false,
            message: 'Fail to add to profile'
        })
    }

    res.send({
        success: true,
        message: 'Add employee successfully'
    })
})

router.post('/remove-employee', async(req, res) => {

    await userAccountModel.delete(req.body.ID);
    await userprofileModel.delete(req.body.ID);

    res.send({
        success: true,
        message: 'Delete employee successfully'
    })
})

module.exports = router;