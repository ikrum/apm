var fs = require("fs");
var archiver = require('archiver');
var colors = require('colors');
var utils = require('./utils');

var prefix = colors.gray("APM ");
var currentDir = process.cwd();
var packageJson,config;

exports.getZip = function(callback){
	var zipArchive = archiver('zip'); // create instance for each call

	// Load apm config.json
	// try {
	// 	var configFile = __dirname + "/config.json";
	// 	var file = fs.readFileSync(configFile, 'utf8');
	// 	config = JSON.parse(file);
	// }
	// catch(e){
	// 		console.log(prefix+colors.red("config.json not found!"));
	// }


	// check for project package.json
	try {
		var packageFile = currentDir + "/package.json";
		var file = fs.readFileSync(packageFile, 'utf8');
		packageJson = JSON.parse(file);
	}
	catch(e){
		if(e.message.indexOf("no such file")>0){
			console.log(prefix+colors.red("package.json not found"));
			return;
		}
	}

	try{
		var check = packageJson.name+packageJson.version;
	}catch(e){
		return console.log(prefix+colors.red("Invalid package.json"));
	}

	// zip folder
	console.log(prefix+"Zipping  folder");
	var zipDest = currentDir+"/../"+packageJson.name+packageJson.version+".zip";
	var output = fs.createWriteStream(zipDest);
	zipArchive.pipe(output);

	var sources = utils.getApmJSON().src || [];
	if(sources.length ==0) sources = [ '**/*' ];

	zipArchive.bulk([
	    { src: sources, cwd: currentDir, expand: true }
	]);

	zipArchive.finalize(function(err, bytes) {
    if(err) {
      throw err;
    }
	});

	output.on('close', function() {
	    callback(zipDest);
	});
}