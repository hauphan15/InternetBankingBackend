const database = require('../utils/database');

module.exports = {
    login: async entity => {

        const rows = await database.load(`select * from useraccount where UserLogin = '${entity.username}' `);

        if (rows.length === 0)
            return null;

        if (rows[0].Password !== entity.password)
            return null;

        return rows[0];
    },
    add: entity => {
        return database.add('useraccount', entity)
    },
    getByUserName: username => {
        return database.load(`select * from useraccount where UserLogin = '${username}' `);
    }
};