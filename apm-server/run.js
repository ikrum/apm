#! /usr/bin/env node
/*
var exec = require('child_process').exec;
var fs = require('fs');
var out = fs.openSync('./out.log', 'a');
var err = fs.openSync('./out.log', 'a');*/

// var cmd = "cd "+__dirname+" && npm start";
//exec(cmd,{}, function(error, stdout, stderr){});


var spawn = require('child_process').spawn;
spawn('node', [__dirname+'/app'], { detached: true});

/*console.log("Apm server started");
console.log(__dirname+'/app');*/

