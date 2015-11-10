var fs = require('fs');
var config = require('./config');
var exec = require('child_process').exec;


var deploy = function(){
	// check for project package.json
	var packageJson = doesAppExists();
	if(!packageJson) return;
	
	console.log("\n---------Deploy Started--------\n");

    // run app on temp port
    startApp(config.PORT_B, function(message){
    	console.log("\n");

    	// start app on the main port
    	startApp(config.PORT_A,function(message){

    		// kill the temp app after 5 second
    		setTimeout(function() {
			  killApp(config.PORT_B,function(){
			  	console.log("\n---------Deploy End--------\n");
			  });
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

	killApp(port,function(message){

		console.log("Starting app on "+port);
		//var cmd = "cd "+config.DEPLOY_PATH+" && npm install && bower install && PORT="+port+" node ./bin/www";
		var cmd = "cd "+config.DEPLOY_PATH+" && PORT="+port+" node ./bin/www";

		// async exec will listen to the app output
		exec(cmd,{}, function(error, stdout, stderr){});

		cb();
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
		fs.mkdirSync(path);
		//fs.mkdirSync(path+"/app"); // for extracted app
		return true;
	} catch(e) {
		// if ( e.code != 'EEXIST' ) throw e;
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
exports.killApp = killApp;
exports.cleanDirectory = cleanDirectory;
exports.deleteFolderRecursive = deleteFolderRecursive;


/*
	//"netstat -ln | grep ':5050 ' | grep 'LISTEN'"
	var portQuery = "netstat -ln | grep ':"+config.PORT_A+" ' | grep 'LISTEN'"
	
	exec(portQuery,{},function(error,stdout,stderr){
        if(stdout){
    	// PORT_A is busy
           startApp(config.PORT_B);
        }else{
        	console.log(config.PORT_A+" should be free");
        	startApp(config.PORT_A);
        	killApp(config.PORT_B);
        }
    });*/
