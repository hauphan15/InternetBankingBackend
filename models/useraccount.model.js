const database = require('../utils/database');

module.exports = {
    login: async entity => {

        const rows = await database.load(`select * from useraccount where UserLogin = '${entity.username}' `);
        if (rows.length === 0)
            return null;


        if (rows[0].Password === entity.password)
            return rows[0];

        return null;
    },
    add: entity => {
        return database.add('useraccount', entity)
    },
    getByID: id => {
        return database.load(`select * from useraccount where ID = ${id}`);
    },
    getByUserName: username => {
        return database.load(`select * from useraccount where UserLogin = '${username}' `);
    },
    getByRole: role => {
        return database.load(`select * from useraccount where Permission = '${role}' and IsDelete = 0`);
    },
    changePassword: (ID, newPassword) => {
        return database.load(`update useraccount set Password = '${newPassword}' where ID = ${ID} `);
    },
    delete: ID => {
        return database.load(`update useraccount set IsDelete = 1 where ID = ${ID} `);
    }
};