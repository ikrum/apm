var fs = require('fs');
var config = require('./config');
var sys = require('sys')
var exec = require('child_process').exec;


exports.deploy = function(){
	// check for project package.json
	var packageJson;
	try {
		var packageFile = config.DEPLOY_PATH +"/package.json";
		var file = fs.readFileSync(packageFile, 'utf8');
		packageJson = JSON.parse(file);
	}
	catch(e){
		if(e.message.indexOf("no such file")>0){
			console.log("package.json not found");
			return;
		}
	}

	console.log("starting app");

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
    });
	
}

function startApp(port){
	console.log("starting app on "+port);
	var cmd = "cd "+config.DEPLOY_PATH+" && npm install && bower install && PORT="+port+" node ./bin/www";
	exec(cmd, function(error, stdout, stderr){
		console.log("app started on "+port);
		console.log(error || stdout || stderr);
	});
}

function killApp(port){
	var searchCmd = "fuser -v "+port+"/tcp";
	exec(searchCmd,{},function(error,stdout,stderr){
		stdout = stdout.replace(new RegExp('[ \n\t]','g'), '');
		if(stdout){
			console.log("killing PID:"+stdout);
			var killCmd = "kill -9 "+stdout;
			exec("killCmd",{},function(error,stdout,stderr){});
		}
		
    });

}

// create required folder OR delete old files
exports.cleanDirectory = function (path){
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

