const database = require('../utils/database');

module.exports = {
    add: entity => {
        return database.add('transactionhistory', entity)
    },
    getAll: () => {
        return database.load(`select * from transactionhistory`);
    },
    getByID: id => {
        return database.load(`select * from transactionhistory where ID = ${id}`);
    },
    getSendTransaction: id => {
        return database.load(`select * from transactionhistory where SenderID = ${id}`);
    },
    getReceiveTransaction: id => {
        return database.load(`select * from transactionhistory where ReceiverID = ${id}`);
    },
    lastFiveTransaction: id => {
        if (id === '') {
            return null;
        }

        return database.load(`
        SELECT * FROM ( SELECT * FROM transactionhistory
                        where SenderID = ${id} or ReceiverID = ${id}
                        ORDER BY ID DESC LIMIT 5
                        ) sub
        ORDER BY ID ASC `);
    },
    currentMonthTransaction: () => {
        return database.load(`SELECT * 
                            FROM transactionhistory
                            WHERE MONTH(DateSend) = MONTH(CURRENT_DATE())
                            AND YEAR(DateSend) = YEAR(CURRENT_DATE())`)
    }
};