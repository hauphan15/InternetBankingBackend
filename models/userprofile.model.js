const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('userprofile', entity)
    },
    getByID: id => {
        return database.load(`select * from userprofile where ID = ${id}`);
    },
    getList: entity => {
        return database.load(`select * from userprofile where FullName like "%${entity.name}%"
         and Phone like "%${entity.phone}%" and IdentificationCardID like "%${entity.cmnd}%"`);
    },
    delete: ID => {
        return database.load(`update userprofile set IsDelete = 1 where ID = ${ID} `);
    }
};