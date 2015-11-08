#! /usr/bin/env node

var fs = require("fs");
var archiver = require('archiver');
var zipArchive = archiver('zip');
var request = require('request');
var colors = require('colors');

var prefix = colors.gray("APM ");
var apmDir = __dirname;
var currentDir = process.cwd();
var distDir = currentDir +'/'+'dist/';
var packageJson,config;

// Load apm config.json
try {
	var configFile = apmDir + "/config.json";
	var file = fs.readFileSync(configFile, 'utf8');
	config = JSON.parse(file);
}
catch(e){
	if(e.message.indexOf("no such file")>0){
		console.log(prefix+colors.red("config.json not found! Please re-install apm"));
		return;
	}
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
    console.log(prefix+'Requesting to '+config.server);

	var req = request.post(config.server, function (err, resp, body) {
	  if (err) return console.log(colors.red(err));
	  var res = JSON.parse(body);

	  if(res.status==200)
	  	return console.log(prefix+"Deploy success");
	  else if(res.status==400 || res.status==500)
	  	return console.log(prefix+colors.red(res.message));

	  //console.log(resp);
	  console.log(prefix+colors.red("No response found"));
	  
	});
	var form = req.form();
	form.append('file', fs.createReadStream(zipDest));
});


