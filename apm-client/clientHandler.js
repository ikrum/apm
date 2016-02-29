var fs = require("fs");
var archiver = require('archiver');
var zipArchive = archiver('zip');
var colors = require('colors');

var prefix = colors.gray("APM ");
var apmDir = __dirname;
var currentDir = process.cwd();
var distDir = currentDir +'/'+'dist/';
var packageJson,config;

exports.getZip = function(callback){

	// Load apm config.json
	try {
		var configFile = apmDir + "/config.json";
		var file = fs.readFileSync(configFile, 'utf8');
		config = JSON.parse(file);
	}
	catch(e){
			console.log(prefix+colors.red("config.json not found!"));
	}

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



	// check for dist folder
	if (!fs.existsSync(distDir))
		return console.log(prefix+colors.red('dist folder not found'));


	// zip dist folder
	console.log(prefix+"Zipping dist folder")
	var zipDest = currentDir+"/"+packageJson.name+packageJson.version+".zip";
	var output = fs.createWriteStream(zipDest);
	zipArchive.pipe(output);

	zipArchive.bulk([
	    { src: [ '**/*' ], cwd: distDir, expand: true }
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