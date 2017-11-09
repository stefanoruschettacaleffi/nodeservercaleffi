
var mysql = require('mysql');

module.exports = {

  connectToMySQL: function(host, username, password, connectionCallback){

    var con = mysql.createConnection({
        host: host,
        user: username,
        password: password
      });

    con.connect(function(err){
        if(err){
          throw err;
        }
        else {
          console.log(username + " connected to host: " + host );
          connectionCallback(con);
        }
      });
  },

  createDBOnConn: function(con, dbname, creationCallback){

    var sql = "CREATE DATABASE IF NOT EXISTS " + dbname;

    con.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      else {
        console.log("Database " + dbname + " created");
        creationCallback();
      }
    });
  },


  createMeasuresTableOnDB : function(con, db_name, creationCallback){

      var sql = "CREATE TABLE IF NOT EXISTS " + db_name + ".measure_table (measureId INT PRIMARY KEY, energy_pos FLOAT(7,2), energy_neg FLOAT(7,2), mass FLOAT(7,2), imp1 FLOAT(7,2), imp2 FLOAT(7,2), imp3 FLOAT(7,2), date TEXT, alarms TEXT)";

      con.query(sql, function( err, result){
        if(err){
          throw err;
        }
        else {
          console.log("measureTable created");
          creationCallback();
        }
      });
  }
}
