const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('listreceiver', entity)
    },
    getByUserID: userid => {
        return database.load(`select * from listreceiver where UserID = ${userid} AND IsDelete = 0 `);
    },
    updateNickName: (id, newNickName) => {
        return database.load(`UPDATE listreceiver SET NickName = '${newNickName}'  WHERE ID = ${id}`);
    },
    delete: (id) => {
        return database.load(`UPDATE listreceiver SET IsDelete = 1  WHERE ID = ${id}`);
    }
};