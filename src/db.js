var mysql   = require('mysql');
var util    = require("util");

var logObject = function(obj) {
  console.log(util.inspect(obj, {showHidden: false, depth: null}));
};

function DB(host) {
  var dbHost = host || 'db';
  console.log('DB Host is',dbHost);

  this.connected = false;
  this.connection = mysql.createConnection({
    host      : dbHost,
    port      : 3306,
    user      : 'pr0k',
    password  : 'bacron',
    database  : 'bacron'
  });
}

DB.prototype.createTracksTable = function() {
  this.connection.query('SHOW TABLES LIKE "bacron"', function(error, results, fields) {
    if(!error) {
      this.connected = true;
      console.log('DB Connection OK');
    } else if(error.code == 'ECONNREFUSED') {
      console.log('Error connecting to DB');
    }
  });

  if(this.connected) {
    this.onConnect();
  }
};

DB.prototype.onConnect = function() {
  var createTableQuery = 'CREATE TABLE `bacron`.`tracks` (`id` INT NOT NULL AUTO_INCREMENT,`album` LONGTEXT NULL,`artist` LONGTEXT NULL,`genre` TEXT NULL,`comment` LONGTEXT NULL,`title` LONGTEXT NULL,`track` TEXT NULL,`year` INT NULL, `path` LONGTEXT NULL,PRIMARY KEY (`id`));';
  this.connection.query(createTableQuery, function(error, results, fields) {

  });
};

DB.prototype.addTrack = function(tags, path) {
  if(!this.connected) {
    console.log('DB addTrack ignored. No connection');
  }
  console.log('DB addTrack',tags,path);
  tags.path = path;
  this.connection.query('INSERT INTO tracks SET ?',tags, function (err, result) {
    if(err) {
      console.error('Insert error');
      logObject(err);
    } else {
      console.log('Insert complete');
      logObject(result);
    }
    current = null;
  });

};

exports.DB = DB;