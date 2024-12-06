const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root',      
    password: 'hellokevin123',      
    database: 'mySimpleSite'
});

module.exports = pool.promise();