var url  = require('url');
var ss = require('socket.io-stream');
var fs = require('fs');

exports.getURL = function(address){
  if(address.indexOf("http://")== -1 && address.indexOf("https://") == -1){
    address = "http://"+address;
  }
  var urlObj = url.parse(address);
  return urlObj.protocol + "//"+ urlObj.hostname + ":"+ 4785;
}

exports.getApmJSON = function(){
  try{
    var file = fs.readFileSync(process.cwd()+"/apm.json", 'utf8');
  }catch(err) {
    return {};
  }

  try{
    return JSON.parse(file);
  }catch(err){
    console.log("Error in parsing apm.json");
    console.log(err);
    return {};
  }
}