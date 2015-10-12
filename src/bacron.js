#!/usr/bin/env node

var notifier  = require('./notifier');
var DB      = require("./db");

var path    = require('path');
var pkg     = require( path.join(__dirname, '../package.json') );
var program = require('commander');

var taglib  = require('taglib');

var _       = require('lodash');
var util    = require("util");
var walkdir = require("walkdir");
var q       = require("q");
var Summary = require("./summary").Summary;

// Get cmd line args
program
  .version(pkg.version)
  .option('-d, --dir <dir>', 'Base directory')
  .option('-h, --host <host>', 'database server host')
  .parse(process.argv);

var rootDir = program.dir || '/media/';

if(!_.endsWith(rootDir, '/')) {
  rootDir = rootDir + '/';
}

console.log('Directory ' + rootDir);

var logObject = function(obj) {
  console.log(util.inspect(obj, {showHidden: false, depth: null}));
};

var db      = new DB.DB(program.host);

db.createTracksTable();

var walker = walkdir(rootDir);
var fullRoot = path.resolve(rootDir);
var dirs = [fullRoot];
var watcher = null;
var summary = new Summary();

var tagReader = function(dir, name, err, tags, audioProperties) {
  console.log('Read Tags',dir,name);
  logObject(tags);
  logObject(audioProperties);
  db.addTrack(tags, dir + '/' + name);
  var shortPath = dir.substring(fullRoot.length + 1);
  summary.addTrack(shortPath, name);
};

var extensions = ['.mp3','.wav','.aif','.aiff','.ogg','.mp4','.wma'];

var addTrack = function(dir, name) {
  console.log('Add Track',dir,name);
  var ext = path.extname(name).toLowerCase();

  if(_.includes(extensions,ext)) {
    // Reset timer

    // Read tags and store in DB
    var filePath = dir + '/' + name;
    taglib.read(filePath, _.partial(tagReader, dir, name));
  } else {
    console.log('Extension not supported %s',dir, name);
  }
};

walker.on('directory', function(dirName, stat) {
  console.log('Dir Name ', dirName);
  dirs.push(dirName);
});

walker.on('end', function(dir, stat){
  console.log('Finished walk',dirs);
  watcher = new notifier.Notifier(dirs, addTrack);
});

