#! /usr/bin/env node

var socketio = require('socket.io-client')
var readline = require('readline');
var ss = require('socket.io-stream');
var fs = require('fs');
var clientHandler = require('./clientHandler');
var colors = require('colors');

var prefix = colors.gray("APM ");
var serverPrefix = colors.gray("SERVER ");

var argv = require('optimist').argv;
if(!argv.server) return console.log("--server address required");

console.log(argv.server);

var socket = socketio(argv.server);
var rl = readline.createInterface(process.stdin, process.stdout);
var acceptedCommands=["deploy","status"]

rl.setPrompt("apm:> ");

socket.on('connect', function(){
    rl.prompt(true);

    rl.on('line', function (line) {
        //rl.prompt(false);

        line=line.trim();
        
        if(acceptedCommands.indexOf(line)==-1 ){
          console.log(prefix+ "Commands: "+acceptedCommands);
          rl.prompt(true);
          return;
        }
        
        if(line=="deploy"){

          clientHandler.getZip(function(filename){
            console.log(prefix+"Sending zip..");
        		var stream = ss.createStream();
            ss(socket).emit('deploy', stream, {name: filename});
            fs.createReadStream(filename).pipe(stream);
        	});

        }
        else if(line=="status"){
          socket.emit('status',{});
        }

        

        
    });
});

socket.on('deploy',function(data){
  console.log(serverPrefix+data.message);

  if(data.status == "end"){
    rl.prompt(true);
  }
});

socket.on('status',function(data){
  console.log(serverPrefix+data.message);
  if(data.status == "end"){
    rl.prompt(true);
  }
});


socket.on('connect_error', function(err){
  console.log("connect_error");
  console.log(err);

});
socket.on('connect_timeout', function(){
  console.log("connect_timeout");
});

