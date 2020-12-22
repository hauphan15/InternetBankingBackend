const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('checkingaccount', entity)
    },
    getByID: ID => {
        return database.load(`select * from checkingaccount where ID = '${ID}' `);
    },
    getByAccountNumber: number => {
        return database.load(`select * from checkingaccount where AccountNumber = '${number}' `);
    },
    updateBalance: (id, newBalance) => {
        return database.load(`UPDATE checkingaccount SET Money = ${newBalance}  WHERE ID = ${id} `);
    }
};