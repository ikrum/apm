var config = require('./config');
var io = require('socket.io')(config.APM_SERVER_PORT);
var ss = require('socket.io-stream');
var fs = require('fs');
var path = require('path');
var deployHandler = require('./deployHandler');


// deploy the old app on server start / restart / crash
var packageJson = deployHandler.doesAppExists();
if(packageJson){
  console.log("Local app found !");
  deployHandler.startApp(config.PORT_A);
}


io.on('connection', function (socket) {
  socket.on('send', function (data) {
    console.log(data);
  });

  ss(socket).on('deploy', function(stream, data) {
    
    io.emit('deploy', { message: 'Receiving file data ........',status:'start'});
    var filename = path.basename(data.name);
    var output = fs.createWriteStream(filename);
    stream.pipe(output);
    io.emit('deploy', { message: 'File accepted. Please wait while deploy is processing',status:'start'});
    

    output.on('close', function() {
      // zip done
      deployHandler.deploy(filename,function(){
        //when deploy done, notify all client
        io.emit('deploy', { message: 'New app deploy on the server',status:'end'});

        //remove the file
        //fs.unlink(req.files.file.path, function(param){});
      });
    });

  });

  socket.on('status', function(data) {
    deployHandler.getApp(config.PORT_A, function(pid){
      if(pid)
        message = "Server is running on pid: "+pid;
      else
        message = "Server is not running";

      socket.emit('status',{message: message, status: 'end'});
     });  
   });  



  socket.on('disconnect', function () {
    console.log("user disconnected");
    io.emit('user disconnected');
  });


});

io.on('close', function(){
  console.log('io disconnect');
});