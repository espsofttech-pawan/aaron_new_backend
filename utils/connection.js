const mysql = require("mysql");
const config = require('../config')
try {

    var connection = mysql.createConnection({
        host: config.mysqlHost,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.mysqlPort
    });
    connection.connect(function (err) {
        if (!err) {
            console.log("Database is connected!");
        } else {
            console.log("Error connecting database!");
            throw err;
        }
    });

} catch (e) {
    console.log("Error connecting database!", e);
}

module.exports = connection;