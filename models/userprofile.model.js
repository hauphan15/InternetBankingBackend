const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('userprofile', entity)
    },
    getByID: id => {
        return database.load(`select * from userprofile where ID = ${id}`);
    }
};