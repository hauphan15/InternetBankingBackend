const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('notification', entity)
    },
    getByUserID: userid => {
        return database.load(`select * from notification where UserID = ${userid} `);
    },
    updateSeenStatus: userid => {
        return database.load(`UPDATE notification SET Seen = 0  WHERE UserID = ${userid} `);
    },
    getAllUnSeenNotification: userid => {
        return database.load(`select * from notification where UserID = ${userid} and Seen = 1`);
    }
};