#! /usr/bin/env node

var spawn = require('child_process').spawn;
var command = "export NODE_ENV=production && node "+__dirname+'/app';

// run the server
var child = spawn('sh', ['-c', command], {detached: true, stdio: ['ignore', 'ignore', 'ignore']});
child.unref();