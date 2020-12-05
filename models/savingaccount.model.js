const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('savingaccount', entity)
    },
    getByUserID: userid => {
        return database.load(`select * from savingaccount where UserID = ${userid} `);
    }
};