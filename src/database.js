const mysql = require('promise-mysql')

const connection = mysql.createConnection(
    {
        host:'localhost',
        user:'root',
        password:'vasquez18tec',
        database:'labmec'
    }
)

function getConnection() {
    return connection;
}

module.exports={getConnection}