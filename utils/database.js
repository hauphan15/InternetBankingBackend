const mysql = require('mysql');
const { promisify } = require('util');
const config = require('../config/default.json');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'us-cdbr-east-05.cleardb.net',
    port: 3306,
    user: 'b1bd0e2253fb4f',
    password: 'a2f6d7b2',
    database: 'heroku_096d62b2c9d603b'
});

const pool_query = promisify(pool.query).bind(pool);

module.exports = {
    load: sql => pool_query(sql),
    add: (tableName, entity) => pool_query(`INSERT INTO ${tableName} SET ?`, entity),
    delete: (tableName, condition) => pool_query(`DELETE FROM ${tableName} WHERE ?`, condition),
    update: (tableName, idField, id, entity) => pool_query(`UPDATE ${tableName} SET ? WHERE ${idField} = ${id}`, entity)
}