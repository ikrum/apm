var express = require('express');
var router = express.Router();
var multipartMiddleware = require('connect-multiparty')();
var deployHandler = require('./deployHandler');
var fs = require('fs');
var config = require('./config');


router.post('/', multipartMiddleware, function(req, res, next) {
	console.log();

	if(!req.files) return sendError(res,"File not found");
	if(req.files.file.size<100) return sendError(res,"File is too small");

	// clean deploy directory
	deployHandler.cleanDirectory(config.DEPLOY_PATH);

	// Extract file directly from tmp
	var AdmZip = require('adm-zip');
	var zip = new AdmZip(req.files.file.path);
	zip.extractAllTo(config.DEPLOY_PATH ,true);

	res.status(200).json({status:200,message:"App deployed"});

	// start deploy on background
	deployHandler.deploy()

	// remove temp file on background
	fs.unlink(req.files.file.path, function(param){});
});

function sendError(res,message){
	res.status(400).json({status:400,message:message});
}

// test case
var exec = require('child_process').exec;
router.get('/', function(req,res,next){
	res.send("test");
	
});



module.exports = router;