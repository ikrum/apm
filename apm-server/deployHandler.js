var fs = require('fs');
var config = require('./config');
var exec = require('child_process').exec;
var AdmZip = require('adm-zip');

var deploy = function(file,done){
	// clean deploy directory
	cleanDirectory(config.DEPLOY_PATH);

	// Extract file directly from tmp
	var zip = new AdmZip(file);
	zip.extractAllTo(config.DEPLOY_PATH ,true);

	// check for project package.json
	var packageJson = doesAppExists();
	if(!packageJson) return done("package.json not found");

  // run app on temp port
  startApp(config.PORT_B, function(){
  	// start app on the main port
  	startApp(config.PORT_A,function(){
  		done('New app deployed ! App will be alive within couple of seconds');
  		// kill the temp app after 5 second
  		setTimeout(function() {
			  killApp(config.PORT_B,function(){});
			}, 5000);
  	});
  });
}

var doesAppExists = function(){
	var packageJson;
	try {
		var packageFile = config.DEPLOY_PATH +"/package.json";
		var file = fs.readFileSync(packageFile, 'utf8');
		packageJson = JSON.parse(file);
		return packageJson;
	}
	catch(e){
		if(e.message.indexOf("no such file")>0){
			console.log("package.json not found");
			return;
		}
	}
}

var startApp = function(port, callback){
	var cb = callback || noop;

	killApp(port,function(){
		var cmd = "cd "+config.DEPLOY_PATH+" && PORT="+port+" node ./bin/www";
		exec(cmd,{}, function(error, stdout, stderr){
			/*
				When app OR process is killed, callback will have error: Error: Command failed: cd /home/ikrum/apm-deploy && PORT=6001 node ./bin/www
				Killed
			*/
			if(stderr) {
				var cmdError = stderr.toString();
				if(cmdError.indexOf("Killed") == -1){
					// emit non killed OR start APP error
					process.emit('deployError', { message: stderr.toString(), status:'end'});
				}
			}
		});
		cb();
	});
}

var getApp = function(port,callback){
	var searchCmd = "fuser -v "+port+"/tcp";
	exec(searchCmd,{},function(error,stdout,stderr){
		stdout = stdout.replace(new RegExp('[ \n\t]','g'), '');
		callback(stdout);
	});
}

var killApp = function(port,callback){
	var cb = callback || noop;
	var searchCmd = "fuser -v "+port+"/tcp";

	exec(searchCmd,{},function(error,stdout,stderr){
		stdout = stdout.replace(new RegExp('[ \n\t]','g'), '');
		if(stdout){
			console.log("killApp: PID="+stdout+" port="+port);

			var killCmd = "kill -9 "+stdout;
			exec(killCmd,{},function(error,stdout,stderr){
				cb(error || stdout || stderr);
			});
		}else{
			console.log("KillApp failed: No pid found");
			cb(error || stdout || stderr);
		}
  });
}

// create required folder OR delete old files
var cleanDirectory = function (path){
	try{
		deleteFolderRecursive(path);
	}catch(e){}

	try {
		fs.mkdirSync(path); // create empty folder
		return true;
	} catch(e) {
		if ( e.code != 'EEXIST' ) return true;
		return false;
	}
}

// delete folder completely
var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var noop = function(a,b,c){}

exports.deploy = deploy;
exports.doesAppExists = doesAppExists;
exports.startApp = startApp;
exports.getApp = getApp;
exports.killApp = killApp;
exports.cleanDirectory = cleanDirectory;
exports.deleteFolderRecursive = deleteFolderRecursive;