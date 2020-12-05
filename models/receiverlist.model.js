const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('listreceiver', entity)
    },
    getByUserID: userid => {
        return database.load(`select * from listreceiver where UserID = ${userid} `);
    },
    updateNickName: (id, newNickName) => {
        return database.load(`UPDATE listreceiver SET NickName = '${newNickName}'  WHERE ID = ${id}`);
    }
};