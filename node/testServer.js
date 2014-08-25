/*jlint node: true */
/*global require, console, __dirname */

var http = require('http');
var path = require('path');
var fs   = require('fs');
var qs   = require('querystring');

var extensions = {
  '.html' : "text/html",
  '.css' : "text/css",
  '.js' : "application/javascript",
  '.png' : "image/png",
  '.gif' : "image/gif",
  '.jpg' : "image/jpeg",
};

function requestHandler(req, res) {
  switch(req.method) {
    case 'POST':
      console.log("post: " + req.url);
      postRequest(req, res);
      break;
      
    case 'GET':
      console.log("get: " + req.url);
      getRequest(req, res);
      break;
      
    case 'HEAD':
      break;
      
    case 'PUT':
      break;
      
    case 'DELETE':
      break;
      
    case 'OPTIONS':
      break;
      
    case 'CONNECT':
      break;
      
    default:
      
  }
}

function postRequest(req, res) {
  var body = '';
  req.on('data', function(data) {
    body += data;

    // check if the post is too large
    if(body.length > 1e6) {
      req.connection.destroy();
    }
  });
  req.on('end', function() {
    var post = qs.parse(body);
  });
}
  
function getRequest(req, res) {
  var content = '';
  var filename = path.basename(req.url) || 'index.html';
  var ext = path.extname(filename);
  var localFolder = __dirname + '/public/';
  var page404 = localFolder + '404.html';
  var page404BadExtension = localFolder + '404badExtension.html';
  
  // resolve the path based on our localFolder
  var file = path.resolve(localFolder, "." + req.url);
  
  // confirm that the requested url is not trying to ge around the local folder
  if(file.lastIndexOf(localFolder, 0) !== 0) {
    // we have a problem houstan
    console.log("trying to deviate from correct path: " + file);
    getFile(page404, res, extensions[".html"]);
    return;
  }
  
  if(!extensions[ext]) {
    getFile(page404BadExtension, res, extensions[".html"], page404);
  } else {
    getFile(file, res, extensions[ext], page404);
  }
}
  
function getFile(filePath, res, mimeType, page404) {
  fs.exists(filePath, function(exists) {
    if(exists) {
      // read the file
      fs.readFile(filePath, function(err, contents) {
        if(!err) {
          res.writeHead(200, {
            "Content-Type" : mimeType,
            "Content-Length" : contents.length
          });
          res.end(contents);
        } else {
          internalError(res, err);
          console.dir(err);
        }
      });
    } else {
      if(page404 !== undefined && page404 !== null) {
        getFile(page404, res, extensions[".html"]);
      } else {
        fileNotFound(res);
      }
    }
  });
}

function fileNotFound(res, message) {
  res.writeHead(404, {'Content-Type': 'text/html'});

  res.write('<h1>404 File not found</h1>');
  if(message !== undefined && message !== null) {
    res.write('<p>' + message + '</p>');
  } else {
    res.write('<p>the request for the page could not be found</p>');
  }

  res.end();
}

function internalError(res, message) {
  res.writeHead(500, {'Content-Type': 'text/html'});

  res.write('<h1>500 Internal Error</h1>');
  res.write('<p>An internal error occured</p>');
  
  if(message !== undefined && message !== null) {
    res.write('<p>' + message + '</p>');
  }

  res.end();
}


var httpServer = http.createServer(requestHandler);

httpServer.listen(3000);
