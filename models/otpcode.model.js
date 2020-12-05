const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('otpcode', entity)
    },
    getByID: id => {
        return database.load(`select * from otpcode where ID = ${id} `);
    },
    updateOTP: async entity => {
        await database.delete('otpcode', { ID: entity.ID });
        return database.add('otpcode', entity);
    },
};