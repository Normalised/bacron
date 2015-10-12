var rest = require('restler');
var _ = require('lodash');

var colours = ["#ED1C24","#F26522","#F7941D","#FFF200","#8DC73F","#39B54A","#00A651","#00A99D","#00AEEF","#0072BC","#0054A6","#2E3192","#662D91","#92278F","#EC008C","#ED145B"];
var emoji = [":point_up:",":fist:",":hand:",":v:",":point_up_2:",":point_down:",":point_left:",":point_right:",":punch:",":wave:",":+1:",":-1:",":ok_hand:",":clap:",":open_hands:",":pill:"];

function Summary() {

  // Map of path names to arrays of files
  this.trackMap = {};
  this.timeout = null;
  // Start with 1 minute
  //this.waitTime = 1000 * 60 * 1;
  this.waitTime = 5000;
}

Summary.prototype.addTrack = function(dir, name) {

  console.log('Summary addTrack',dir,name, this.trackMap);
  if(this.timeout) {
    clearTimeout(this.timeout);
  }
  if(this.trackMap[dir]) {
    this.trackMap[dir].push(name);
  } else {
    this.trackMap[dir] = [name];
  }
  this.timeout = setTimeout(_.bind(this.send,this), this.waitTime);
};

Summary.prototype.send = function() {
  console.log('Sending summary to slack',this.trackMap);
  this.timeout = null;

  var attachments = [];
  var totalTracks = 0;
  var folderCount = 0;
  _.each(this.trackMap, function(val, key){
    totalTracks += val.length;
    folderCount++;
    var info = {fallback:key,title:"Folder: " + key};
    var infoText = '';
    _.each(val, function(track){
      infoText += track + '\n';
    });
    info.text = infoText;
    info.color = colours[folderCount % colours.length];
    attachments.push(info);

  });

  var text = '**ITS NOT REAL YET**\nThere are ' + totalTracks + ' new tracks in ' + folderCount + ' folder';
  if(folderCount > 1) {
    text = text + 's';
  }

  var jsonData = {text:text,attachments:attachments, username:"BACRON",icon_emoji: _.sample(emoji)};

  console.log('JSON ',jsonData);
  var request = rest.postJson('https://hooks.slack.com/services/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', jsonData);
  request.on('complete', function(data, response) {
    console.log('Request Complete');
  });
};

exports.Summary = Summary;