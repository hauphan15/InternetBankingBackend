const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('notification', entity)
    },
    getByUserID: userid => {
        return database.load(`select * from notification where UserID = ${userid} `);
    },
    updateSeenStatus: userid => {
        return database.load(`UPDATE notification SET Seen = 1  WHERE UserID = ${userid} `);
    },
    getAllUnSeenNotification: userid => {
        return database.load(`select * from notification where UserID = ${userid} and Seen = 0`);
    },
    getAllShownNotification: userid => {
        return database.load(`select * from notification where UserID = ${userid} and IsShown = 1`);
    },
    deleteNotification: id => {
        return database.load(`update notification set IsShown = 0 where ID = ${id}`);
    }
};