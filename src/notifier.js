var Inotify = require('inotify').Inotify;
var _       = require('lodash');

function Notifier(directoryList, fileListener) {

  // Map from path to watcher ID
  this.pathToIdMap = {};
  // Map from ID to path
  this.idToPathMap = {};

  this.inotify = new Inotify();

  console.log('Created Inotify',this.inotify);

  this.fileListener = fileListener;

  var _this = this;
  _.each(directoryList, function(dir) {
    _this.createWatcher(dir);
  });

}

Notifier.prototype.createWatcher = function(dir) {
  if(this.pathToIdMap[dir]) {
    console.warn('Watcher already exists for ' + dir + ' with ID ' + this.pathToIdMap[dir]);
    return;
  }
  var watcher = new DirWatcher(dir, this);
  var watchId = this.inotify.addWatch(watcher.options);
  this.pathToIdMap[dir] = watchId;
  this.idToPathMap[watchId] = dir;
  console.log('Dir Watcher %s',watchId);
};

Notifier.prototype.addDirectory = function(parent, name) {
  console.log('Add Directory %s : %s', parent, name);
  var dir = parent + '/' + name;
  this.createWatcher(dir);
};

Notifier.prototype.removeDirectory = function(parent, name) {
  console.log('Remove Directory %s : %s', parent, name);
  var dir = parent + '/' + name;
  if(this.pathToIdMap[dir]) {
    this.idToPathMap[this.pathToIdMap[dir]] = null;
    this.pathToIdMap[dir] = null;
  }

};

Notifier.prototype.newFile = function(dir, name) {
  console.log('New File %s : %s', dir, name);
  this.fileListener(dir,name);
};

// Watch a directory for new things
// handler has to have newDirectory and newFile methods
function DirWatcher(dir, handler) {
  this.handler = handler;
  // Record which files we've seen after the IN_CLOSE_WRITE
  // because taglib.read actually opens the file for writing :(
  this.seen = {};

  console.log('Create DirWatcher %s',dir);
  this.options = {
    path: dir,
    watch_for: Inotify.IN_CREATE | Inotify.IN_CLOSE_WRITE | Inotify.IN_DELETE,
    callback: _.bind(this.update, this)
  };

  this.current = null;
};

DirWatcher.prototype.update = function(event) {
  var isDir = event.mask & Inotify.IN_ISDIR;

  if(isDir) {
    // Only interested in new directories
    if(event.mask & Inotify.IN_CREATE) {
      this.handler.addDirectory(this.options.path, event.name);
    } else if(event.mask & Inotify.IN_DELETE) {
      this.handler.removeDirectory(this.options.path, event.name);
    } else if(event.mask & Inotify.IN_MOVED_FROM) {
      console.log('Dir Moved From',event)
    } else if(event.mask & Inotify.IN_MOVED_TO) {
      console.log('Dir Moved To',event)
    }
  } else if(event.mask & Inotify.IN_CLOSE_WRITE) {
    var file = event.name;
    if(!this.seen[file]) {
      this.seen[file] = true;
      console.log('Finished writing ' + this.options.path + ' : ' + file);
      this.handler.newFile(this.options.path, file);
    }
  }
};

exports.Notifier = Notifier;