var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var routes = require('./requestHandler');
var config = require('./config');
var deployHandler = require('./deployHandler');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({status:500, message:"Internal server error"});

});

// deploy the old app on server start / restart / crash

var packageJson = deployHandler.doesAppExists();
if(packageJson){
	console.log("Local app found !");
	deployHandler.startApp(config.PORT_A);
}

module.exports = app;
